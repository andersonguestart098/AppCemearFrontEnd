const CACHE_NAME = "v1";
const urlsToCache = ["/", "/index.html", "/manifest.json"];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching files");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Faz o SW ativar imediatamente
});

// Intercepta requisições (fetch)
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

// Ativação do SW e limpeza do cache antigo
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
  self.clients.claim(); // Garante que o novo SW tome o controle imediatamente
});

// Notificações push
self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: data.icon || "/default-icon.png",
  };

  console.log("Displaying notification with data:", data);

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Clique na notificação
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click event");

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("/"); // Abre a página principal ao clicar na notificação
    })
  );
});

// Clique na notificação
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click event");

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("/"); // Abre a página principal ao clicar na notificação
    })
  );
});


// Event listener for push notifications

self.addEventListener("push", function (event) {
  console.log("Evento de Push recebido:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: data.icon || "/default-icon.png",
  };

  console.log("Mostrando notificação com dados:", data);

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Event listener for notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click event");

  event.notification.close();

  // Ativa o comportamento padrão para clicar em uma notificação, que é abrir o navegador
  event.waitUntil(clients.openWindow("/"));
});
