import Echo from "laravel-echo";
import Pusher from "pusher-js";

// WebSocket клиент
let echo = null;

export function initWebSocket(token) {
  if (echo) return;

  window.Pusher = Pusher;
  window.Pusher.logToConsole = true;
  
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

  console.log("WebSocket initialized.");
}

export function subscribeToUserSendPong(userId) {
  if (!echo) return;
  console.log("subscribeToUserSendPong");
  echo.private(`user.${userId}`).listen(".sendPong", (event) => {
    console.log("User:", event);
  });
}

export function subscribeToUserDialogCreated(userId, callback) {
  if (!echo) return;
  console.log("subscribeToUserDialogCreated");
  echo.private(`user.${userId}`).listen(".dialogCreated", (event) => {
    console.log("New dialog received:", event);
    if (callback) {
      callback(event);
    }
  });
}

export function disconnectWebSocket() {
  if (echo) {
    echo.disconnect();
    echo = null;
    console.log("WebSocket disconnected.");
  }
}
