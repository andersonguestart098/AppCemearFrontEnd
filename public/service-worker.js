const CACHE_NAME = "v1";
const urlsToCache = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching files");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log(`Service Worker: Fetch event for ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(
          `Service Worker: Returning cached response for ${event.request.url}`
        );
        return response;
      }
      console.log(
        `Service Worker: Fetching response from network for ${event.request.url}`
      );
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate event");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Service Worker: Deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event listener for push notifications
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push event recebido", event);

  const data = event.data ? event.data.json() : {};
  console.log("Dados da notificação:", data);

  const title = data.title || "Nova Notificação";
  const options = {
    body: data.body || "Você tem uma nova notificação!",
    icon: "/path/to/icon.png", // Altere para o caminho do ícone que deseja usar
    badge: "/path/to/badge.png", // Altere para o caminho do badge que deseja usar
  };

  console.log("Exibindo notificação", { title, options });
  event.waitUntil(self.registration.showNotification(title, options));
});

// Event listener for notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click event");

  event.notification.close();

  // Ativa o comportamento padrão para clicar em uma notificação, que é abrir o navegador
  event.waitUntil(clients.openWindow("/"));
});
