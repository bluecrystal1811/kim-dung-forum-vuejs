import { computed, ref } from 'vue'
import { apiRequest } from './api'
import { loadMockCollection } from './mockDb'
import { ensurePostsLoaded, posts } from './posts'

const categoriesLoaded = ref(false)
const normalizeCategoryName = (value) => String(value || '').trim()

export const categories = ref([])

export const categoryNames = computed(() => categories.value.map((item) => item.name))

export const loadCategories = async () => {
  try {
    const remoteCategories = await apiRequest('/categories')
    categories.value = Array.isArray(remoteCategories) ? remoteCategories : []
    categoriesLoaded.value = true
    return { ok: true }
  } catch {
    try {
      const fallbackCategories = await loadMockCollection('categories')
      categories.value = fallbackCategories
      categoriesLoaded.value = true
      return { ok: true, fallback: true }
    } catch {
      categories.value = []
      categoriesLoaded.value = true
      return { ok: false, message: 'Không thể kết nối JSON Server.' }
    }
  }
}

export const ensureCategoriesLoaded = async () => {
  if (!categoriesLoaded.value) {
    await loadCategories()
  }
}

const buildNextCategoryId = () => {
  const ids = categories.value.map((item) => Number(item.id)).filter((value) => Number.isFinite(value))
  return String(ids.length ? Math.max(...ids) + 1 : 1)
}

export const addCategory = async (name, createdBy) => {
  await ensureCategoriesLoaded()

  if (createdBy?.role !== 'moderator') {
    return { ok: false, message: 'Chỉ kiểm duyệt viên mới được phép thêm danh mục.' }
  }

  const normalizedName = normalizeCategoryName(name)
  if (!normalizedName) {
    return { ok: false, message: 'Tên danh mục không được để trống.' }
  }

  const existed = categories.value.some((item) => item.name.toLowerCase() === normalizedName.toLowerCase())
  if (existed) {
    return { ok: false, message: 'Danh mục đã tồn tại.' }
  }

  try {
    const created = await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify({ id: buildNextCategoryId(), name: normalizedName }),
    })

    categories.value.push(created)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể thêm danh mục.' }
  }
}

export const updateCategory = async (id, name, updatedBy) => {
  await Promise.all([ensureCategoriesLoaded(), ensurePostsLoaded()])

  if (updatedBy?.role !== 'moderator') {
    return { ok: false, message: 'Chỉ kiểm duyệt viên mới được phép cập nhật danh mục.' }
  }

  const index = categories.value.findIndex((item) => String(item.id) === String(id))
  if (index === -1) {
    return { ok: false, message: 'Không tìm thấy danh mục.' }
  }

  const normalizedName = normalizeCategoryName(name)
  if (!normalizedName) {
    return { ok: false, message: 'Tên danh mục không được để trống.' }
  }

  const duplicated = categories.value.some((item) => String(item.id) !== String(id) && item.name.toLowerCase() === normalizedName.toLowerCase())
  if (duplicated) {
    return { ok: false, message: 'Danh mục đã tồn tại.' }
  }

  const previousName = categories.value[index].name

  try {
    const remoteUpdated = await apiRequest(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...categories.value[index], name: normalizedName }),
    })

    categories.value[index] = remoteUpdated

    const relatedPosts = posts.value.filter((item) => item.category === previousName)
    const updatedPosts = await Promise.all(
      relatedPosts.map((item) =>
        apiRequest(`/posts/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...item, category: normalizedName }),
        })
      )
    )

    updatedPosts.forEach((updatedPost) => {
      const postIndex = posts.value.findIndex((item) => String(item.id) === String(updatedPost.id))
      if (postIndex !== -1) {
        posts.value[postIndex] = updatedPost
      }
    })

    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể cập nhật danh mục.' }
  }
}

export const deleteCategory = async (id, deletedBy) => {
  await Promise.all([ensureCategoriesLoaded(), ensurePostsLoaded()])

  if (deletedBy?.role !== 'moderator') {
    return { ok: false, message: 'Chỉ kiểm duyệt viên mới được phép xóa danh mục.' }
  }

  const currentCategory = categories.value.find((item) => String(item.id) === String(id))
  if (!currentCategory) {
    return { ok: false, message: 'Không tìm thấy danh mục.' }
  }

  const usedByPosts = posts.value.some((item) => item.category === currentCategory.name)
  if (usedByPosts) {
    return { ok: false, message: 'Không thể xóa danh mục đang được sử dụng trong bài viết.' }
  }

  try {
    await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    })

    categories.value = categories.value.filter((item) => String(item.id) !== String(id))
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể xóa danh mục.' }
  }
}