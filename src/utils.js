export async function sha256hex(dataInput) {
  let data = dataInput;
  if (typeof data === 'string') data = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSecretPath(length = 20) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(n => ('0' + (n % 36).toString(36)).slice(-1)).join('');
}

export function generateToken(len = 32) {
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateNumericId10() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let digits = bytes.reduce((acc, val) => acc + (val % 10).toString(), '');
  if (digits[0] === '0') digits = ((bytes[0] % 9) + 1).toString() + digits.slice(1);
  return digits.substring(0, 10);
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(pair => {
    const i = pair.indexOf('=');
    if (i < 0) return;
    cookies[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  return cookies;
}

export function makeSetCookieHeader(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join('; ');
}

export function jsonResponse(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj, null, 2), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

export const isIPv4 = (s) => /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.|$)){4}$/.test(s.trim());
export const isIPv6 = (s) => /^[0-9a-f:]+$/i.test(s) && s.includes(':');

// ارتقای اعتبارسنجی برای پذیرش الگوهای دارای ستاره (Wildcard) در ابتدای دامنه
export const isValidDomain = (s) => /^(?:\*\.)?[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/.test(s.trim());

// تغییر الگوریتم تطبیق به منطق استاندارد جهانی (Wildcard vs Exact Match)
export const domainMatchesRule = (qname, ruleDomain) => {
  if (!qname || !ruleDomain) return false;
  const q = qname.toLowerCase();
  const r = ruleDomain.toLowerCase();
  
  if (r.startsWith('*.')) {
    const baseDomain = r.slice(2);
    // در حالت وایلدکارد، هم خود دامنه اصلی و هم زیردامنه‌ها مچ می‌شوند
    return q === baseDomain || q.endsWith('.' + baseDomain);
  } else {
    // در حالت عادی، فقط و فقط تطبیق دقیق (Exact Match) رخ می‌دهد
    return q === r;
  }
};

export function normalizePathServer(p) {
  let res = (p || '/').trim();
  if (!res.startsWith('/')) res = '/' + res;
  if (!res.endsWith('/')) res += '/';
  return res.replace(/\/+/g, '/');
}

export function base64UrlEncode(uint8array) {
  let binary = '';
  for (let i = 0; i < uint8array.length; i++) binary += String.fromCharCode(uint8array[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecodeToUint8Array(str) {
  const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/') + ('='.repeat((4 - str.length % 4) % 4)));
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

export const readUint16 = (buf, offset) => (buf[offset] << 8) | buf[offset + 1];
export const writeUint16 = (view, offset, val) => { view.setUint8(offset, val >> 8); view.setUint8(offset + 1, val & 0xff); };

export function parseDnsQuery(buf) {
  if (buf.length < 12) throw new Error('Short Packet');
  let offset = 12;
  const qdcount = readUint16(buf, 4);
  for (let qi = 0; qi < qdcount; qi++) {
    while (offset < buf.length && buf[offset] !== 0) {
      if ((buf[offset] & 0xC0) === 0xC0) { offset += 2; break; }
      else offset += 1 + buf[offset];
    }
    if ((buf[offset] & 0xC0) !== 0xC0) offset++; 
    offset += 4;
  }
  return { id: readUint16(buf, 0), flags: readUint16(buf, 2), qdcount, arcount: readUint16(buf, 10), questionEnd: offset };
}

export function decodeFirstQuestion(buf) {
  const labels = [];
  let offset = 12;
  while (offset < buf.length) {
    const len = buf[offset];
    if ((len & 0xC0) === 0xC0) { offset += 2; break; }
    if (len === 0) { offset++; break; }
    labels.push(String.fromCharCode.apply(null, buf.slice(offset + 1, offset + 1 + len)));
    offset += 1 + len;
  }
  return { name: labels.join('.'), qtype: readUint16(buf, offset), qclass: readUint16(buf, offset + 2) };
}

export function buildDnsResponsePreserve(queryBuf, parsed, answers, additionalBytes) {
  const questionPart = queryBuf.slice(12, parsed.questionEnd);
  let answersLen = answers.reduce((acc, a) => acc + 12 + a.data.length, 0);
  const out = new Uint8Array(12 + questionPart.length + answersLen + (additionalBytes ? additionalBytes.length : 0));
  const view = new DataView(out.buffer);
  
  writeUint16(view, 0, parsed.id);
  writeUint16(view, 2, 0x8000 | (parsed.flags & 0x0100) | 0x0080);
  writeUint16(view, 4, parsed.qdcount);
  writeUint16(view, 6, answers.length);
  writeUint16(view, 10, parsed.arcount);
  
  out.set(questionPart, 12);
  let off = 12 + questionPart.length;
  answers.forEach(a => {
    out[off++] = 0xC0; out[off++] = 0x0C;
    out[off++] = (a.type >> 8); out[off++] = a.type & 0xff;
    out[off++] = 0x00; out[off++] = 0x01;
    out[off++] = (a.ttl >> 24); out[off++] = (a.ttl >> 16); out[off++] = (a.ttl >> 8); out[off++] = a.ttl & 0xff;
    out[off++] = (a.data.length >> 8); out[off++] = a.data.length & 0xff;
    out.set(a.data, off); off += a.data.length;
  });
  if (additionalBytes) out.set(additionalBytes, off);
  return out;
}

export function buildQueryWithNewQName(originalBuf, parsed, newQName) {
  const nameBytes = [].concat(...newQName.split('.').filter(Boolean).map(l => [l.length, ...[...l].map(c => c.charCodeAt(0))]), 0);
  const nBuf = new Uint8Array(nameBytes);
  const out = new Uint8Array(12 + nBuf.length + 4);
  out.set(originalBuf.slice(0, 12), 0);
  out.set(nBuf, 12);
  const view = new DataView(out.buffer);
  writeUint16(view, 12 + nBuf.length, readUint16(originalBuf, parsed.questionEnd - 4));
  writeUint16(view, 12 + nBuf.length + 2, readUint16(originalBuf, parsed.questionEnd - 2));
  return out;
}

export function ipv4ToBytes(ip) { return new Uint8Array(ip.split('.').map(Number)); }
export function ipv6ToBytes(ip) {
  let segs = ip.split('::'), left = segs[0] ? segs[0].split(':') : [], right = segs[1] ? segs[1].split(':') : [];
  let fill = Array(8 - left.length - right.length).fill('0'), full = left.concat(fill).concat(right);
  return new Uint8Array([].concat(...full.map(h => { let n = parseInt(h || '0', 16); return [n >> 8, n & 0xff]; })));
}

export const buildDnsJsonResponse = (name, typeNum, answers) => ({
  Status: 0, TC: false, RD: true, RA: true, AD: false, CD: false,
  Question: [{ name, type: typeNum }], Answer: answers.map(a => ({ name: a.name, type: a.type, TTL: a.ttl, data: a.data }))
});

export const getMemCache = () => {
    if (!globalThis.APP_MEM_CACHE) {
        globalThis.APP_MEM_CACHE = { timestamp: 0, auth: null, routers: null, templates: null, providers: null, settings: null };
    }
    return globalThis.APP_MEM_CACHE;
};

export const invalidateMemCache = () => {
    if (globalThis.APP_MEM_CACHE) globalThis.APP_MEM_CACHE.timestamp = 0;
};

export async function syncKVData(env) {
    const cache = getMemCache();
    if (Date.now() - cache.timestamp < 300000 && cache.auth) {
        return cache;
    }
    
    const [a, r, t, p, s] = await Promise.all([
        env.CONFIG_KV.get('config:auth'),
        env.CONFIG_KV.get('config:routers'),
        env.CONFIG_KV.get('config:templates'),
        env.CONFIG_KV.get('config:providers'),
        env.CONFIG_KV.get('config:settings')
    ]);
    
    cache.auth = a ? JSON.parse(a) : null;
    cache.routers = r ? JSON.parse(r) : [];
    cache.templates = t ? JSON.parse(t) : [];
    cache.providers = p ? JSON.parse(p) : [];
    cache.settings = s ? JSON.parse(s) : { cache_ttl: 60 };
    
    if (cache.auth) cache.timestamp = Date.now();
    return cache;
}