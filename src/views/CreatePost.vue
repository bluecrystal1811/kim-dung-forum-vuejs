<template>
  <section>
    <div class="card">
      <div class="card-header bg-danger text-white">
        <h1 class="h5 mb-0">{{ formSections.createPost.title }}</h1>
      </div>
      <div class="card-body">
        <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>
        <p v-if="success" class="alert alert-success py-2">{{ success }}</p>
        <form @submit.prevent="submitPost">
          <label class="form-label">{{ formSections.createPost.titleLabel }}</label>
          <input v-model="form.title" class="form-control mb-2" type="text" />

          <label class="form-label">{{ formSections.createPost.categoryLabel }}</label>
          <select v-model="form.category" class="form-select mb-2">
            <option v-for="category in categoryNames" :key="category" :value="category">{{ category }}</option>
          </select>

          <label class="form-label">{{ formSections.createPost.excerptLabel }}</label>
          <input v-model="form.excerpt" class="form-control mb-2" type="text" />

          <label class="form-label">{{ formSections.createPost.imageLabel }}</label>
          <input v-model="form.image" class="form-control mb-2" type="text" :placeholder="formSections.createPost.imagePlaceholder" />

          <label class="form-label">{{ formSections.createPost.contentLabel }}</label>
          <textarea v-model="form.content" rows="8" class="form-control mb-2" />

          <div class="text-end">
            <button type="submit" class="btn btn-danger">{{ formSections.createPost.submitLabel }}</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import formSections from '../data/bieu-mau/muc-bieu-mau.json'
import { currentUser } from '../stores/auth'
import { categoryNames, ensureCategoriesLoaded } from '../stores/categories'
import { addPost } from '../stores/posts'

const router = useRouter()
const success = ref('')
const errorMessage = ref('')

const form = reactive({
  title: '',
  category: 'Nhân vật',
  excerpt: '',
  content: '',
  image: '',
})

void ensureCategoriesLoaded()

const submitPost = async () => {
  success.value = ''
  errorMessage.value = ''

  if (!form.title.trim()) {
    errorMessage.value = formSections.createPost.messages.titleRequired
    return
  }

  if (!form.excerpt.trim()) {
    errorMessage.value = formSections.createPost.messages.excerptRequired
    return
  }

  if (!form.content.trim()) {
    errorMessage.value = formSections.createPost.messages.contentRequired
    return
  }

  if (!currentUser.value) {
    errorMessage.value = formSections.createPost.messages.loginRequired
    return
  }

  const result = await addPost(form, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  success.value = formSections.createPost.messages.success
  setTimeout(() => router.push('/quan-ly-bai-viet'), 500)
}
</script>
