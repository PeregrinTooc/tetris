const CACHE_VERSION = "v-BUILD_VERSION";
const CACHE_NAME = `tetris-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
	"/tetris/",
	"/tetris/index.html",
	"/tetris/styles.css",
	"/tetris/resources/music/mainMenu.mp3",
	"/tetris/resources/music/fromLevel1.mp3",
	"/tetris/resources/music/fromLevel8.mp3",
	"/tetris/resources/music/fromLevel15.mp3",
	"/tetris/resources/sfx/hardDrop.mp3",
	"/tetris/resources/sfx/locked.mp3",
	"/tetris/resources/sfx/lineCompletion.mp3",
	"/tetris/resources/sfx/tetrisClear.mp3",
	"/tetris/resources/sfx/levelUp.mp3",
	"/tetris/resources/sfx/gameOver.mp3",
];

self.addEventListener("install", (event) => {
	console.log(`[SW] Installing service worker for ${CACHE_VERSION}`);
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log(`[SW] Caching assets for ${CACHE_NAME}`);
			return cache.addAll(ASSETS_TO_CACHE);
		})
	);
	// Don't call skipWaiting() here - let the client control it
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName.startsWith("tetris-") && cacheName !== CACHE_NAME) {
						console.log("Deleting old cache:", cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			if (response) {
				return response;
			}

			return fetch(event.request).then((response) => {
				if (!response || response.status !== 200 || response.type !== "basic") {
					return response;
				}

				const responseToCache = response.clone();
				caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, responseToCache);
				});

				return response;
			});
		})
	);
});

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});
