<script setup>
import { ref, computed, onMounted } from "vue";
import LoginForm from "@/components/LoginForm.vue";
import WebSocketPing from "@/components/WebSocketPing.vue";
import DialogsList from "@/components/DialogsList.vue";
import DialogMessages from "@/components/DialogMessages.vue";

const accessToken = ref("");
const user = ref(null);
const selectedDialogId = ref(null);

const auth = computed(() => accessToken.value && user.value);

const handleLoginSuccess = (data) => {
  accessToken.value = data.accessToken;
  user.value = data.user;
};

const handleDialogSelect = (dialogId) => {
  selectedDialogId.value = dialogId;
};

// onMounted(() => {
//   const storedToken = sessionStorage.getItem("accessToken");
//   const storedUser = sessionStorage.getItem("user");

//   if (storedToken && storedUser) {
//     accessToken.value = storedToken;
//     user.value = JSON.parse(storedUser);
//   }
// });
</script>

<template>
  <div class="app-container">
    <LoginForm v-if="!auth" @loginSuccess="handleLoginSuccess" />
    <WebSocketPing v-if="auth" :accessToken="accessToken" :user="user" />
    <div v-if="auth" class="chat-container">
      <DialogsList class="dialogs-list" :accessToken="accessToken"  :user="user" @dialogSelect="handleDialogSelect" />
      <DialogMessages v-if="selectedDialogId" class="dialog-messages" :accessToken="accessToken" :dialogId="selectedDialogId" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.chat-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 500px;
}

.dialogs-list {
  width: 30%;
  max-width: 250px;
  overflow-y: auto;
  border-left: 2px solid #ddd;
  padding: 10px;
}

.dialog-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  border-right: 2px solid #ddd;
}
</style>