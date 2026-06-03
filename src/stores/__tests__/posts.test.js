import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api.js', () => ({ apiRequest: vi.fn() }))
vi.mock('../mockDb.js', () => ({ loadMockCollection: vi.fn() }))
vi.stubEnv('BASE_URL', '/kim-dung-forum-vuejs/')

import { apiRequest } from '../api.js'
import {
  posts,
  approvedPosts,
  getPostById,
  addPost,
  updatePost,
  deletePost,
  approvePost,
  loadPosts,
} from '../posts.js'

const MOCK_POSTS = [
  { id: 1, title: 'Post A', status: 'Đã duyệt', authorId: 'u01', category: 'Cat1', image: '/images/a.jpg' },
  { id: 2, title: 'Post B', status: 'Chờ duyệt', authorId: 'u01', category: 'Cat2', image: '/images/b.jpg' },
  { id: 3, title: 'Post C', status: 'Đã duyệt', authorId: 'u02', category: 'Cat1', image: '/images/c.jpg' },
]

const AUTHOR = { id: 'u01', penName: 'author1', role: 'author' }
const MODERATOR = { id: 'u99', penName: 'mod', role: 'moderator' }

beforeEach(() => {
  posts.value = MOCK_POSTS.map((p) => ({ ...p }))
  apiRequest.mockReset()
  apiRequest.mockImplementation(async (path, options) => {
    if (!options || options.method === undefined) return MOCK_POSTS
    return {}
  })
})

// ──────────────────────────────────────────────
// getPostById()
// ──────────────────────────────────────────────
describe('getPostById()', () => {
  it('PO-01: trả về đúng post khi id hợp lệ', () => {
    const post = getPostById(1)
    expect(post?.title).toBe('Post A')
  })

  it('PO-01: so khớp id dạng string và number', () => {
    const post = getPostById('2')
    expect(post?.title).toBe('Post B')
  })

  it('PO-02: trả về undefined khi id không tồn tại', () => {
    expect(getPostById(999)).toBeUndefined()
  })
})

// ──────────────────────────────────────────────
// approvedPosts computed
// ──────────────────────────────────────────────
describe('approvedPosts (computed)', () => {
  it('PO-03: chỉ trả về post có status "Đã duyệt"', () => {
    const approved = approvedPosts.value
    expect(approved.every((p) => p.status === 'Đã duyệt')).toBe(true)
    expect(approved.length).toBe(2)
  })

  it('PO-03: không lấy post "Chờ duyệt"', () => {
    const approved = approvedPosts.value
    expect(approved.some((p) => p.status === 'Chờ duyệt')).toBe(false)
  })
})

// ──────────────────────────────────────────────
// addPost()
// ──────────────────────────────────────────────
describe('addPost()', () => {
  it('PO-04: tạo post mới với status "Chờ duyệt"', async () => {
    const newPostPayload = {
      title: 'New Post',
      excerpt: 'Short',
      content: 'Full content',
      category: 'Cat1',
    }

    apiRequest.mockImplementation(async (path, options) => {
      const body = JSON.parse(options.body)
      return { ...body }
    })

    const result = await addPost(newPostPayload, AUTHOR)
    expect(result.ok).toBe(true)

    const created = posts.value.find((p) => p.title === 'New Post')
    expect(created?.status).toBe('Chờ duyệt')
    expect(created?.authorId).toBe('u01')
  })
})

// ──────────────────────────────────────────────
// updatePost()
// ──────────────────────────────────────────────
describe('updatePost()', () => {
  it('PO-05: thất bại khi post không tồn tại', async () => {
    const result = await updatePost(999, { title: 'X' }, AUTHOR)
    expect(result.ok).toBe(false)
  })

  it('PO-05: non-author không thể sửa bài của người khác', async () => {
    // Post 3 thuộc authorId 'u02', AUTHOR = 'u01'
    const otherAuthor = { id: 'u01', penName: 'author1', role: 'author' }
    const result = await updatePost(3, { title: 'Hacked' }, otherAuthor)
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('PO-06: moderator có thể sửa bài của bất kỳ ai', async () => {
    apiRequest.mockImplementation(async (path, options) => {
      const body = JSON.parse(options.body)
      return { ...body }
    })

    const result = await updatePost(3, { title: 'Mod Edited' }, MODERATOR)
    expect(result.ok).toBe(true)
  })
})

// ──────────────────────────────────────────────
// deletePost()
// ──────────────────────────────────────────────
describe('deletePost()', () => {
  it('PO-07: xóa post khỏi danh sách', async () => {
    apiRequest.mockResolvedValue(null)

    const result = await deletePost(1)
    expect(result.ok).toBe(true)
    expect(posts.value.find((p) => p.id === 1)).toBeUndefined()
  })
})

// ──────────────────────────────────────────────
// approvePost()
// ──────────────────────────────────────────────
describe('approvePost()', () => {
  it('PO-08: thất bại khi non-moderator cố duyệt bài', async () => {
    const result = await approvePost(2, AUTHOR)
    expect(result.ok).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('PO-09: moderator duyệt bài thành công → status = "Đã duyệt"', async () => {
    apiRequest.mockImplementation(async (path, options) => {
      const body = JSON.parse(options.body)
      return { ...body }
    })

    const result = await approvePost(2, MODERATOR)
    expect(result.ok).toBe(true)

    const post = posts.value.find((p) => p.id === 2)
    expect(post?.status).toBe('Đã duyệt')
  })
})
