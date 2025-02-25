<script setup>
import { ref, onUnmounted, defineProps } from "vue";
import { initWebSocket, subscribeToUserSendPong, disconnectWebSocket } from "@/utils/ws";

const props = defineProps({
  accessToken: String,
  user: Object,
});

const isConnected = ref(false);
const pingResponse = ref("");
const error = ref(null);

const connectWebSocket = () => {
  if (props.accessToken && props.user?.id) {
    initWebSocket(props.accessToken);
    subscribeToUserSendPong(props.user.id);
    isConnected.value = true;
  }
};

const disconnect = () => {
  disconnectWebSocket();
  isConnected.value = false;
};

const sendPing = async () => {
  if (!props.accessToken) {
    error.value = "Нет токена авторизации";
    return;
  }

  error.value = null;
  pingResponse.value = "";

  try {
    const response = await fetch(import.meta.env.VITE_GQL_SERVER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${props.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `mutation { websocketPing }`,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    pingResponse.value = "WebSocket Pong: Success!";
  } catch (err) {
    error.value = `Ошибка: ${err.message}`;
  }
};

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<template>
  <div class="container">
    <h2>Welcome, {{ user?.lastName }} {{ user?.firstName }}</h2>
    <p>Your access token: {{ accessToken }}</p>

    <div class="ws-controls">
      <button @click="connectWebSocket" :disabled="isConnected">Подключиться</button>
      <button @click="disconnect" :disabled="!isConnected">Отключиться</button>
      <p v-if="isConnected">WebSocket Connection Established</p>
    </div>

    <div class="ping-container">
      <h3>WebSocket Ping</h3>
      <button @click="sendPing" :disabled="!accessToken">Отправить Ping</button>
      <p v-if="pingResponse" class="success">{{ pingResponse }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
}

.ws-controls, .ping-container {
  margin-top: 20px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
