<template>
  <section>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 text-danger mb-0">{{ uiSections.manageUsers.title }}</h1>
    </div>

    <p v-if="actionMessage" class="alert alert-success py-2">{{ actionMessage }}</p>
    <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>

    <div class="row g-3">
      <div class="col-lg-7">
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th v-for="header in uiSections.manageUsers.tableHeaders" :key="header">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, idx) in users" :key="user.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ user.penName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>{{ user.badge }}</td>
                <td>
                  <button type="button" class="btn btn-outline-primary btn-sm me-2" @click="startEdit(user)">{{ uiSections.manageUsers.editButtonLabel }}</button>
                  <button type="button" class="btn btn-outline-danger btn-sm" :disabled="user.id === currentUser?.id" @click="removeUser(user.id)">{{ uiSections.manageUsers.deleteButtonLabel }}</button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="text-center">{{ uiSections.manageUsers.emptyMessage }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card" v-if="editingUserId">
          <div class="card-header bg-danger text-white">{{ uiSections.manageUsers.formTitle }}</div>
          <div class="card-body">
            <form class="row g-3" @submit.prevent="saveUser">
              <div class="col-12">
                <label class="form-label">{{ uiSections.manageUsers.fullNameLabel }}</label>
                <input v-model="form.fullName" class="form-control" type="text" />
              </div>
              <div class="col-12">
                <label class="form-label">{{ uiSections.manageUsers.penNameLabel }}</label>
                <input v-model="form.penName" class="form-control" type="text" />
              </div>
              <div class="col-12">
                <label class="form-label">{{ uiSections.manageUsers.emailLabel }}</label>
                <input v-model="form.email" class="form-control" type="email" />
              </div>
              <div class="col-12">
                <label class="form-label">{{ uiSections.manageUsers.badgeLabel }}</label>
                <input v-model="form.badge" class="form-control" type="text" />
              </div>
              <div class="col-12">
                <label class="form-label">{{ uiSections.manageUsers.roleLabel }}</label>
                <select v-model="form.role" class="form-select">
                  <option value="author">author</option>
                  <option value="moderator">moderator</option>
                </select>
              </div>
              <div class="col-12 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="cancelEdit">{{ uiSections.manageUsers.cancelButtonLabel }}</button>
                <button type="submit" class="btn btn-danger">{{ uiSections.manageUsers.saveButtonLabel }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import uiSections from '../data/bo-cuc/muc-giao-dien.json'
import { currentUser, deleteUser, ensureUsersLoaded, updateUser, users } from '../stores/auth'

const actionMessage = ref('')
const errorMessage = ref('')
const editingUserId = ref('')

const form = reactive({
  fullName: '',
  penName: '',
  email: '',
  badge: '',
  role: 'author',
})

onMounted(() => {
  void ensureUsersLoaded()
})

const startEdit = (user) => {
  actionMessage.value = ''
  errorMessage.value = ''
  editingUserId.value = user.id
  form.fullName = user.fullName || ''
  form.penName = user.penName || ''
  form.email = user.email || ''
  form.badge = user.badge || ''
  form.role = user.role || 'author'
}

const cancelEdit = () => {
  editingUserId.value = ''
}

const saveUser = async () => {
  actionMessage.value = ''
  errorMessage.value = ''

  if (!form.fullName.trim() || !form.penName.trim() || !form.email.trim() || !form.badge.trim()) {
    errorMessage.value = uiSections.manageUsers.requiredMessage
    return
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  if (!validEmail) {
    errorMessage.value = uiSections.manageUsers.invalidEmailMessage
    return
  }

  const result = await updateUser(editingUserId.value, form, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  actionMessage.value = uiSections.manageUsers.successMessage
  editingUserId.value = ''
}

const removeUser = async (id) => {
  actionMessage.value = ''
  errorMessage.value = ''

  const accepted = confirm(uiSections.manageUsers.deleteConfirmMessage)
  if (!accepted) return

  const result = await deleteUser(id, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  if (editingUserId.value === id) {
    editingUserId.value = ''
  }

  actionMessage.value = uiSections.manageUsers.deleteSuccessMessage
}
</script>
