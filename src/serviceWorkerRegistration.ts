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
    "BDFt6_CYV5ca61PV7V3_ULiIjsNnikV5wxeU-4fHiFYrAeGlJ6U99C8lWSxz3aPgPe7PClp23wa2rgH25tDhj2Q";
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  registration.pushManager
    .getSubscription()
    .then((subscription) => {
      if (subscription) {
        // Desinscreva a assinatura existente se a chave for diferente
        return subscription.unsubscribe().then(() => {
          console.log("Assinatura existente desinscrita.");
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
        });
      } else {
        // Inscrever o usuário se não houver assinatura existente
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }
    })
    .then((newSubscription) => {
      console.log("Usuário inscrito para notificações push:", newSubscription);

      // Enviar a nova assinatura para o servidor para ser armazenada
      return fetch("http://localhost:3001/subscribe", {
        method: "POST",
        body: JSON.stringify(newSubscription),
        headers: {
          "Content-Type": "application/json",
        },
      });
    })
    .then((response) => {
      if (response.ok) {
        console.log("Assinatura salva no servidor.");
      } else {
        console.error("Falha ao salvar assinatura no servidor.");
      }
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
