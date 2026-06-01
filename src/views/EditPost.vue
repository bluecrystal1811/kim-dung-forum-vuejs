<template>
  <section>
    <div class="card">
      <div class="card-header bg-danger text-white">
        <h1 class="h5 mb-0">{{ formSections.editPost.title }}</h1>
      </div>
      <div class="card-body">
        <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>
        <p v-if="successMessage" class="alert alert-success py-2">{{ successMessage }}</p>

        <template v-if="post && canEdit">
          <form @submit.prevent="submitUpdate">
            <label class="form-label">{{ formSections.editPost.titleLabel }}</label>
            <input v-model="form.title" class="form-control mb-2" type="text" />

            <label class="form-label">{{ formSections.editPost.categoryLabel }}</label>
            <select v-model="form.category" class="form-select mb-2">
              <option v-for="category in categoryNames" :key="category" :value="category">{{ category }}</option>
            </select>

            <label class="form-label">{{ formSections.editPost.excerptLabel }}</label>
            <input v-model="form.excerpt" class="form-control mb-2" type="text" />

            <label class="form-label">{{ formSections.editPost.imageLabel }}</label>
            <input v-model="form.image" class="form-control mb-2" type="text" :placeholder="formSections.editPost.imagePlaceholder" />

            <label class="form-label">{{ formSections.editPost.contentLabel }}</label>
            <textarea v-model="form.content" rows="8" class="form-control mb-2" />

            <div class="text-end">
              <button type="submit" class="btn btn-danger">{{ formSections.editPost.submitLabel }}</button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import formSections from '../data/bieu-mau/muc-bieu-mau.json'
import { currentUser } from '../stores/auth'
import { categoryNames, ensureCategoriesLoaded } from '../stores/categories'
import { ensurePostsLoaded, getPostById, updatePost } from '../stores/posts'

const route = useRoute()
const router = useRouter()
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  title: '',
  category: '',
  excerpt: '',
  content: '',
  image: '',
})

const post = computed(() => getPostById(route.params.id))
const canEdit = computed(() => {
  if (!post.value || !currentUser.value) return false
  return currentUser.value.role === 'moderator' || post.value.authorId === currentUser.value.id
})

const hydrateForm = () => {
  if (!post.value) {
    errorMessage.value = formSections.editPost.messages.notFound
    return
  }

  if (!canEdit.value) {
    errorMessage.value = formSections.editPost.messages.forbidden
    return
  }

  form.title = post.value.title || ''
  form.category = post.value.category || categoryNames.value[0] || ''
  form.excerpt = post.value.excerpt || ''
  form.content = post.value.content || ''
  form.image = post.value.image || ''
}

onMounted(async () => {
  await Promise.all([ensurePostsLoaded(), ensureCategoriesLoaded()])
  hydrateForm()
})

const submitUpdate = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!post.value) {
    errorMessage.value = formSections.editPost.messages.notFound
    return
  }

  if (!canEdit.value) {
    errorMessage.value = formSections.editPost.messages.forbidden
    return
  }

  if (!form.title.trim()) {
    errorMessage.value = formSections.editPost.messages.titleRequired
    return
  }

  if (!form.excerpt.trim()) {
    errorMessage.value = formSections.editPost.messages.excerptRequired
    return
  }

  if (!form.content.trim()) {
    errorMessage.value = formSections.editPost.messages.contentRequired
    return
  }

  const result = await updatePost(route.params.id, form, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  successMessage.value = formSections.editPost.messages.success
  setTimeout(() => router.push('/quan-ly-bai-viet'), 500)
}
</script>
