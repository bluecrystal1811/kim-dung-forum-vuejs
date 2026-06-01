<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import formSections from '../data/bieu-mau/muc-bieu-mau.json'
import { isLoggedIn, login } from '../stores/auth'

const router = useRouter()
const route = useRoute()

const email = ref('ps46986@fpt.edu.vn')
const password = ref('123456')
const errorMessage = ref('')

const submitLogin = async () => {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = formSections.login.errors.required
    return
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  if (!validEmail) {
    errorMessage.value = formSections.login.errors.invalidEmail
    return
  }

  const result = await login(email.value, password.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  const redirect = route.query.redirect || '/'
  router.push(redirect)
}
</script>

<template>
  <section class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-dark text-white">
          <h1 class="h5 mb-0">{{ formSections.login.title }}</h1>
        </div>
        <div class="card-body">
          <p v-if="isLoggedIn" class="alert alert-success">{{ formSections.login.successLoggedIn }}</p>
          <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>
          <form @submit.prevent="submitLogin">
            <label class="form-label">{{ formSections.login.emailLabel }}</label>
            <input v-model="email" type="email" class="form-control mb-2" @keyup.enter="submitLogin" />
            <label class="form-label">{{ formSections.login.passwordLabel }}</label>
            <input v-model="password" type="password" class="form-control mb-2" @keyup.enter="submitLogin" />
            <button type="submit" class="btn btn-danger w-100">{{ formSections.login.submitLabel }}</button>
          </form>
          <RouterLink class="d-inline-block mt-3" :to="{ name: 'register' }">{{ formSections.login.registerLinkLabel }}</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>