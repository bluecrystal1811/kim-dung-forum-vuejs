import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api.js', () => ({ apiRequest: vi.fn() }))
vi.mock('../mockDb.js', () => ({ loadMockCollection: vi.fn() }))
vi.mock('../posts.js', () => ({
  posts: { value: [] },
  ensurePostsLoaded: vi.fn(),
}))
vi.stubEnv('BASE_URL', '/kim-dung-forum-vuejs/')

import { apiRequest } from '../api.js'
import {
  categories,
  categoryNames,
  addCategory,
  updateCategory,
} from '../categories.js'

const MOCK_CATEGORIES = [
  { id: '1', name: 'Kiếm Hiệp' },
  { id: '2', name: 'Tiên Hiệp' },
]

const MODERATOR = { id: 'u99', role: 'moderator' }
const AUTHOR = { id: 'u01', role: 'author' }

beforeEach(() => {
  categories.value = MOCK_CATEGORIES.map((c) => ({ ...c }))
  apiRequest.mockReset()
  apiRequest.mockImplementation(async (path) => {
    if (path === '/categories') return MOCK_CATEGORIES
    return {}
  })
})

// ──────────────────────────────────────────────
// addCategory()
// ──────────────────────────────────────────────
describe('addCategory()', () => {
  it('C-01: non-moderator không được thêm danh mục', async () => {
    const result = await addCategory('New Cat', AUTHOR)
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('C-02: thất bại khi tên rỗng', async () => {
    const result = await addCategory('', MODERATOR)
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('C-02: thất bại khi tên chỉ có khoảng trắng', async () => {
    const result = await addCategory('   ', MODERATOR)
    expect(result.ok).toBe(false)
  })

  it('C-03: thất bại khi danh mục trùng tên (case-insensitive)', async () => {
    const result = await addCategory('kiếm hiệp', MODERATOR)
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/tồn tại/i)
  })

  it('C-04: thêm thành công với tên hợp lệ', async () => {
    apiRequest.mockImplementation(async (path, options) => {
      const body = JSON.parse(options.body)
      return { ...body }
    })

    const result = await addCategory('Cổ Đại', MODERATOR)
    expect(result.ok).toBe(true)
    expect(categories.value.some((c) => c.name === 'Cổ Đại')).toBe(true)
  })
})

// ──────────────────────────────────────────────
// updateCategory()
// ──────────────────────────────────────────────
describe('updateCategory()', () => {
  it('non-moderator không được cập nhật danh mục', async () => {
    const result = await updateCategory('1', 'Tên Mới', AUTHOR)
    expect(result.ok).toBe(false)
  })

  it('categoryNames computed trả về đúng tên', () => {
    expect(categoryNames.value).toContain('Kiếm Hiệp')
    expect(categoryNames.value).toContain('Tiên Hiệp')
    expect(categoryNames.value.length).toBe(2)
  })
})
