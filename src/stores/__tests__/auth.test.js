import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mock dependencies ---
vi.mock('../api.js', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('../mockDb.js', () => ({
  loadMockCollection: vi.fn(),
}))

vi.stubEnv('BASE_URL', '/kim-dung-forum-vuejs/')

// --- Helpers to reset module-level state between tests ---
import { apiRequest } from '../api.js'
import { loadMockCollection } from '../mockDb.js'

// We need to dynamically import auth.js to get fresh module state per test group.
// Strategy: import once, then manually reset the refs via exported values + localStorage.

import {
  users,
  currentUser,
  isLoggedIn,
  isModerator,
  login,
  register,
  logout,
  loadUsers,
  updateProfile,
  updateUser,
} from '../auth.js'

const MOCK_USERS = [
  {
    id: 'u01',
    fullName: 'Author One',
    penName: 'author1',
    email: 'author@example.com',
    password: 'pass123',
    role: 'author',
    avatar: '/images/avatar.png',
  },
  {
    id: 'u02',
    fullName: 'Moderator',
    penName: 'mod1',
    email: 'mod@example.com',
    password: 'modpass',
    role: 'moderator',
    avatar: '/images/avatar.png',
  },
]

// Reset state before each test
beforeEach(() => {
  localStorage.clear()
  users.value = [...MOCK_USERS]
  currentUser.value = null

  // Reset usersLoaded flag by re-mocking loadUsers behavior via apiRequest
  apiRequest.mockReset()
  loadMockCollection.mockReset()

  // Default: apiRequest for /users returns mock users
  apiRequest.mockImplementation(async (path) => {
    if (path === '/users') return MOCK_USERS
    return {}
  })
})

// ──────────────────────────────────────────────
// login()
// ──────────────────────────────────────────────
describe('login()', () => {
  it('A-01: đăng nhập thành công với email + password đúng', async () => {
    const result = await login('author@example.com', 'pass123')
    expect(result.ok).toBe(true)
    expect(currentUser.value?.id).toBe('u01')
  })

  it('A-02: thất bại khi sai password', async () => {
    const result = await login('author@example.com', 'wrongpass')
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
    expect(currentUser.value).toBeNull()
  })

  it('A-03: thất bại khi sai email', async () => {
    const result = await login('notfound@example.com', 'pass123')
    expect(result.ok).toBe(false)
    expect(currentUser.value).toBeNull()
  })

  it('A-04: email có khoảng trắng và chữ hoa vẫn đăng nhập được', async () => {
    const result = await login('  AUTHOR@EXAMPLE.COM  ', 'pass123')
    expect(result.ok).toBe(true)
  })
})

// ──────────────────────────────────────────────
// register()
// ──────────────────────────────────────────────
describe('register()', () => {
  it('A-05: đăng ký thành công với email mới', async () => {
    apiRequest.mockImplementation(async (path, options) => {
      if (path === '/users' && options?.method === 'POST') {
        const body = JSON.parse(options.body)
        return { ...body }
      }
      return MOCK_USERS
    })

    const result = await register({
      fullName: 'New User',
      penName: 'newuser',
      email: 'newuser@example.com',
      password: 'newpass',
    })

    expect(result.ok).toBe(true)
    expect(users.value.some((u) => u.email === 'newuser@example.com')).toBe(true)
  })

  it('A-06: thất bại khi email đã tồn tại', async () => {
    const result = await register({
      fullName: 'Dup',
      penName: 'dup',
      email: 'author@example.com',
      password: '123',
    })

    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/email/i)
  })
})

// ──────────────────────────────────────────────
// logout()
// ──────────────────────────────────────────────
describe('logout()', () => {
  it('A-07: xóa currentUser sau khi logout', async () => {
    await login('author@example.com', 'pass123')
    expect(currentUser.value).not.toBeNull()

    logout()
    expect(currentUser.value).toBeNull()
    expect(localStorage.getItem('asm_auth_user')).toBeNull()
  })
})

// ──────────────────────────────────────────────
// Computed: isLoggedIn, isModerator
// ──────────────────────────────────────────────
describe('isLoggedIn, isModerator (computed)', () => {
  it('A-08: isLoggedIn = true khi đã đăng nhập', async () => {
    await login('author@example.com', 'pass123')
    expect(isLoggedIn.value).toBe(true)
  })

  it('A-08: isLoggedIn = false khi chưa đăng nhập', () => {
    expect(isLoggedIn.value).toBe(false)
  })

  it('A-09: isModerator = true khi role là moderator', async () => {
    await login('mod@example.com', 'modpass')
    expect(isModerator.value).toBe(true)
  })

  it('A-09: isModerator = false khi role là author', async () => {
    await login('author@example.com', 'pass123')
    expect(isModerator.value).toBe(false)
  })
})

// ──────────────────────────────────────────────
// updateProfile()
// ──────────────────────────────────────────────
describe('updateProfile()', () => {
  it('A-10: thất bại khi chưa đăng nhập', async () => {
    const result = await updateProfile({ fullName: 'X', penName: 'x', email: 'x@x.com' })
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
  })
})

// ──────────────────────────────────────────────
// updateUser() — moderator only
// ──────────────────────────────────────────────
describe('updateUser()', () => {
  it('A-11: thất bại khi non-moderator cố cập nhật user', async () => {
    const nonMod = MOCK_USERS[0] // role: 'author'
    const result = await updateUser('u02', { fullName: 'Hacked', penName: 'hacker', email: 'h@h.com', badge: '', role: 'author' }, nonMod)
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
  })
})
