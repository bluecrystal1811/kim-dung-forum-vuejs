import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api.js', () => ({ apiRequest: vi.fn() }))
vi.mock('../mockDb.js', () => ({ loadMockCollection: vi.fn() }))
vi.stubEnv('BASE_URL', '/kim-dung-forum-vuejs/')

import { apiRequest } from '../api.js'
import {
  comments,
  getCommentsByPostId,
  commentsByPostId,
  addComment,
  deleteComment,
} from '../comments.js'

const MOCK_COMMENTS = [
  { id: 1, postId: 10, authorId: 'u01', author: 'author1', content: 'Good post!', createdAt: '10:00 - 01/01/2025' },
  { id: 2, postId: 10, authorId: 'u02', author: 'author2', content: 'Nice!', createdAt: '10:05 - 01/01/2025' },
  { id: 3, postId: 20, authorId: 'u01', author: 'author1', content: 'Great!', createdAt: '10:10 - 01/01/2025' },
]

const MODERATOR = { id: 'u99', penName: 'mod', role: 'moderator' }
const AUTHOR1 = { id: 'u01', penName: 'author1', role: 'author' }
const AUTHOR2 = { id: 'u02', penName: 'author2', role: 'author' }

beforeEach(async () => {
  comments.value = MOCK_COMMENTS.map((c) => ({ ...c }))
  apiRequest.mockReset()
  // Default: GET /comments trả về mock data, DELETE trả về null
  apiRequest.mockImplementation(async (path, options) => {
    if (!options?.method || options.method === 'GET') return MOCK_COMMENTS
    return null
  })
})

// ──────────────────────────────────────────────
// getCommentsByPostId()
// ──────────────────────────────────────────────
describe('getCommentsByPostId()', () => {
  it('CM-01: trả về đúng danh sách comment của postId', () => {
    const result = getCommentsByPostId(10)
    expect(result.length).toBe(2)
    expect(result.every((c) => c.postId === 10)).toBe(true)
  })

  it('CM-01: hoạt động với postId dạng string', () => {
    const result = getCommentsByPostId('10')
    expect(result.length).toBe(2)
  })

  it('CM-02: trả về [] khi postId không có comment', () => {
    expect(getCommentsByPostId(999)).toEqual([])
  })
})

// ──────────────────────────────────────────────
// addComment()
// ──────────────────────────────────────────────
describe('addComment()', () => {
  it('CM-03: thêm comment với đầy đủ field', async () => {
    apiRequest.mockImplementation(async (path, options) => {
      if (!options?.method || options.method === 'GET') return MOCK_COMMENTS
      return JSON.parse(options.body) // POST
    })

    const result = await addComment({
      postId: 10,
      authorId: 'u01',
      author: 'author1',
      content: 'Test comment',
    })

    expect(result.ok).toBe(true)
    const added = comments.value.find((c) => c.content === 'Test comment')
    expect(added).toBeDefined()
    expect(added?.postId).toBe(10)
    expect(added?.authorId).toBe('u01')
  })

  it('CM-03: author mặc định là "Khách" khi không truyền author', async () => {
    apiRequest.mockImplementation(async (path, options) => {
      if (!options?.method || options.method === 'GET') return MOCK_COMMENTS
      return JSON.parse(options.body)
    })

    await addComment({ postId: 10, content: 'Anonymous' })
    const added = comments.value.find((c) => c.content === 'Anonymous')
    expect(added?.author).toBe('Khách')
  })
})

// ──────────────────────────────────────────────
// deleteComment()
// ──────────────────────────────────────────────
describe('deleteComment()', () => {
  it('CM-04: thất bại khi id không tồn tại', async () => {
    const result = await deleteComment(999, MODERATOR)
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('CM-05: moderator có thể xóa bất kỳ comment', async () => {
    const result = await deleteComment(1, MODERATOR)
    expect(result.ok).toBe(true)
    expect(comments.value.find((c) => c.id === 1)).toBeUndefined()
  })

  it('CM-06: author xóa được comment của chính mình (theo authorId)', async () => {
    const result = await deleteComment(1, AUTHOR1)
    expect(result.ok).toBe(true)
  })

  it('CM-06: author không thể xóa comment của người khác', async () => {
    // Comment 1 thuộc AUTHOR1, AUTHOR2 cố xóa
    const result = await deleteComment(1, AUTHOR2)
    expect(result.ok).toBe(false)
  })
})
