import { generateSecretPath, sha256hex, syncKVData, invalidateMemCache } from './utils.js';
import { handleDoHRequest } from './dnsHandler.js';
import { handleApiRequest } from './apiHandler.js';
import { renderPanelHTML } from './panel.js';

export default {
  async fetch(request, env, ctx) {
    try {
      if (!env.CONFIG_KV) return new Response('Server Config Err: CONFIG_KV Binding Missing', { status: 500 });
      
      const url = new URL(request.url);
      const pathname = url.pathname;
      const segments = pathname.split('/').filter(Boolean);

      // خوانش بهینه اطلاعات هسته با استفاده از In-Memory Cache (صرفه‌جویی 90% در فشار به KV)
      let { auth, routers } = await syncKVData(env);
      
      if (!auth) {
        const secret = generateSecretPath(20);
        const pass = generateSecretPath(24);
        const hashed = await sha256hex(pass);
        auth = { secret_path: secret, password_hash: hashed, must_change: true };
        
        await env.CONFIG_KV.put('config:auth', JSON.stringify(auth));
        await env.CONFIG_KV.put('config:providers', JSON.stringify([
          { id: '1111111111', display_name: 'Cloudflare', url: 'https://cloudflare-dns.com/dns-query' }
        ]));
        invalidateMemCache(); // اجبار به تازه‌سازی کش در ریکوئست بعدی
        
        return new Response(JSON.stringify({ 
          msg: 'FIRST BOOT CREATED.', 
          url: `${url.origin}/${secret}/panel/`, 
          initial_password: pass 
        }), { status: 200, headers: { 'Content-Type': 'application/json' }});
      }

      const isUnderSecret = segments.length > 0 && segments[0] === auth.secret_path;
      const looksLikePanel = segments.includes('panel') || segments.includes('api');
      
      if (isUnderSecret) {
        const sub = segments[1];
        if (sub === 'panel') return new Response(renderPanelHTML(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
        if (sub === 'api') {
          const apiPath = '/' + segments.slice(2).join('/');
          return await handleApiRequest(request, apiPath, env, auth);
        }
      }

      if (!looksLikePanel || isUnderSecret) {
        if (routers) {
          for (let r of routers) {
              if(!r.custom_path) continue;
              let pathFormed = r.custom_path.endsWith('/') ? r.custom_path : r.custom_path + '/';
              let queryForm = pathname.endsWith('/') ? pathname : pathname + '/';
              
              if (queryForm.startsWith(pathFormed)) { 
                return await handleDoHRequest(request, r, env, ctx); 
              }
          }
        }
      }

      return await serveUbuntuProxy(request, url);

    } catch (globalError) {
      console.error(globalError);
      return new Response(JSON.stringify({ error: 'System Error', detail: String(globalError.stack || globalError) }), { status: 500, headers: {'content-type':'application/json'}});
    }
  }
};

async function serveUbuntuProxy(originalRequest, userURLContext) {
   const target = new URL(originalRequest.url);
   target.hostname = 'ubuntu.com'; target.port = 443;
   
   const bypassHeaders = new Headers(originalRequest.headers);
   bypassHeaders.set('Host', 'ubuntu.com'); bypassHeaders.delete('CF-Connecting-IP'); bypassHeaders.delete('x-real-ip'); bypassHeaders.delete('x-forwarded-for');

   const stealthReq = new Request(target.href, {
      method: originalRequest.method, headers: bypassHeaders,
      body: ['GET', 'HEAD', 'OPTIONS'].includes(originalRequest.method) ? null : await originalRequest.clone().arrayBuffer(),
      redirect: 'manual' 
   });

   try {
     let rawRes = await fetch(stealthReq);
     let customOutRes = new Response(rawRes.body, rawRes);
     customOutRes.headers.delete('strict-transport-security');
     
     const redirectOrigin = customOutRes.headers.get('Location');
     if ([301, 302, 307, 308].includes(customOutRes.status) && redirectOrigin) {
        let disguisedLocalRedirect = redirectOrigin.replace(/https?:\/\/ubuntu\.com/g, userURLContext.origin);
        customOutRes.headers.set('Location', disguisedLocalRedirect);
     }
     return customOutRes;
   } catch (err) { return new Response('404 Not Found', {status: 404, headers:{'content-type': 'text/plain'}}); }
}