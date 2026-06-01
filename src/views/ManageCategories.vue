<template>
  <section>
    <h1 class="h4 text-danger mb-3">{{ uiSections.manageCategories.title }}</h1>

    <p v-if="actionMessage" class="alert alert-success py-2">{{ actionMessage }}</p>
    <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>

    <div class="row g-3">
      <div class="col-lg-5">
        <div class="card mb-3">
          <div class="card-header bg-danger text-white">{{ uiSections.manageCategories.addTitle }}</div>
          <div class="card-body">
            <form class="d-flex gap-2" @submit.prevent="submitNewCategory">
              <input v-model="newCategoryName" class="form-control" type="text" :placeholder="uiSections.manageCategories.nameLabel" />
              <button type="submit" class="btn btn-danger">{{ uiSections.manageCategories.addButtonLabel }}</button>
            </form>
          </div>
        </div>

        <div class="card" v-if="editingCategoryId">
          <div class="card-header bg-dark text-white">{{ uiSections.manageCategories.editTitle }}</div>
          <div class="card-body">
            <form class="d-flex gap-2" @submit.prevent="saveCategory">
              <input v-model="editingCategoryName" class="form-control" type="text" :placeholder="uiSections.manageCategories.nameLabel" />
              <button type="button" class="btn btn-outline-secondary" @click="cancelEdit">{{ uiSections.manageCategories.cancelButtonLabel }}</button>
              <button type="submit" class="btn btn-danger">{{ uiSections.manageCategories.saveButtonLabel }}</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th v-for="header in uiSections.manageCategories.tableHeaders" :key="header">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(category, idx) in categories" :key="category.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ category.name }}</td>
                <td>
                  <button type="button" class="btn btn-outline-primary btn-sm me-2" @click="startEdit(category)">{{ uiSections.manageCategories.editButtonLabel }}</button>
                  <button type="button" class="btn btn-outline-danger btn-sm" @click="removeCategory(category.id)">{{ uiSections.manageCategories.deleteButtonLabel }}</button>
                </td>
              </tr>
              <tr v-if="categories.length === 0">
                <td colspan="3" class="text-center">{{ uiSections.manageCategories.emptyMessage }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import uiSections from '../data/bo-cuc/muc-giao-dien.json'
import { currentUser } from '../stores/auth'
import { addCategory, categories, deleteCategory, ensureCategoriesLoaded, updateCategory } from '../stores/categories'

const newCategoryName = ref('')
const editingCategoryId = ref('')
const editingCategoryName = ref('')
const actionMessage = ref('')
const errorMessage = ref('')

onMounted(() => {
  void ensureCategoriesLoaded()
})

const startEdit = (category) => {
  actionMessage.value = ''
  errorMessage.value = ''
  editingCategoryId.value = category.id
  editingCategoryName.value = category.name
}

const cancelEdit = () => {
  editingCategoryId.value = ''
  editingCategoryName.value = ''
}

const submitNewCategory = async () => {
  actionMessage.value = ''
  errorMessage.value = ''

  const result = await addCategory(newCategoryName.value, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  newCategoryName.value = ''
  actionMessage.value = uiSections.manageCategories.addSuccessMessage
}

const saveCategory = async () => {
  actionMessage.value = ''
  errorMessage.value = ''

  const result = await updateCategory(editingCategoryId.value, editingCategoryName.value, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  actionMessage.value = uiSections.manageCategories.updateSuccessMessage
  cancelEdit()
}

const removeCategory = async (id) => {
  actionMessage.value = ''
  errorMessage.value = ''

  const accepted = confirm(uiSections.manageCategories.deleteConfirmMessage)
  if (!accepted) return

  const result = await deleteCategory(id, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  if (editingCategoryId.value === id) {
    cancelEdit()
  }

  actionMessage.value = uiSections.manageCategories.deleteSuccessMessage
}
</script>
