import { computed, ref } from 'vue'
import { apiRequest } from './api'

const postsLoaded = ref(false)

export const posts = ref([])

export const approvedPosts = computed(() => posts.value.filter((item) => item.status === 'Đã duyệt'))

export const getPostById = (id) => posts.value.find((item) => String(item.id) === String(id))

export const loadPosts = async () => {
  try {
    const remotePosts = await apiRequest('/posts')
    posts.value = Array.isArray(remotePosts) ? remotePosts : []
    postsLoaded.value = true
    return { ok: true }
  } catch {
    posts.value = []
    postsLoaded.value = true
    return { ok: false, message: 'Không thể kết nối JSON Server.' }
  }
}

export const ensurePostsLoaded = async () => {
  if (!postsLoaded.value) {
    await loadPosts()
  }
}

export const addPost = async (payload, currentUser) => {
  await ensurePostsLoaded()

  const nextId = posts.value.length ? Math.max(...posts.value.map((item) => item.id)) + 1 : 1

  const newPost = {
    id: nextId,
    title: payload.title,
    excerpt: payload.excerpt,
    content: payload.content,
    category: payload.category,
    image: payload.image || '/images/banner4.jpg',
    authorId: currentUser.id,
    authorName: currentUser.penName,
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'Chờ duyệt',
  }

  try {
    const created = await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(newPost),
    })

    posts.value.unshift(created)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể tạo bài viết. Vui lòng kiểm tra JSON Server.' }
  }
}

export const updatePost = async (id, payload, updatedBy) => {
  await ensurePostsLoaded()

  const index = posts.value.findIndex((item) => String(item.id) === String(id))
  if (index === -1) return { ok: false, message: 'Không tìm thấy bài viết.' }

  const currentPost = posts.value[index]
  if (updatedBy && updatedBy.role !== 'moderator' && currentPost.authorId !== updatedBy.id) {
    return { ok: false, message: 'Bạn không có quyền sửa bài viết này.' }
  }

  const updated = {
    ...currentPost,
    ...payload,
    status: 'Chờ duyệt',
  }

  try {
    const remoteUpdated = await apiRequest(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updated),
    })

    posts.value[index] = remoteUpdated
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể cập nhật bài viết.' }
  }
}

export const deletePost = async (id) => {
  await ensurePostsLoaded()

  try {
    await apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    })

    posts.value = posts.value.filter((item) => String(item.id) !== String(id))
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể xóa bài viết.' }
  }
}

export const approvePost = async (id, approvedBy) => {
  await ensurePostsLoaded()

  if (approvedBy?.role !== 'moderator') {
    return { ok: false, message: 'Chỉ kiểm duyệt viên mới được phép duyệt bài.' }
  }

  const index = posts.value.findIndex((item) => String(item.id) === String(id))
  if (index === -1) return { ok: false, message: 'Không tìm thấy bài viết.' }

  const updated = {
    ...posts.value[index],
    status: 'Đã duyệt',
  }

  try {
    const remoteUpdated = await apiRequest(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updated),
    })

    posts.value[index] = remoteUpdated
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể duyệt bài viết.' }
  }
}
