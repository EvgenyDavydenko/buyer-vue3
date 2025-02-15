import Echo from "laravel-echo";
import Pusher from "pusher-js";

// WebSocket клиент
let echo = null;

export function initWebSocket(token, userId) {
  window.Pusher = Pusher;
  window.Pusher.logToConsole = true;

  console.log("WebSocket initializing...");

  // Подключение Laravel Echo
  echo = new Echo({
    broadcaster: "reverb",
    key: "d6afo3fjzrmflyhq6mrg",
    wsHost: import.meta.env.VITE_WEBSOCKET_HOST,
    wsPort: 80,
    wssPort: 443,
    forceTLS: false,
    encrypted: false,
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
    withCredentials: true,
    enabledTransports: ["ws"],
  });

  console.log("Subscribing to channel...");
  // Подписываемся на приватный канал
  echo.private("user." + userId).listen(".sendPong", (event) => {
    console.log("Message received:", event);
  });
}

export function disconnectWebSocket() {
  if (echo) {
    echo.disconnect();
    console.log("WebSocket disconnected.");
  }
}
