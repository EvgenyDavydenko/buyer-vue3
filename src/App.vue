<script setup>
import { ref } from "vue";
import LoginForm from "@/components/LoginForm.vue";
import WebSocketPing from "@/components/WebSocketPing.vue";

const accessToken = ref("");
const user = ref(null);

const auth = computed(() => accessToken.value && user.value);

const handleLoginSuccess = (data) => {
  accessToken.value = data.accessToken;
  user.value = data.user;
};
</script>

<template>
  <div class="app-container">
    <LoginForm v-if="!auth" @loginSuccess="handleLoginSuccess" />
    <WebSocketPing v-if="auth" :accessToken="accessToken" :user="user" />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>