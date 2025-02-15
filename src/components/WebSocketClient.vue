<script setup>
import { ref, onUnmounted, defineProps } from "vue";
import { initWebSocket, disconnectWebSocket } from "@/utils/ws";

const props = defineProps({
  accessToken: String,
  user: Object,
});

const isConnected = ref(false);

const connectWebSocket = () => {
  if (props.accessToken && props.user?.id) {
    initWebSocket(props.accessToken, props.user.id);
    isConnected.value = true;
  }
};

const disconnect = () => {
  disconnectWebSocket();
  isConnected.value = false;
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
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
}

.ws-controls {
  margin-top: 20px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
}
</style>