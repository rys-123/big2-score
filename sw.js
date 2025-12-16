// 版本号：每次修改代码后，更新这里的 vX，浏览器才会重新下载新版
const CACHE_NAME = 'big2-score-pwa-v2';

// 需要缓存的文件列表
// 注意：这里必须包含你所有的核心文件
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 1. 安装 Service Worker
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(ASSETS);
        })
    );
    // 强制立即接管，不用等待下次加载
    self.skipWaiting();
});

// 2. 激活并清理旧缓存
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // 立即接管所有页面
    return self.clients.claim();
});

// 3. 拦截网络请求（离线优先策略）
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((r) => {
            console.log('[Service Worker] Fetching resource: ' + e.request.url);
            // 如果缓存里有，直接返回缓存（离线可用）
            // 如果没有，就去网上下载
            return r || fetch(e.request).then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // 把新下载的资源也存进去（可选，这里为了稳妥暂不存动态资源）
                    return response;
                });
            });
        })
    );
});
