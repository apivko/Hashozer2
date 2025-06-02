<!-- LoginForm.vue -->
<template>
  <div class="login-form">
    <h2>כניסה למערכת</h2>
    <div class="form-group">
      <input 
        type="email" 
        v-model="email" 
        placeholder="אימייל"
        :disabled="loading"
      />
      <input 
        type="password" 
        v-model="password" 
        placeholder="סיסמה"
        :disabled="loading"
      />
    </div>
    <button @click="login" :disabled="loading">
      {{ loading ? 'מתחבר...' : 'כניסה' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const auth = getAuth()

// State
const email = ref('')
const password = ref('')
const loading = ref(false)

// Login function
const login = async () => {
  if (!email.value || !password.value) {
    alert('נא למלא את כל השדות')
    return
  }

  loading.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
  } catch (error) {
    console.error('Login error:', error)
    alert('שגיאה בהתחברות: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  margin-bottom: 1rem;
}

input:last-child {
  margin-bottom: 0;
}

button {
  width: 100%;
}
</style> 