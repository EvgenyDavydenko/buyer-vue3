<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { initWebSocket, disconnectWebSocket } from "@/utils/ws";

const props = defineProps({
  accessToken: {
    type: String,
    required: true,
  },
  dialogId: {
    type: String,
    required: true,
  },
});

const messages = ref([]);
const newMessage = ref("");
const loading = ref(true);
const error = ref(null);

const fetchMessages = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(import.meta.env.VITE_GQL_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${props.accessToken}`,
      },
      body: JSON.stringify({
        query: `
          query ($dialogId: ID!) {
            getDialogMessages(dialogId: $dialogId) {
              id
              sender { phoneNumber }
              content
              createdAt
            }
          }
        `,
        variables: { dialogId: props.dialogId },
      }),
    });

    const data = await response.json();
    if (data.errors) throw new Error(data.errors[0].message);
    messages.value = data.data.getDialogMessages || [];
  } catch (err) {
    error.value = "Ошибка загрузки сообщений: " + err.message;
  } finally {
    loading.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const response = await fetch(import.meta.env.VITE_GQL_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${props.accessToken}`,
      },
      body: JSON.stringify({
        query: `
          mutation ($content: String!, $dialogId: ID!) {
            sendMessage(content: $content, dialogId: $dialogId) {
              id
              sender { phoneNumber }
              content
              createdAt
            }
          }
        `,
        variables: { content: newMessage.value, dialogId: props.dialogId },
      }),
    });

    const data = await response.json();
    if (data.errors) throw new Error(data.errors[0].message);

    messages.value.push(data.data.sendMessage);
    newMessage.value = "";
  } catch (err) {
    error.value = "Ошибка отправки сообщения: " + err.message;
  }
};

const addNewMessage = (message) => {
  messages.value.push(message);
};

onMounted(async () => {
  await fetchMessages();
  initWebSocket(props.accessToken, props.dialogId, addNewMessage);
});

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<template>
  <div class="chat-messages">
    <h2>Чат</h2>
    <div v-if="loading">Загрузка сообщений...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <ul v-else class="messages-list">
      <li v-for="message in messages" :key="message.id">
        <p><strong>{{ message.sender.phoneNumber }}:</strong> {{ message.content }}</p>
        <small>{{ new Date(message.createdAt).toLocaleString() }}</small>
      </li>
    </ul>
    <div class="message-input">
      <textarea v-model="newMessage" placeholder="Введите сообщение..." rows="2"></textarea>
      <button @click="sendMessage" :disabled="!newMessage.trim()">Отправить</button>
    </div>
  </div>
</template>

<style scoped>
.chat-messages {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f9f9f9;
}
.messages-list {
  list-style: none;
  padding: 0;
}
.messages-list li {
  padding: 10px;
  border-bottom: 1px solid #ccc;
}
.error {
  color: red;
}
.message-input {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
.message-input textarea {
  resize: none;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.message-input button {
  margin-top: 5px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}
.message-input button:disabled {
  background-color: #ccc;
}
</style>