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

async function checkSubscriptionExists(endpoint: string): Promise<boolean> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    console.error("User ID não encontrado no localStorage.");
    return false;
  }

  try {
    const response = await fetch(
      `https://cemear-b549eb196d7c.herokuapp.com/checkSubscription?userId=${userId}&endpoint=${encodeURIComponent(
        endpoint
      )}`
    );
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Erro ao verificar assinatura existente:", error);
    return false;
  }
}

// Função para realizar a inscrição do usuário para notificações push
export async function subscribeUserToPush(
  registration: ServiceWorkerRegistration
) {
  const vapidPublicKey =
    "BDFt6_CYV5ca61PV7V3_ULiIjsNnikV5wxeU-4fHiFYrAeGlJ6U99C8lWSxz3aPgPe7PClp23wa2rgH25tDhj2Q"; // Substitua pela sua chave pública VAPID
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  try {
    const subscription = await registration.pushManager.getSubscription();

    // Se o usuário já está inscrito, não precisa refazer a inscrição
    if (subscription) {
      const subscriptionExists = await checkSubscriptionExists(
        subscription.endpoint
      );

      if (subscriptionExists) {
        console.log(
          "Assinatura já existe no banco de dados, não é necessário criar uma nova."
        );
        return;
      }
    }

    // Se não houver assinatura ou se ela não existir no banco, inscreva novamente
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    console.log("Usuário inscrito para notificações push:", newSubscription);

    // Extrair chaves e codificar em base64
    const p256dhKey = new Uint8Array(newSubscription.getKey("p256dh")!);
    const authKey = new Uint8Array(newSubscription.getKey("auth")!);

    const keys = {
      p256dh: arrayBufferToBase64(p256dhKey),
      auth: arrayBufferToBase64(authKey),
    };

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
      "Enviando a nova assinatura para o servidor com o userId:",
      userId
    );

    // Envia a assinatura para o servidor
    await fetch("https://cemear-b549eb196d7c.herokuapp.com/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: newSubscription.endpoint,
        keys: keys,
        userId: userId, // Inclua o userId na requisição
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Assinatura salva no servidor.");
  } catch (error) {
    console.error("Erro ao inscrever o usuário para notificações push:", error);
  }
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
