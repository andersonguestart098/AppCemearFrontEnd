// src/serviceWorkerRegistration.ts

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.\d{1,3}){3}(:\d{1,5})?$/)
);

export function register() {
  if ("serviceWorker" in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      console.log("Registrando o Service Worker em localhost");

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);

          // Inscrever no Push Manager
          subscribeUserToPush(registration);
        })
        .catch((error) => {
          console.error("Erro ao registrar o Service Worker:", error);
        });
    } else {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);

          // Inscrever no Push Manager
          subscribeUserToPush(registration);
        })
        .catch((error) => {
          console.error("Erro ao registrar o Service Worker:", error);
        });
    }
  } else {
    console.warn("Service Workers não são suportados por este navegador.");
  }
}

function subscribeUserToPush(registration: ServiceWorkerRegistration) {
  const vapidPublicKey =
    "BF_dDzXcKHG9Jbdyirin5s6L7NNdNT7kQvGyQkuztdvHBQlxspD46dLUFN4NNR9NChqOItG7nIKcK6McZXeY7SE";
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    })
    .then((subscription) => {
      console.log("Usuário inscrito para notificações push:", subscription);

      // Enviar a assinatura para o servidor para ser armazenada
      fetch("http://localhost:3001/subscribe", {
        // Alterado para o endpoint correto
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "Content-Type": "application/json",
        },
      });
    })
    .catch((error) => {
      console.error(
        "Erro ao inscrever o usuário para notificações push:",
        error
      );
    });
}

// Função utilitária para converter a chave VAPID de base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
