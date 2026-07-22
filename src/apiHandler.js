import { 
  sha256hex, generateToken, parseCookies, makeSetCookieHeader, jsonResponse, 
  generateNumericId10, isValidDomain, isIPv4, isIPv6, normalizePathServer, 
  syncKVData, invalidateMemCache, ipv4ToBytes, parseDnsQuery, writeUint16, readUint16 
} from './utils.js';

function buildDnsQueryBufferForLookup(domain, typeStr) {
  const tMap = { 'A': 1, 'AAAA': 28, 'CNAME': 5, 'MX': 15, 'TXT': 16 };
  const qtype = tMap[String(typeStr).toUpperCase()] || 1;
  const parts = domain.split('.').filter(Boolean);
  let len = 1; for (const p of parts) len += p.length + 1;
  const nameBuf = new Uint8Array(len); let offset = 0;
  for (const p of parts) { 
     nameBuf[offset++] = p.length; 
     for (let i = 0; i < p.length; i++) nameBuf[offset++] = p.charCodeAt(i); 
  }
  nameBuf[offset++] = 0; 
  const buf = new Uint8Array(12 + nameBuf.length + 4);
  const view = new DataView(buf.buffer);
  view.setUint16(0, Math.floor(Math.random() * 65535), false);
  view.setUint16(2, 0x0100, false);
  view.setUint16(4, 1, false);
  buf.set(nameBuf, 12);
  view.setUint16(12 + nameBuf.length, qtype, false);
  view.setUint16(12 + nameBuf.length + 2, 1, false);
  return buf;
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

function parseDnsMessageToLookupJSON(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength < 12) throw new Error("Invalid Length");
  const buf = new Uint8Array(arrayBuffer), view = new DataView(arrayBuffer);
  const flags = view.getUint16(2);
  const rcode = flags & 0x0F;
  const qdcount = view.getUint16(4);
  const ancount = view.getUint16(6);

  function readName(off) {
      let labels = [], jump = false, orig = off, curr = off, lim = 0;
      while (lim++ < 60) {
          if (curr >= buf.length) break;
          const len = buf[curr];
          if (len === 0) { curr++; if (!jump) orig = curr; break; }
          if ((len & 0xC0) === 0xC0) {
              if (!jump) { orig = curr + 2; jump = true; }
              curr = view.getUint16(curr) & 0x3FFF;
          } else {
              curr++; let s = '';
              for (let i = 0; i < len; i++) s += String.fromCharCode(buf[curr++]);
              labels.push(s); if (!jump) orig = curr;
          }
      }
      return { name: labels.join('.'), nextOff: orig };
  }

  let offset = 12;
  for (let i = 0; i < qdcount; i++) offset = readName(offset).nextOff + 4;
  
  let answers = [];
  for (let i = 0; i < ancount; i++) {
      let rNm = readName(offset); offset = rNm.nextOff;
      const type = view.getUint16(offset), ttl = view.getUint32(offset + 4), rdlen = view.getUint16(offset + 8);
      offset += 10;
      let dataStr = "";
      try {
          if (type === 1 && rdlen === 4) dataStr = `${buf[offset]}.${buf[offset+1]}.${buf[offset+2]}.${buf[offset+3]}`;
          else if (type === 28 && rdlen === 16) {
              let segs = []; for (let j=0; j<16; j+=2) segs.push(view.getUint16(offset+j).toString(16));
              dataStr = segs.join(':').replace(/(^|:)0+/g, '$1').replace(/::+/g, '::');
              if (dataStr === ':') dataStr = '::';
          }
          else if (type === 5) dataStr = readName(offset).name;
          else if (type === 15) { dataStr = `${view.getUint16(offset)} ${readName(offset+2).name}`; }
          else if (type === 16) {
             let to = offset, tAr = [];
             while (to < offset + rdlen) { let l = buf[to++]; let s = ''; for(let k=0;k<l;k++) s += String.fromCharCode(buf[to++]); tAr.push(`"${s}"`); }
             dataStr = tAr.join(' ');
          } else dataStr = `[Type ID: ${type}] Supported as raw chunk`;
      } catch(ex) { dataStr = "[Binary Value Unsupported Decode]"; }
      answers.push({ name: rNm.name, type, TTL: ttl, data: dataStr });
      offset += rdlen;
  }
  return { status: rcode, answers };
}

async function testDohProvider(url) {
  try {
    const testQuery = buildDnsQueryBufferForLookup('google.com', 'A');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); 

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/dns-message', 'Accept': 'application/dns-message' },
      body: testQuery,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    return buf.byteLength >= 12;
  } catch (e) {
    return false;
  }
}

export async function handleApiRequest(request, apiPath, env, auth) {
  const method = request.method.toUpperCase();
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const sessionCookie = cookies['doh_session'];

  async function validateSession(token) {
    if (!token) return null; const key = `session:${token}`; const sessRaw = await env.CONFIG_KV.get(key); if (!sessRaw) return null;
    try { const sess = JSON.parse(sessRaw); if (sess.expiresAt && Date.now() > sess.expiresAt) { await env.CONFIG_KV.delete(key); return null; } return sess; } catch { return null; }
  }
  async function safeJson(req) { try { return await req.clone().json(); } catch { return null; } }

  // --- Auth & Session ---
  if (apiPath === '/login' && method === 'POST') {
    const body = await safeJson(request); const pw = String(body?.password || '');
    if (await sha256hex(pw) === auth.password_hash) {
      const token = generateToken(32), ttl = 60 * 60 * 24, sess = { token, createdAt: Date.now(), expiresAt: Date.now() + ttl * 1000 };
      await env.CONFIG_KV.put(`session:${token}`, JSON.stringify(sess), { expirationTtl: ttl });
      return jsonResponse({ ok: true, must_change: !!auth.must_change }, 200, { 'Set-Cookie': makeSetCookieHeader('doh_session', token, { maxAge: ttl, path: '/', httpOnly: true, secure: true, sameSite: 'Strict' }) });
    }
    return jsonResponse({ ok: false, error: 'Invalid credentials' }, 401);
  }
  if (apiPath === '/session' && method === 'GET') { const sess = await validateSession(sessionCookie); return sess ? jsonResponse({ authenticated: true, expiresAt: sess.expiresAt }, 200) : jsonResponse({ authenticated: false }, 200); }
  if (apiPath === '/logout' && method === 'POST') { if (sessionCookie) await env.CONFIG_KV.delete(`session:${sessionCookie}`); return jsonResponse({ ok: true }, 200, { 'Set-Cookie': makeSetCookieHeader('doh_session', '', { maxAge: 0, path: '/', httpOnly: true, secure: true, sameSite: 'Strict' }) }); }

  if (apiPath === '/change-credentials' && method === 'POST') {
    const sess = await validateSession(sessionCookie); if (!sess) return jsonResponse({ ok: false, error: 'Not authenticated' }, 401);
    const body = await safeJson(request), updated = Object.assign({}, auth);
    if (!body?.new_password && !body?.new_secret_path) return jsonResponse({ ok: false, error: 'Nothing to change' }, 400);
    if (body.new_password) updated.password_hash = await sha256hex(String(body.new_password));
    if (body.new_secret_path) { const clean = String(body.new_secret_path).replace(/[^A-Za-z0-9\-_]/g, ''); if (clean.length < 6) return jsonResponse({ ok: false, error: 'Invalid secret path' }, 400); updated.secret_path = clean; }
    updated.must_change = false; await env.CONFIG_KV.put('config:auth', JSON.stringify(updated)); invalidateMemCache(); return jsonResponse({ ok: true, secret_path: updated.secret_path });
  }

  // --- Settings (Global with Cache TTL) ---
  if (apiPath === '/settings' && (method === 'GET' || method === 'PUT')) {
      const sess = await validateSession(sessionCookie);
      if (!sess) return jsonResponse({ ok: false, error: 'Not authenticated' }, 401);

      if (method === 'GET') {
          const { settings } = await syncKVData(env);
          const responseSettings = { cache_ttl: (settings && settings.cache_ttl !== undefined) ? settings.cache_ttl : 60, updated_at: settings?.updated_at };
          return jsonResponse({ ok: true, settings: responseSettings });
      }
      if (method === 'PUT') {
          const body = await safeJson(request) || {};
          const ttl = parseInt(body?.cache_ttl, 10);
          if (isNaN(ttl) || ttl < 1 || ttl > 86400) return jsonResponse({ ok: false, error: 'Invalid cache_ttl value (1-86400 seconds)' }, 400);
          
          const { settings } = await syncKVData(env);
          const currentSettings = settings || {};
          
          // مدیریت خطای هم‌زمانی در تنظیمات با کد 409
          if (currentSettings.updated_at && body.updated_at !== currentSettings.updated_at) {
              return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);
          }
          if (currentSettings.cache_ttl === ttl) {
              return jsonResponse({ ok: true }); 
          }
          
          currentSettings.cache_ttl = ttl;
          currentSettings.updated_at = Date.now();
          await env.CONFIG_KV.put('config:settings', JSON.stringify(currentSettings));
          invalidateMemCache();
          return jsonResponse({ ok: true });
      }
  }

  // === LIVE DNS LOOKUP TOOL ===
  if (apiPath === '/dns-lookup' && method === 'POST') {
      const sess = await validateSession(sessionCookie);
      if (!sess) return jsonResponse({ ok: false, error: 'Not authenticated' }, 401);
      
      const body = await safeJson(request);
      if (!body || !body.domain || !body.type || !body.provider_id) {
         return jsonResponse({ ok: false, error: 'Missing lookup parameters' }, 400);
      }

      let targetUrl = '';
      if (body.provider_id === 'custom') {
         targetUrl = String(body.custom_url || '').trim();
         if (!targetUrl) return jsonResponse({ ok: false, error: 'Custom URL is required' }, 400);
         if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;
      } else {
         const { providers } = await syncKVData(env);
         const prov = providers.find(p => p.id === body.provider_id);
         if (!prov) return jsonResponse({ ok: false, error: 'Provider not found' }, 404);
         targetUrl = prov.url;
      }

      try {
         let binaryReqPayload = buildDnsQueryBufferForLookup(body.domain, body.type);
         if (body.ecs_enabled) {
             const clientIp = request.headers.get('CF-Connecting-IP');
             if (clientIp) binaryReqPayload = addEcsToDnsQuery(binaryReqPayload, clientIp);
         }
         const start = Date.now();
         const lookupRespCall = await fetch(targetUrl, { method: 'POST', headers: { 'Content-Type': 'application/dns-message', 'Accept': 'application/dns-message' }, body: binaryReqPayload });
         const latency_ms = Date.now() - start;
         
         if (!lookupRespCall.ok) return jsonResponse({ ok: false, error: 'Upstream DoH server failed to respond or is invalid.', latency_ms }, 200, { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' });

         const receivedBinaryObjAns = await lookupRespCall.arrayBuffer();
         let formattedExtData;
         try { formattedExtData = parseDnsMessageToLookupJSON(receivedBinaryObjAns); } catch(pe) {
             return jsonResponse({ ok: false, error: 'Upstream DoH server failed to respond or is invalid.', latency_ms }, 200, { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' });
         }

         if (formattedExtData.status === 3) return jsonResponse({ ok: false, error: 'Domain not found (NXDOMAIN).', latency_ms }, 200, { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' });
         
         const syntheticJSWrapped = { Status: formattedExtData.status, Answer: formattedExtData.answers };
         return jsonResponse({ ok: true, latency_ms, response: syntheticJSWrapped }, 200, { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' });
      } catch (err) { return jsonResponse({ ok: false, error: 'Upstream DoH server failed to respond or is invalid.' }, 200, { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }); }
  }

  // --- Providers ---
  if (apiPath === '/providers' && method === 'GET') {
    if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401);
    const { providers } = await syncKVData(env); return jsonResponse({ ok: true, providers });
  }
  if (apiPath === '/providers' && method === 'POST') {
    if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401);
    const body = await safeJson(request); 
    if (!body?.display_name || !body?.url) return jsonResponse({ ok: false, error: 'Missing display name or url' }, 400);
    
    let url = String(body.url).trim();
    if (!url.startsWith('https://')) return jsonResponse({ ok: false, error: 'DoH Server URL must start with https://' }, 400);
    if (!body.force) { const isAlive = await testDohProvider(url); if (!isAlive) return jsonResponse({ ok: false, error: 'live_test_failed', msg: 'Live connection to DoH failed.' }, 200); }

    let providers = JSON.parse(await env.CONFIG_KV.get('config:providers') || '[]');
    if (providers.some(p => p.url === url)) return jsonResponse({ ok: false, error: 'Duplicate URL' }, 400);
    
    const entry = { id: generateNumericId10(), display_name: body.display_name, url: url, updated_at: Date.now() }; 
    providers.push(entry); 
    await env.CONFIG_KV.put('config:providers', JSON.stringify(providers)); 
    invalidateMemCache(); return jsonResponse({ ok: true, provider: entry }, 201);
  }
  
  if (apiPath.startsWith('/providers/') && ['DELETE', 'PUT'].includes(method)) {
    if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401);
    const id = decodeURIComponent(apiPath.split('/')[2]); 
    let providers = JSON.parse(await env.CONFIG_KV.get('config:providers') || '[]'); 
    const idx = providers.findIndex(p => p.id === id); 
    
    // اگر آیتم قبلاً حذف شده بود، ارور 409 برگردانده می‌شود تا فرانت‌لوپ رفرش را اعمال کند
    if (idx === -1) return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);
    
    const body = await safeJson(request) || {};

    if (method === 'DELETE') { 
      if (providers[idx].updated_at && body.updated_at !== providers[idx].updated_at) return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);
      providers.splice(idx, 1); 
      await env.CONFIG_KV.put('config:providers', JSON.stringify(providers)); 
      invalidateMemCache(); return jsonResponse({ ok: true }); 
    } else { 
      if (!body?.display_name || !body?.url) return jsonResponse({ ok: false, error: 'Missing display name or url' }, 400);
      let url = String(body.url).trim();
      if (!url.startsWith('https://')) return jsonResponse({ ok: false, error: 'DoH Server URL must start with https://' }, 400);
      
      if (providers[idx].updated_at && body.updated_at !== providers[idx].updated_at) return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);
      if (providers[idx].display_name === body.display_name && providers[idx].url === url) return jsonResponse({ ok: true, provider: providers[idx] });

      if (!body.force) { const isAlive = await testDohProvider(url); if (!isAlive) return jsonResponse({ ok: false, error: 'live_test_failed', msg: 'Live connection to DoH failed.' }, 200); }

      providers[idx] = { ...providers[idx], display_name: body.display_name, url: url, updated_at: Date.now() }; 
      await env.CONFIG_KV.put('config:providers', JSON.stringify(providers)); 
      invalidateMemCache(); return jsonResponse({ ok: true, provider: providers[idx] }); 
    }
  }

  // --- Templates Rules Parser ---
  const processTemplateRulesBody = async (body, existingId = null, currentTemplates = []) => {
      if (!body || !body.name || !Array.isArray(body.rules)) throw new Error("Missing params");
      if (currentTemplates.some(t => String(t.name).toLowerCase() === String(body.name).toLowerCase() && t.id !== existingId)) throw new Error("Template name already exists");
      const domainTypes = new Map(); const seenExact = new Set(); const combinedRulesMap = new Map(); 
      for (const r of body.rules) {
          if (!r?.type || !r?.domain) throw new Error("Rule missing properties.");
          const type = String(r.type).toUpperCase(), domain = String(r.domain).trim().toLowerCase();
          if (!isValidDomain(domain)) throw new Error("Invalid domain: " + domain);
          let reg = domainTypes.get(domain); if (!reg) { reg = new Set(); domainTypes.set(domain, reg); }
          if (type === 'CNAME' && (reg.has('A') || reg.has('AAAA') || reg.has('CNAME'))) throw new Error("Exclusive violation!");
          if ((type === 'A' || type === 'AAAA') && reg.has('CNAME')) throw new Error("Cannot append A while CNAME holds focus.");
          reg.add(type); const comboKey = type + ":" + domain;

          if (type === 'A' || type === 'AAAA') {
              const tgtsRaw = String(r.targets).split(',').map(s => s.trim()).filter(Boolean);
              if (!tgtsRaw.length) throw new Error("Empty target given!");
              if (!combinedRulesMap.has(comboKey)) combinedRulesMap.set(comboKey, { type, domain, targets: [] });
              for (const t of tgtsRaw) {
                  if (type === 'A' && !isIPv4(t)) throw new Error('Invalid IPv4'); if (type === 'AAAA' && !isIPv6(t)) throw new Error('Invalid IPv6');
                  const exk = type + ':' + domain + ':' + t; if (seenExact.has(exk)) throw new Error("This exact record already exists.");
                  seenExact.add(exk); combinedRulesMap.get(comboKey).targets.push(t);
              }
          } else if (type === 'CNAME') {
             if (!r.target) throw new Error("Target expected."); const ct = String(r.target).trim().toLowerCase(); const exk = type + ':' + domain + ':' + ct;
             if (seenExact.has(exk)) throw new Error("Exact Record exist."); seenExact.add(exk); combinedRulesMap.set(comboKey, { type: 'CNAME', domain, target: ct, resolve_cname: !!r.resolve_cname });
          } else throw new Error("Bad Route");
      } return Array.from(combinedRulesMap.values());
  };

  /* ---- Templates ---- */
  if (apiPath === '/templates' && method === 'GET') {
    if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401);
    const { templates } = await syncKVData(env); return jsonResponse({ ok: true, templates });
  }
  if (apiPath === '/templates' && method === 'POST') {
     if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401);
     try {
       let templates = JSON.parse(await env.CONFIG_KV.get('config:templates') || '[]');
       const ruleReady = await processTemplateRulesBody(await safeJson(request), null, templates);
       const tEn = { id: generateNumericId10(), name: (await safeJson(request)).name, rules: ruleReady, updated_at: Date.now(), createdAt: Date.now() }; 
       templates.push(tEn); await env.CONFIG_KV.put('config:templates', JSON.stringify(templates)); invalidateMemCache(); return jsonResponse({ ok: true, template: tEn }, 201);
     } catch (e) { return jsonResponse({ ok: false, error: e.message }, 400); }
  }
  if (apiPath.startsWith('/templates/') && ['DELETE', 'PUT'].includes(method)) {
     if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401);
     const id = decodeURIComponent(apiPath.split('/')[2]); 
     let templates = JSON.parse(await env.CONFIG_KV.get('config:templates') || '[]'); 
     const idx = templates.findIndex(t => t.id === id); 
     
     if (idx === -1) return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);
     
     const body = await safeJson(request) || {};
     if (templates[idx].updated_at && body.updated_at !== templates[idx].updated_at) return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);

     if (method === 'DELETE') { 
       templates.splice(idx, 1); await env.CONFIG_KV.put('config:templates', JSON.stringify(templates)); invalidateMemCache(); return jsonResponse({ ok: true }); 
     } else { 
       try { 
         const ruleReady = await processTemplateRulesBody(body, id, templates); 
         if (templates[idx].name === body.name && JSON.stringify(templates[idx].rules) === JSON.stringify(ruleReady)) return jsonResponse({ ok: true, template: templates[idx] });
         
         templates[idx] = { ...templates[idx], name: body.name, rules: ruleReady, updated_at: Date.now() }; 
         await env.CONFIG_KV.put('config:templates', JSON.stringify(templates)); invalidateMemCache(); return jsonResponse({ ok: true, template: templates[idx] }); 
       } catch (e) { return jsonResponse({ ok: false, error: e.message }, 400); } 
     }
  }

  /* --- Routers --- */
  if (apiPath === '/routers' && method === 'GET') {
     if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401);
     const { routers } = await syncKVData(env); return jsonResponse({ ok: true, routers });
  }
  if (apiPath === '/routers' && method === 'POST') {
     if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401); const body = await safeJson(request); 
     if (!body?.custom_path || !Array.isArray(body?.upstream_ids) || body.upstream_ids.length === 0) return jsonResponse({ ok: false, error: 'Missing path or upstreams' }, 400);
     const { routers } = await syncKVData(env); const p_n = normalizePathServer(String(body.custom_path)); 
     if (routers.find(r => normalizePathServer(r.custom_path) === p_n)) return jsonResponse({ ok: false, error: 'Path used' }, 400);
     const nr = { id: generateNumericId10(), custom_path: p_n, upstream_ids: body.upstream_ids.map(String), template_ids: Array.isArray(body.template_ids) ? body.template_ids : [], ecs_enabled: !!body.ecs_enabled, updated_at: Date.now(), createdAt: Date.now() }; 
     routers.push(nr); await env.CONFIG_KV.put('config:routers', JSON.stringify(routers)); invalidateMemCache(); return jsonResponse({ ok: true, router: nr }, 201);
  }
  if (apiPath.startsWith('/routers/') && ['DELETE', 'PUT'].includes(method)) {
     if (!await validateSession(sessionCookie)) return jsonResponse({ ok: false }, 401); const id = decodeURIComponent(apiPath.split('/')[2]); const { routers } = await syncKVData(env); const idx = routers.findIndex(r => r.id === id); 
     
     if (idx === -1) return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);
     
     const body = await safeJson(request) || {};
     if (routers[idx].updated_at && body.updated_at !== routers[idx].updated_at) return jsonResponse({ ok: false, error: 'Data was modified or deleted by another session. Please refresh.' }, 409);

     if (method === 'DELETE') { 
        routers.splice(idx, 1); await env.CONFIG_KV.put('config:routers', JSON.stringify(routers)); invalidateMemCache(); return jsonResponse({ ok: true }); 
     } else { 
        const p_n = normalizePathServer(String(body.custom_path)), uIds = body.upstream_ids.map(String), tIds = body.template_ids, ecsE = !!body.ecs_enabled; 
        if (routers[idx].custom_path === p_n && routers[idx].ecs_enabled === ecsE && JSON.stringify(routers[idx].upstream_ids) === JSON.stringify(uIds) && JSON.stringify(routers[idx].template_ids) === JSON.stringify(tIds)) return jsonResponse({ ok: true, router: routers[idx] });

        routers[idx] = { ...routers[idx], custom_path: p_n, upstream_ids: uIds, template_ids: tIds, ecs_enabled: ecsE, updated_at: Date.now() }; 
        await env.CONFIG_KV.put('config:routers', JSON.stringify(routers)); invalidateMemCache(); return jsonResponse({ ok: true, router: routers[idx] }); 
     }
  }

  return jsonResponse({ ok: false, error: 'API Error' }, 404);
}