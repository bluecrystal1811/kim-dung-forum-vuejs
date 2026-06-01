<template>
  <section v-if="post" class="row g-4">
    <div class="col-lg-8">
      <h1 class="h3 text-danger">{{ post.title }}</h1>
      <p class="text-muted">{{ postDetailSections.meta.authorPrefix }} {{ post.authorName }} {{ postDetailSections.meta.separator }} {{ post.createdAt }}</p>
      <img :src="post.image" :alt="post.title" class="img-fluid rounded mb-3" />
      <p v-for="(paragraph, index) in postParagraphs" :key="index" class="mb-3">{{ paragraph }}</p>
    </div>

    <aside class="col-lg-4">
      <div class="card mb-3">
        <div class="card-header bg-danger text-white">{{ postDetailSections.commentForm.title }}</div>
        <div class="card-body">
          <form @submit.prevent="submitComment">
            <textarea
              v-model="newComment"
              rows="4"
              class="form-control mb-2"
              :placeholder="postDetailSections.commentForm.placeholder"
            />
            <p v-if="commentError" class="text-danger small mb-2">{{ commentError }}</p>
            <p v-if="commentInfo" class="text-success small mb-2">{{ commentInfo }}</p>
            <button type="submit" class="btn btn-danger w-100">{{ postDetailSections.commentForm.submitLabel }}</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header bg-dark text-white">{{ postDetailSections.commentList.title }}</div>
        <ul class="list-group list-group-flush">
          <li v-for="comment in postComments" :key="comment.id" class="list-group-item">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <strong>{{ comment.author }}</strong>
                <p class="mb-1">{{ comment.content }}</p>
                <small class="text-muted">{{ comment.createdAt }}</small>
              </div>
              <button v-if="canDeleteComment(comment)" type="button" class="btn btn-outline-danger btn-sm" @click="removeComment(comment.id)">
                Xóa
              </button>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  </section>

  <section v-else>
    <h1 class="h4">{{ postDetailSections.notFoundMessage }}</h1>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import postDetailSections from '../data/bo-cuc/muc-chi-tiet-bai-viet.json'
import { currentUser, isModerator } from '../stores/auth'
import { addComment, deleteComment, getCommentsByPostId } from '../stores/comments'
import { getPostById } from '../stores/posts'

const route = useRoute()
const post = computed(() => getPostById(route.params.id))
const newComment = ref('')
const commentError = ref('')
const commentInfo = ref('')
const postParagraphs = computed(() => (post.value?.content ? post.value.content.split('\n\n') : []))

const postComments = computed(() => getCommentsByPostId(route.params.id))

const canDeleteComment = (comment) => isModerator.value || comment.authorId === currentUser.value?.id || comment.author === currentUser.value?.penName

const removeComment = async (id) => {
  commentError.value = ''
  commentInfo.value = ''

  const result = await deleteComment(id, currentUser.value)
  if (!result.ok) {
    commentError.value = result.message
    return
  }

  commentInfo.value = 'Đã xóa bình luận thành công.'
}

const submitComment = async () => {
  commentError.value = ''
  commentInfo.value = ''

  if (!newComment.value.trim()) {
    commentError.value = postDetailSections.commentForm.emptyError
    return
  }

  const result = await addComment({
    postId: route.params.id,
    authorId: currentUser.value?.id || null,
    author: currentUser.value?.penName || 'Khách',
    content: newComment.value,
  })

  if (!result.ok) {
    commentError.value = result.message
    return
  }

  commentInfo.value = postDetailSections.commentForm.successMessage
  newComment.value = ''
}
</script>
