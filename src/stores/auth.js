import { computed, ref } from 'vue'
import { apiRequest } from './api'
import { resolveAppPath } from '../utils/paths'

const AUTH_KEY = 'asm_auth_user'
const readSavedUser = () => {
  const saved = localStorage.getItem(AUTH_KEY)

  if (!saved) {
    return null
  }

  try {
    return JSON.parse(saved)
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

const usersLoaded = ref(false)

export const users = ref([])
export const currentUser = ref(readSavedUser())

const normalizeUser = (user) => ({
  ...user,
  avatar: resolveAppPath(user?.avatar),
})

export const isLoggedIn = computed(() => currentUser.value !== null)
export const isModerator = computed(() => currentUser.value?.role === 'moderator')

const setCurrentUserSession = (user) => {
  currentUser.value = user || null

  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    return
  }

  localStorage.removeItem(AUTH_KEY)
}

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const buildNextUserId = () => {
  const ids = users.value
    .map((item) => Number(String(item.id || '').replace('u', '')))
    .filter((value) => Number.isFinite(value))

  const next = ids.length ? Math.max(...ids) + 1 : 1
  return `u${String(next).padStart(2, '0')}`
}

export const loadUsers = async () => {
  try {
    const remoteUsers = await apiRequest('/users')
    users.value = Array.isArray(remoteUsers) ? remoteUsers.map(normalizeUser) : []

    if (currentUser.value) {
      const freshCurrentUser = users.value.find((item) => item.id === currentUser.value.id)
      setCurrentUserSession(freshCurrentUser || null)
    }

    usersLoaded.value = true
    return { ok: true }
  } catch {
    users.value = []
    usersLoaded.value = true
    return { ok: false, message: 'Không thể kết nối JSON Server.' }
  }
}

export const ensureUsersLoaded = async () => {
  if (!usersLoaded.value) {
    await loadUsers()
  }
}

export const login = async (email, password) => {
  await ensureUsersLoaded()

  const safeEmail = normalizeEmail(email)
  const safePassword = String(password || '').trim()
  const user = users.value.find((item) => item.email.toLowerCase() === safeEmail && item.password === safePassword)
  if (!user) return { ok: false, message: 'Email hoặc mật khẩu không đúng.' }

  setCurrentUserSession(user)
  return { ok: true }
}

export const register = async (payload) => {
  await ensureUsersLoaded()

  const safeEmail = normalizeEmail(payload.email)
  const safePassword = String(payload.password || '').trim()

  const existed = users.value.some((item) => item.email.toLowerCase() === safeEmail)
  if (existed) return { ok: false, message: 'Email đã tồn tại.' }

  const user = {
    id: buildNextUserId(),
    fullName: String(payload.fullName || '').trim(),
    penName: String(payload.penName || '').trim(),
    email: safeEmail,
    password: safePassword,
    role: 'author',
    joinedYear: new Date().getFullYear(),
    badge: 'Thành viên mới',
    avatar: '/images/avatar.png',
  }

  try {
    const created = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    })

    const normalizedCreated = normalizeUser(created)
    users.value.push(normalizedCreated)
    setCurrentUserSession(normalizedCreated)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể tạo người dùng. Vui lòng kiểm tra JSON Server.' }
  }
}

export const logout = () => {
  setCurrentUserSession(null)
}

export const updateProfile = async (payload) => {
  if (!currentUser.value) {
    return { ok: false, message: 'Bạn chưa đăng nhập.' }
  }

  const index = users.value.findIndex((item) => item.id === currentUser.value.id)
  if (index === -1) {
    return { ok: false, message: 'Không tìm thấy tài khoản hiện tại.' }
  }

  const updated = {
    ...users.value[index],
    fullName: String(payload.fullName || '').trim(),
    penName: String(payload.penName || '').trim(),
    email: normalizeEmail(payload.email),
  }

  try {
    const remoteUpdated = await apiRequest(`/users/${currentUser.value.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updated),
    })

    const normalizedUpdated = normalizeUser(remoteUpdated)
    users.value[index] = normalizedUpdated
    setCurrentUserSession(normalizedUpdated)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.' }
  }
}

export const updateUser = async (id, payload, updatedBy) => {
  await ensureUsersLoaded()

  if (updatedBy?.role !== 'moderator') {
    return { ok: false, message: 'Chỉ kiểm duyệt viên mới được phép cập nhật người dùng.' }
  }

  const index = users.value.findIndex((item) => item.id === id)
  if (index === -1) {
    return { ok: false, message: 'Không tìm thấy người dùng.' }
  }

  const normalizedEmail = normalizeEmail(payload.email)
  const duplicatedEmail = users.value.some((item) => item.id !== id && item.email.toLowerCase() === normalizedEmail)
  if (duplicatedEmail) {
    return { ok: false, message: 'Email đã tồn tại.' }
  }

  const updated = {
    ...users.value[index],
    fullName: String(payload.fullName || '').trim(),
    penName: String(payload.penName || '').trim(),
    email: normalizedEmail,
    badge: String(payload.badge || '').trim(),
    role: payload.role === 'moderator' ? 'moderator' : 'author',
  }

  try {
    const remoteUpdated = await apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updated),
    })

    const normalizedUpdated = normalizeUser(remoteUpdated)
    users.value[index] = normalizedUpdated
    if (currentUser.value?.id === normalizedUpdated.id) {
      setCurrentUserSession(normalizedUpdated)
    }

    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể cập nhật người dùng.' }
  }
}

export const deleteUser = async (id, deletedBy) => {
  await ensureUsersLoaded()

  if (deletedBy?.role !== 'moderator') {
    return { ok: false, message: 'Chỉ kiểm duyệt viên mới được phép xóa người dùng.' }
  }

  if (deletedBy.id === id) {
    return { ok: false, message: 'Không thể tự xóa tài khoản đang đăng nhập.' }
  }

  try {
    await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    })

    users.value = users.value.filter((item) => item.id !== id)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Không thể xóa người dùng.' }
  }
}
