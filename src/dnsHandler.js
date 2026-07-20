import { parseDnsQuery, decodeFirstQuestion, buildDnsResponsePreserve, buildDnsJsonResponse, domainMatchesRule, ipv4ToBytes, ipv6ToBytes, base64UrlEncode, base64UrlDecodeToUint8Array, buildQueryWithNewQName, sha256hex, syncKVData, readUint16, writeUint16 } from './utils.js';

function encodeDnsNameLocally(domain) {
  const parts = domain.split('.').filter(Boolean);
  let length = 1; for (const p of parts) length += p.length + 1;
  const buf = new Uint8Array(length); let offset = 0;
  for (const p of parts) { buf[offset++] = p.length; for (let i = 0; i < p.length; i++) buf[offset++] = p.charCodeAt(i); }
  buf[offset++] = 0; return buf;
}

// تابع جستجوی هوشمندانه قوانین لوکال با اولویت دادن قطعی به Exact Matches نسبت به Wildcards
function findBestMatchingRule(domain, activeRules) {
   const matches = activeRules.filter(r => domainMatchesRule(domain, r.domain));
   if (matches.length === 0) return null;
   matches.sort((a, b) => (a.domain.startsWith('*.') ? 1 : 0) - (b.domain.startsWith('*.') ? 1 : 0));
   return matches[0];
}

async function resolveLocalOrRemote(domain, typeNum, activeRules, depth = 0) {
   if (depth > 3) return [];
   
   const localMatchingRule = findBestMatchingRule(domain, activeRules);
   if (localMatchingRule) {
       if (localMatchingRule.type === 'A' && (typeNum === 1 || typeNum === 255)) {
           return localMatchingRule.targets.map(ip => ({ type: 1, data: ip, ttl: 60 })); 
       }
       if (localMatchingRule.type === 'AAAA' && (typeNum === 28 || typeNum === 255)) {
           return localMatchingRule.targets.map(ip => ({ type: 28, data: ip, ttl: 60 }));
       }
       if (localMatchingRule.type === 'CNAME') {
           return await resolveLocalOrRemote(localMatchingRule.target, typeNum, activeRules, depth + 1);
       }
       return [];
   }

   let resultAnswers = [];
   const coreURLs = [ `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${typeNum}`, `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${typeNum}` ];
   for (const checkPoint of coreURLs) {
       try {
          const apiFetchTarget = await fetch(checkPoint, { headers: { 'accept': 'application/dns-json' } });
          if(apiFetchTarget.ok) {
             const internalJSONMap = await apiFetchTarget.json();
             if (internalJSONMap.Answer && internalJSONMap.Answer.length > 0) {
                 resultAnswers = internalJSONMap.Answer; break;
             }
          }
       } catch(e) { }
   }
   
   const finalIps = resultAnswers.filter(a => a.type === 1 || a.type === 28);
   if (finalIps.length > 0) return resultAnswers;
   
   const targetCnameRec = resultAnswers.find(a => a.type === 5);
   if (targetCnameRec && targetCnameRec.data) {
       return await resolveLocalOrRemote(targetCnameRec.data, typeNum, activeRules, depth + 1);
   }
   
   return resultAnswers;
}

function addEcsToDnsQuery(queryBuf, clientIp) {
    if (!clientIp || !isIPv4(clientIp)) return queryBuf;
    const OPT_RR_TYPE = 41;
    const ECS_OPTION_CODE = 8;
    const ipBytes = ipv4ToBytes(clientIp);
    const ecsData = new Uint8Array(2 + 1 + 1 + ipBytes.length);
    const view = new DataView(ecsData.buffer);
    view.setUint16(0, 1, false);
    view.setUint8(2, 24);
    view.setUint8(3, 0);
    ecsData.set(ipBytes, 4);

    const option = new Uint8Array(2 + 2 + ecsData.length);
    const optionView = new DataView(option.buffer);
    optionView.setUint16(0, ECS_OPTION_CODE, false);
    optionView.setUint16(2, ecsData.length, false);
    option.set(ecsData, 4);

    const optRR = new Uint8Array(1 + 2 + 2 + 1 + 1 + 2 + 2 + option.length);
    const optView = new DataView(optRR.buffer);
    optRR[0] = 0;
    optView.setUint16(1, OPT_RR_TYPE, false);
    optView.setUint16(3, 4096, false);
    optView.setUint16(9, option.length, false);
    optRR.set(option, 11);

    const originalParsed = parseDnsQuery(queryBuf);
    const newBuf = new Uint8Array(originalParsed.questionEnd + optRR.length);
    newBuf.set(queryBuf.slice(0, originalParsed.questionEnd));
    newBuf.set(optRR, originalParsed.questionEnd);

    const headerView = new DataView(newBuf.buffer);
    writeUint16(headerView, 10, readUint16(queryBuf, 10) + 1);
    return newBuf;
}

export async function handleDoHRequest(request, router, env, ctx) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const accept = request.headers.get('Accept') || '';
  const isJsonApi = method === 'GET' && (accept.includes('application/dns-json') || url.searchParams.has('name'));
  
  let bodyBuffer = null;
  let hashGenStr = '';
  
  if (method === 'POST') {
    bodyBuffer = await request.clone().arrayBuffer();
    hashGenStr = await sha256hex(bodyBuffer);
  }
  
  const queryStrArgs = method === 'POST' ? `hash=${hashGenStr}` : url.searchParams.toString();
  const cacheKeyUrlStr = `${url.origin}${url.pathname}?doh_type=${isJsonApi ? 'json' : 'bin'}&acc=${encodeURIComponent(accept)}&${queryStrArgs}`;
  
  const cacheKeyReq = new Request(cacheKeyUrlStr, { method: 'GET' });
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKeyReq);
  if (cachedResponse) return cachedResponse;

  const { templates, providers, settings } = await syncKVData(env);
  const cache_ttl = settings && settings.cache_ttl !== undefined ? parseInt(settings.cache_ttl, 10) : 60;
  
  const sendCached = (resData, initDict) => {
    const freshRes = new Response(resData, initDict);
    freshRes.headers.set('Cache-Control', 'public, max-age=' + cache_ttl); 
    ctx.waitUntil(cache.put(cacheKeyReq, freshRes.clone()));
    return freshRes;
  };

  const clientIp = router.ecs_enabled ? request.headers.get('CF-Connecting-IP') : null;

  const activeRules = [];
  for (const t of templates.filter(tmpl => router.template_ids.includes(tmpl.id))) {
      if (t.rules) activeRules.push(...t.rules);
  }

  // ======== 1. JSON API =======
  if (isJsonApi) {
    const name = (url.searchParams.get('name') || '').toLowerCase();
    const typeMap = { 'A': 1, 'AAAA': 28, 'CNAME': 5 };
    const typeNum = parseInt(url.searchParams.get('type'), 10) || typeMap[url.searchParams.get('type')?.toUpperCase()] || 1;
    if (!name) return new Response('Bad Data in Dns parameters.', { status: 400 });

    const rule = findBestMatchingRule(name, activeRules);
    if (rule) {
        if (rule.type === 'A' && [1, 255].includes(typeNum)) {
          const staticRuleData = 1;
          const theJSONAns = rule.targets.map(ipAddrRaw => ({ name, type: staticRuleData, ttl: cache_ttl, data: ipAddrRaw }));
          return sendCached(JSON.stringify(buildDnsJsonResponse(name, staticRuleData, theJSONAns)), { headers: { 'Content-Type': 'application/dns-json' } });
        }
        if (rule.type === 'AAAA' && [28, 255].includes(typeNum)) {
          const staticRuleData = 28;
          const theJSONAns = rule.targets.map(ipAddrRaw => ({ name, type: staticRuleData, ttl: cache_ttl, data: ipAddrRaw }));
          return sendCached(JSON.stringify(buildDnsJsonResponse(name, staticRuleData, theJSONAns)), { headers: { 'Content-Type': 'application/dns-json' } });
        }
        if (rule.type === 'CNAME') {
           if (rule.resolve_cname) {
              const deeplyCollectedNodesIP = await resolveLocalOrRemote(rule.target, typeNum, activeRules);
              const legitimateFinalFlattenAnsArr = deeplyCollectedNodesIP.filter(arX => arX.type === typeNum || arX.type === 1 || arX.type === 28);
              if (legitimateFinalFlattenAnsArr.length > 0) {
                 const restructuredAnswsObjects = legitimateFinalFlattenAnsArr.map(zX => ({ name: name, type: zX.type, TTL: cache_ttl, data: zX.data }));
                 return sendCached(JSON.stringify(buildDnsJsonResponse(name, restructuredAnswsObjects[0].type, restructuredAnswsObjects)), { headers: { 'Content-Type': 'application/dns-json' } });
              }
           } else {
              let chased = await resolveLocalOrRemote(rule.target, typeNum, activeRules);
              let answers = [{ name, type: 5, ttl: cache_ttl, data: rule.target }];
              chased.forEach(c => {
                 if (c.type === 1 || c.type === 28) {
                    answers.push({ name: rule.target, type: c.type, ttl: cache_ttl, data: c.data });
                 }
              });
              return sendCached(JSON.stringify(buildDnsJsonResponse(name, 5, answers)), { headers: { 'Content-Type': 'application/dns-json' } });
           }
        }
    }
    return performProxyRequestJSON(router.upstream_ids, providers, name, typeNum, clientIp, sendCached);
  }

  // ======== 2. Binary DOH ====== 
  let queryBuf;
  if (method === 'GET') {
    const rawBufferRequestData64URL = url.searchParams.get('dns');
    if (!rawBufferRequestData64URL) return new Response('Bad Method Request Params Format.', { status: 400 });
    try { queryBuf = base64UrlDecodeToUint8Array(rawBufferRequestData64URL); } catch (e) { return new Response('Ill-Constructed packet array form', { status: 400 }); }
  } else queryBuf = new Uint8Array(bodyBuffer); 

  const parsed = parseDnsQuery(queryBuf), firstQ = decodeFirstQuestion(queryBuf), additionalBytes = queryBuf.slice(parsed.questionEnd);

  const rule = findBestMatchingRule(firstQ.name, activeRules);
  if (rule) {
      if (rule.type === 'A' && (firstQ.qtype === 1 || firstQ.qtype === 255)) {
        const formulatedLocalAnswerNode = rule.targets.map(oG => ({ type: 1, data: ipv4ToBytes(oG), ttl: cache_ttl }));
        return sendCached(buildDnsResponsePreserve(queryBuf, parsed, formulatedLocalAnswerNode, additionalBytes), { headers: { 'Content-Type': 'application/dns-message'} });
      }
      if (rule.type === 'AAAA' && (firstQ.qtype === 28 || firstQ.qtype === 255)) {
        const formulatedLocalAnswerNodeIPV6 = rule.targets.map(oT => ({ type: 28, data: ipv6ToBytes(oT), ttl: cache_ttl }));
        return sendCached(buildDnsResponsePreserve(queryBuf, parsed, formulatedLocalAnswerNodeIPV6, additionalBytes), { headers: { 'Content-Type': 'application/dns-message'} });
      }
      if (rule.type === 'CNAME') {
         if (rule.resolve_cname && (firstQ.qtype === 1 || firstQ.qtype === 28)) {
             let deepResolveAnswersArrayBack = await resolveLocalOrRemote(rule.target, firstQ.qtype, activeRules);
             let assembledLiveBinaryAnsArr = [];
             deepResolveAnswersArrayBack.forEach(targetFetchRecordInternalObj => {
                 if (targetFetchRecordInternalObj.type === 1) assembledLiveBinaryAnsArr.push({ type: 1, data: ipv4ToBytes(targetFetchRecordInternalObj.data), ttl: cache_ttl });
                 else if (targetFetchRecordInternalObj.type === 28) assembledLiveBinaryAnsArr.push({ type: 28, data: ipv6ToBytes(targetFetchRecordInternalObj.data), ttl: cache_ttl });
             });
             if (assembledLiveBinaryAnsArr.length > 0) {
                 return sendCached(buildDnsResponsePreserve(queryBuf, parsed, assembledLiveBinaryAnsArr, additionalBytes), { headers: { 'Content-Type': 'application/dns-message'} });
             }
         } else {
             let chased = await resolveLocalOrRemote(rule.target, firstQ.qtype, activeRules);
             const standardRecordRetrunMapObj = [ { type: 5, data: encodeDnsNameLocally(rule.target), ttl: cache_ttl } ];
             chased.forEach(c => {
                 if (c.type === 1) standardRecordRetrunMapObj.push({ type: 1, data: ipv4ToBytes(c.data), ttl: cache_ttl });
                 else if (c.type === 28) standardRecordRetrunMapObj.push({ type: 28, data: ipv6ToBytes(c.data), ttl: cache_ttl });
             });
             return sendCached(buildDnsResponsePreserve(queryBuf, parsed, standardRecordRetrunMapObj, additionalBytes), { headers: { 'Content-Type': 'application/dns-message'} });
         }
      }
  }

  let queryBufToSend = queryBuf;
  if (clientIp) {
      queryBufToSend = addEcsToDnsQuery(queryBuf, clientIp);
  }

  return fetchUpstreamDOH(router.upstream_ids, providers, queryBufToSend, sendCached);
}

async function performProxyRequestJSON(upstreamIds, allProviders, queryName, typeNum, clientIp, cacherMethod) {
    const rawFallbackReqQueryURLStrgExtensive = `https://dns.google/resolve?name=${encodeURIComponent(queryName)}&type=${typeNum}`;
    const mainUpstreamTargetReqLineToAttemptToTargetForQueryExt = allProviders.find(p => p.id === upstreamIds[0])?.url + (allProviders.find(p => p.id === upstreamIds[0])?.url.includes('?') ? '&' : '?') + `name=${encodeURIComponent(queryName)}&type=${typeNum}&ct=application/dns-json`;
    
    let executedProxyLiveAPIObjectReturnedExtNode = await fetch(mainUpstreamTargetReqLineToAttemptToTargetForQueryExt, { headers: { 'Accept': 'application/dns-json' } }).catch(() => null);
    if (!executedProxyLiveAPIObjectReturnedExtNode || !executedProxyLiveAPIObjectReturnedExtNode.ok) executedProxyLiveAPIObjectReturnedExtNode = await fetch(rawFallbackReqQueryURLStrgExtensive, { headers: { 'Accept': 'application/dns-json' }});
    
    const plainStringProxyResTargetInternalFetchedTextRawPayloadDataReadyToProxyClientDeviceResponseToReturn = await executedProxyLiveAPIObjectReturnedExtNode.text();
    return cacherMethod(plainStringProxyResTargetInternalFetchedTextRawPayloadDataReadyToProxyClientDeviceResponseToReturn, { status: executedProxyLiveAPIObjectReturnedExtNode.status, headers: { 'Content-Type': 'application/dns-json' } });
}

async function fetchUpstreamDOH(upstreamIds, allProviders, queryBuffer, cacherMethod) {
    for (const providerId of upstreamIds) {
        const provider = allProviders.find(p => p.id === providerId);
        if (!provider) continue;
        try {
            const response = await fetch(provider.url, {
                method: 'POST', headers: { 'Content-Type': 'application/dns-message', 'Accept': 'application/dns-message' }, body: queryBuffer
            });
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                return cacherMethod(arrayBuffer, { status: response.status, headers: { 'Content-Type': 'application/dns-message'} });
            }
        } catch(e) {
            console.error(`Failover: Upstream ${provider.display_name} failed. Trying next...`);
        }
    }
    return new Response('All upstream servers failed.', { status: 502 });
}