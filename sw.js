const CACHE = 'nyc-card-v2';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];
const AUDIO_IDS = [
  'stuck-01',
  'stuck-02',
  'stuck-03',
  'stuck-04',
  'stuck-05',
  'stuck-07',
  'stuck-06',
  'stuck-08',
  'room-01',
  'room-02',
  'room-03',
  'room-05',
  'room-07',
  'campus-01',
  'campus-03',
  'campus-07',
  'shops-02',
  'shops-04',
  'friends-01',
  'friends-02',
  'friends-06',
  'friends-07',
  'plans-02',
  'plans-07',
  'closer-04',
  'closer-08',
  'toy-02',
  'toy-03',
  'bye-06',
  'bye-08'
];
const AUDIO_EXT = ['mp3','webm','m4a','ogg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // core must succeed; audio is best-effort (files may not be uploaded yet)
      c.addAll(CORE).then(function(){
        return Promise.allSettled(AUDIO_IDS.map(function(id){
          return (async function(){
            for (var i=0;i<AUDIO_EXT.length;i++){
              var url='./audio/'+id+'.'+AUDIO_EXT[i];
              try{ var r=await fetch(url,{method:'HEAD'}); if(r.ok){ return c.add(url); } }catch(e){}
            }
          })();
        }));
      })
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
