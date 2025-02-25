<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { initWebSocket, disconnectWebSocket, subscribeToUserDialogCreated } from "@/utils/ws";

const props = defineProps({
  accessToken: String,
  user: Object,
});

const emit = defineEmits(["dialogSelect"]);
const dialogs = ref([]);
const error = ref(null);
const isLoading = ref(true);

const fetchDialogs = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    const response = await fetch(import.meta.env.VITE_GQL_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${props.accessToken}`,
      },
      body: JSON.stringify({
        query: `
          query {
            getDialogsList {
              id
              is_support
              buyer { id phoneNumber }
              seller { id phoneNumber }
            }
          }
        `,
      }),
    });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);

    dialogs.value = result.data.getDialogsList.map(d => ({
      ...d,
      id: Number(d.id) // Приведение к числу
    }));
  } catch (err) {
    error.value = "Ошибка загрузки диалогов: " + err.message;
    console.error("GraphQL error:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleNewDialog = (dialog) => {
  console.log("Новый диалог:", dialog);
  
  // Приводим ID к числу для сравнения
  const dialogId = Number(dialog.id);

  // Проверяем, есть ли уже такой диалог в списке
  if (!dialogs.value.some(d => Number(d.id) === dialogId)) {
    dialogs.value = [...dialogs.value, dialog]; // Создаём новый массив (реактивность)
  }
};

onMounted(() => {
  fetchDialogs();
  initWebSocket(props.accessToken);
  subscribeToUserDialogCreated(props.user.id, handleNewDialog)
});

onUnmounted(() => {
  disconnectWebSocket();
});
const hasDialogs = computed(() => dialogs.value.length > 0);
</script>

<template>
  <div class="chat-list">
    <h2>Ваши чаты</h2>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <ul v-else-if="hasDialogs" class="dialog-list">
      <li 
        v-for="dialog in dialogs" 
        :key="dialog.id" 
        class="dialog-item"
        @click="emit('dialogSelect', dialog.id)"
      >
        <p><strong>Чат ID:</strong> {{ dialog.id }}</p>
        <p v-if="dialog.is_support">Техническая поддержка</p>
        <p v-else><strong>Покупатель:</strong> {{ dialog.buyer?.phoneNumber || "Не указан" }}</p>
        <p><strong>Продавец:</strong> {{ dialog.seller?.phoneNumber || "Не указан" }}</p>
      </li>
    </ul>
    <p v-else>Чатов пока нет</p>
  </div>
</template>

<style scoped>
.chat-list {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f9f9f9;
  width: 300px;
}
.dialog-list {
  list-style: none;
  padding: 0;
}
.dialog-item {
  padding: 10px;
  margin: 5px 0;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}
.dialog-item:hover {
  background-color: #eef;
}
.error {
  color: red;
}
</style>
