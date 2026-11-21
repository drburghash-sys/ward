// Wird 3 — navigation-first refresh while preserving offline availability.
// Cache cleanup is scoped to Wird: do not touch caches belonging to other GitHub Pages apps.
const CACHE='wird-v3.0.0';
const PREFIX='wird-v';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const scope=new URL(self.registration.scope).pathname;
  if(url.origin!==self.location.origin || !url.pathname.startsWith(scope))return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const clone=res.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,clone)));}
      return res;
    }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
  }else{
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok){const clone=res.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,clone)));}
      return res;
    })));
  }
});