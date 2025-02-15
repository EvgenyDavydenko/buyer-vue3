<script setup>
import { ref } from "vue";
import LoginForm from "@/components/LoginForm.vue";
import WebSocketClient from "@/components/WebSocketClient.vue";
import WebSocketPing from "@/components/WebSocketPing.vue";

const accessToken = ref("");
const user = ref(null);

const handleLoginSuccess = (data) => {
  accessToken.value = data.accessToken;
  user.value = data.user;
};
</script>

<template>
  <div class="app-container">
    <LoginForm v-if="!user" @loginSuccess="handleLoginSuccess" />
    <WebSocketClient v-if="user" :accessToken="accessToken" :user="user" />
    <WebSocketPing v-if="user" :accessToken="accessToken" />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>