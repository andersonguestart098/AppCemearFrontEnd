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
    "BDFt6_CYV5ca61PV7V3_ULiIjsNnikV5wxeU-4fHiFYrAeGlJ6U99C8lWSxz3aPgPe7PClp23wa2rgH25tDhj2Q"; // Substitua pela sua chave pública VAPID
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    })
    .then((subscription) => {
      console.log("Usuário inscrito para notificações push:", subscription);

      // Extrair chaves e codificar em base64
      const p256dhKey = new Uint8Array(subscription.getKey("p256dh")!);
      const authKey = new Uint8Array(subscription.getKey("auth")!);

      console.log("Chave p256dh como Uint8Array:", p256dhKey);
      console.log("Chave auth como Uint8Array:", authKey);

      const keys = {
        p256dh: arrayBufferToBase64(p256dhKey),
        auth: arrayBufferToBase64(authKey),
      };

      console.log("Chave p256dh codificada em base64:", keys.p256dh);
      console.log("Chave auth codificada em base64:", keys.auth);

      // Envia a assinatura para o servidor
      return fetch("https://cemear-b549eb196d7c.herokuapp.com/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: keys,
        }),
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
  // Adiciona padding, se necessário
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    console.log("Conversão de chave VAPID bem-sucedida:", outputArray);
    return outputArray;
  } catch (error) {
    console.error("Erro ao converter chave VAPID:", error);
    throw new Error("Chave VAPID inválida");
  }
}

// Função para converter ArrayBuffer para Base64
function arrayBufferToBase64(buffer: Uint8Array) {
  return btoa(String.fromCharCode.apply(null, buffer as unknown as number[]));
}
