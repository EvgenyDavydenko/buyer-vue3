<script setup>
import { ref, defineEmits } from "vue";

const step = ref("enterPhone");
const error = ref(null);
const phoneNumber = ref("");
const logCode = ref("");

const emit = defineEmits(["loginSuccess"]);

const requestLoginCode = async () => {
  error.value = null;
  try {
    const response = await fetch(import.meta.env.VITE_GQL_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation { login(phoneNumber: "${phoneNumber.value}") }`,
      }),
    });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);

    logCode.value = result.data.login;
    step.value = "enterCode";
  } catch (err) {
    error.value = err.message;
  }
};

const confirmLogin = async () => {
  error.value = null;
  try {
    const response = await fetch(import.meta.env.VITE_GQL_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation {
            confirmationLogin(phoneNumber: "${phoneNumber.value}", logCode: "${logCode.value}") {
              accessToken
              refreshToken
              user { id firstName lastName phoneNumber }
            }
          }
        `,
      }),
    });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);

    const data = result.data.confirmationLogin;
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    emit("loginSuccess", { accessToken: data.accessToken, user: data.user });
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<template>
  <div>
    <div v-if="step === 'enterPhone'">
      <h2>Login</h2>
      <form @submit.prevent="requestLoginCode">
        <label for="phoneNumber">Phone Number:</label>
        <input v-model="phoneNumber" id="phoneNumber" type="text" placeholder="Enter your phone number" required />
        <button type="submit">Get Code</button>
      </form>
    </div>

    <div v-if="step === 'enterCode'">
      <h2>Enter Code</h2>
      <form @submit.prevent="confirmLogin">
        <label for="logCode">Code:</label>
        <input v-model="logCode" id="logCode" type="text" placeholder="Enter the code" required />
        <button type="submit">Login</button>
      </form>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>