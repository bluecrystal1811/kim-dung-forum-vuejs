<template>
  <section class="row justify-content-center">
    <div class="col-md-9 col-lg-7">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-danger text-white">
          <h1 class="h5 mb-0">{{ formSections.register.title }}</h1>
        </div>
        <div class="card-body">
          <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>
          <form @submit.prevent="submitRegister" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">{{ formSections.register.fullNameLabel }}</label>
              <input v-model="form.fullName" class="form-control" type="text" />
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ formSections.register.penNameLabel }}</label>
              <input v-model="form.penName" class="form-control" type="text" />
            </div>
            <div class="col-12">
              <label class="form-label">{{ formSections.register.emailLabel }}</label>
              <input v-model="form.email" class="form-control" type="email" />
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ formSections.register.passwordLabel }}</label>
              <input v-model="form.password" class="form-control" type="password" />
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ formSections.register.confirmPasswordLabel }}</label>
              <input v-model="form.confirmPassword" class="form-control" type="password" />
            </div>
            <div class="col-12 text-end">
              <button type="submit" class="btn btn-danger">{{ formSections.register.submitLabel }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import formSections from '../data/bieu-mau/muc-bieu-mau.json'
import { register } from '../stores/auth'

const router = useRouter()
const errorMessage = ref('')

const form = reactive({
  fullName: '',
  penName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const submitRegister = async () => {
  errorMessage.value = ''

  if (!form.fullName || !form.penName || !form.email || !form.password) {
    errorMessage.value = formSections.register.errors.required
    return
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  if (!validEmail) {
    errorMessage.value = formSections.register.errors.invalidEmail
    return
  }

  if (form.password.length < 6) {
    errorMessage.value = formSections.register.errors.passwordLength
    return
  }

  if (!form.confirmPassword) {
    errorMessage.value = formSections.register.errors.confirmRequired
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = formSections.register.errors.passwordMismatch
    return
  }

  const result = await register(form)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  router.push('/trang-ca-nhan')
}
</script>
