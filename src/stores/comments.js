import { computed, ref } from 'vue'
import { apiRequest } from './api'

const commentsLoaded = ref(false)

export const comments = ref([])

export const loadComments = async () => {
  try {
    const remoteComments = await apiRequest('/comments')
    comments.value = Array.isArray(remoteComments) ? remoteComments : []
    commentsLoaded.value = true
    return { ok: true }
  } catch {
    comments.value = []
    commentsLoaded.value = true
    return { ok: false, message: 'Không thể kết nối JSON Server.' }
  }
}

const ensureCommentsLoaded = async () => {
  if (!commentsLoaded.value) {
    await loadComments()
  }
}

const getNextCommentId = () => {
  const ids = comments.value.map((item) => Number(item.id)).filter((value) => Number.isFinite(value))
  return ids.length ? Math.max(...ids) + 1 : 1
}

const formatCommentDateTime = () => {
  const now = new Date()
  const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${time} - ${day}/${month}/${year}`
}

export const commentsByPostId = computed(() => {
  const groups = new Map()

  comments.value.forEach((item) => {
    const key = String(item.postId)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(item)
  })

  return groups
})

export const getCommentsByPostId = (postId) => commentsByPostId.value.get(String(postId)) || []

export const addComment = async (payload) => {
  await ensureCommentsLoaded()

  const newComment = {
    id: getNextCommentId(),
    postId: Number(payload.postId),
    authorId: payload.authorId || null,
    author: String(payload.author || 'Khách').trim(),
    content: String(payload.content || '').trim(),
    createdAt: formatCommentDateTime(),
  }

  try {
    const created = await apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(newComment),
    })

    comments.value.push(created)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể gửi bình luận. Vui lòng thử lại.' }
  }
}

export const deleteComment = async (id, deletedBy) => {
  await ensureCommentsLoaded()

  const currentComment = comments.value.find((item) => String(item.id) === String(id))
  if (!currentComment) {
    return { ok: false, message: 'Không tìm thấy bình luận.' }
  }

  const canDelete = deletedBy?.role === 'moderator'
    || currentComment.authorId === deletedBy?.id
    || currentComment.author === deletedBy?.penName

  if (!canDelete) {
    return { ok: false, message: 'Bạn không có quyền xóa bình luận này.' }
  }

  try {
    await apiRequest(`/comments/${id}`, {
      method: 'DELETE',
    })
    comments.value = comments.value.filter((item) => String(item.id) !== String(id))
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể xóa bình luận.' }
  }
}
