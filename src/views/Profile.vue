<template>
  <section class="row g-4" v-if="currentUser">
    <div class="col-lg-4">
      <div class="card">
        <img :src="currentUser.avatar" class="card-img-top profile-avatar" alt="Avatar" />
        <div class="card-body">
          <h1 class="h5 mb-1">{{ currentUser.penName }}</h1>
          <p class="text-muted mb-2">{{ formSections.profile.memberSincePrefix }} {{ currentUser.joinedYear }}</p>
          <span class="badge text-bg-danger">{{ currentUser.badge }}</span>
        </div>
      </div>
    </div>

    <div class="col-lg-8">
      <div class="card">
        <div class="card-header bg-danger text-white">
          <h2 class="h5 mb-0">{{ formSections.profile.title }}</h2>
        </div>
        <div class="card-body">
          <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>
          <p v-if="successMessage" class="alert alert-success py-2">{{ successMessage }}</p>
          <form class="row g-3" @submit.prevent="saveProfile">
            <div class="col-md-6">
              <label class="form-label">{{ formSections.profile.fullNameLabel }}</label>
              <input v-model="form.fullName" class="form-control" type="text" />
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ formSections.profile.penNameLabel }}</label>
              <input v-model="form.penName" class="form-control" type="text" />
            </div>
            <div class="col-12">
              <label class="form-label">{{ formSections.profile.emailLabel }}</label>
              <input v-model="form.email" class="form-control" type="email" />
            </div>
            <div class="col-12 text-end">
              <button type="submit" class="btn btn-danger">{{ formSections.profile.submitLabel }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import formSections from '../data/bieu-mau/muc-bieu-mau.json'
import { currentUser, updateProfile } from '../stores/auth'

const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  fullName: currentUser.value?.fullName || '',
  penName: currentUser.value?.penName || '',
  email: currentUser.value?.email || '',
})

const saveProfile = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.fullName.trim() || !form.penName.trim() || !form.email.trim()) {
    errorMessage.value = formSections.profile.messages.required
    return
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  if (!validEmail) {
    errorMessage.value = formSections.profile.messages.invalidEmail
    return
  }

  const result = await updateProfile(form)
  if (!result?.ok) {
    errorMessage.value = result?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'
    return
  }

  successMessage.value = formSections.profile.messages.success
}
</script>