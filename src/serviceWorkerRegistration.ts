// src/serviceWorkerRegistration.ts

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.\d{1,3}){3}(:\d{1,5})?$/)
);

// Função para registrar o service worker
export function register() {
  if ("serviceWorker" in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      console.log("Registrando o Service Worker em localhost");

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);
          // A inscrição para notificações agora é feita apenas após o login
        })
        .catch((error) => {
          console.error("Erro ao registrar o Service Worker:", error);
        });
    } else {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);
          // A inscrição para notificações agora é feita apenas após o login
        })
        .catch((error) => {
          console.error("Erro ao registrar o Service Worker:", error);
        });
    }
  } else {
    console.warn("Service Workers não são suportados por este navegador.");
  }
}

// Função para realizar a inscrição do usuário para notificações push
export function subscribeUserToPush(registration: ServiceWorkerRegistration) {
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

      const keys = {
        p256dh: arrayBufferToBase64(p256dhKey),
        auth: arrayBufferToBase64(authKey),
      };

      // Recuperar o userId de onde ele está armazenado (localStorage, ou sessionStorage)
      const userId = getUserIdFromLocalStorage();

      if (!userId) {
        throw new Error(
          "User ID não encontrado. O usuário precisa estar logado."
        );
      }

      // Verificar se o userId tem o formato de ObjectId do MongoDB (24 caracteres)
      if (!/^[a-f\d]{24}$/i.test(userId)) {
        throw new Error(
          "User ID inválido. Deve ser um ObjectId de 24 caracteres."
        );
      }

      console.log(
        "Enviando a assinatura para o servidor com o userId:",
        userId
      );
      console.log("Chaves a serem enviadas:", keys);

      // Envia a assinatura para o servidor
      return fetch("https://cemear-b549eb196d7c.herokuapp.com/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: keys,
          userId: userId, // Inclua o userId na requisição
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

// Função para capturar o userId corretamente do localStorage
function getUserIdFromLocalStorage(): string | null {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.error("User ID não encontrado no localStorage.");
    return null;
  }

  console.log("User ID recuperado do localStorage:", userId);
  return userId;
}

// Após login bem-sucedido, certifique-se de que o userId seja armazenado corretamente
export function handleLoginSuccess(response: any) {
  const userId = response.data.userId; // Certifique-se de que este é o _id correto do MongoDB

  if (!userId || !/^[a-f\d]{24}$/i.test(userId)) {
    throw new Error("User ID inválido após login.");
  }

  // Armazenar o userId no localStorage após login
  localStorage.setItem("userId", userId);
  console.log("User ID salvo no localStorage:", localStorage.getItem("userId"));
}

// Função utilitária para converter a chave VAPID de base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
function arrayBufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, buffer as unknown as number[]));
}
