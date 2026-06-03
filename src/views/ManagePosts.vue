<template>
  <section>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 text-danger mb-0">{{ pageTitle }}</h1>
      <RouterLink :to="{ name: 'create-post' }" class="btn btn-danger btn-sm">{{ uiSections.managePosts.addButtonLabel }}</RouterLink>
    </div>

    <p v-if="actionMessage" class="alert alert-success py-2">{{ actionMessage }}</p>
    <p v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</p>

    <div class="table-responsive">
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th v-for="header in uiSections.managePosts.tableHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(post, idx) in visiblePosts" :key="post.id">
            <td>{{ idx + 1 }}</td>
            <td>{{ post.title }}</td>
            <td>{{ post.category }}</td>
            <td>{{ post.createdAt }}</td>
            <td>
              <span class="badge" :class="post.status === 'Đã duyệt' ? 'text-bg-success' : 'text-bg-warning'">{{ post.status }}</span>
            </td>
            <td>
              <RouterLink :to="{ name: 'post-detail', params: { id: post.id } }" class="btn btn-outline-primary btn-sm me-2">
                {{ uiSections.managePosts.viewButtonLabel }}
              </RouterLink>
              <RouterLink v-if="canEdit(post)" :to="{ name: 'edit-post', params: { id: post.id } }" class="btn btn-outline-secondary btn-sm me-2">
                {{ uiSections.managePosts.editButtonLabel }}
              </RouterLink>
              <button
                v-if="isModerator && post.status !== 'Đã duyệt'"
                type="button"
                class="btn btn-outline-success btn-sm me-2"
                @click="approve(post.id)"
              >
                {{ uiSections.managePosts.approveButtonLabel }}
              </button>
              <button v-if="canDelete(post)" type="button" class="btn btn-outline-danger btn-sm" @click="removePost(post.id)">{{ uiSections.managePosts.deleteButtonLabel }}</button>
            </td>
          </tr>
          <tr v-if="visiblePosts.length === 0">
            <td colspan="6" class="text-center">{{ uiSections.managePosts.emptyMessage }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import uiSections from '../data/bo-cuc/muc-giao-dien.json'
import { currentUser, isModerator } from '../stores/auth'
import { approvePost, deletePost, posts } from '../stores/posts'

const actionMessage = ref('')
const errorMessage = ref('')

const visiblePosts = computed(() => {
  if (isModerator.value) {
    return posts.value
  }

  return posts.value.filter((item) => item.authorId === currentUser.value?.id)
})

const pageTitle = computed(() => (isModerator.value ? uiSections.managePosts.moderatorTitle : uiSections.managePosts.title))

const canEdit = (post) => post.authorId === currentUser.value?.id || isModerator.value
const canDelete = (post) => currentUser.value?.role === 'moderator' || post.authorId === currentUser.value?.id

const approve = async (id) => {
  actionMessage.value = ''
  errorMessage.value = ''

  const result = await approvePost(id, currentUser.value)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  actionMessage.value = uiSections.managePosts.approveSuccessMessage
}

const removePost = async (id) => {
  actionMessage.value = ''
  errorMessage.value = ''

  const accepted = confirm(uiSections.managePosts.deleteConfirmMessage)
  if (!accepted) return

  const result = await deletePost(id)
  if (!result.ok) {
    errorMessage.value = result.message
  }
}
</script>