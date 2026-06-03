import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock import.meta.env before importing the module
vi.stubEnv('BASE_URL', '/kim-dung-forum-vuejs/')

// Re-import after env is stubbed
const { resolveAppPath } = await import('../paths.js')

describe('resolveAppPath (P-01 → P-06)', () => {
  // P-01: Input không phải string
  it('P-01: trả về nguyên giá trị khi input không phải string', () => {
    expect(resolveAppPath(null)).toBe(null)
    expect(resolveAppPath(undefined)).toBe(undefined)
    expect(resolveAppPath(42)).toBe(42)
    expect(resolveAppPath(false)).toBe(false)
  })

  // P-02: Input rỗng hoặc chỉ có whitespace
  it('P-02: trả về nguyên giá trị khi input rỗng hoặc whitespace', () => {
    expect(resolveAppPath('')).toBe('')
    expect(resolveAppPath('   ')).toBe('   ')
  })

  // P-03: URL tuyệt đối
  it('P-03: trả về nguyên giá trị với URL tuyệt đối http://', () => {
    expect(resolveAppPath('http://example.com/image.jpg')).toBe('http://example.com/image.jpg')
  })

  it('P-03: trả về nguyên giá trị với URL tuyệt đối https://', () => {
    expect(resolveAppPath('https://example.com/img.png')).toBe('https://example.com/img.png')
  })

  // P-04: URL data: hoặc blob:
  it('P-04: trả về nguyên giá trị với URL data:', () => {
    const dataUrl = 'data:image/png;base64,abc123'
    expect(resolveAppPath(dataUrl)).toBe(dataUrl)
  })

  it('P-04: trả về nguyên giá trị với URL blob:', () => {
    const blobUrl = 'blob:http://localhost/some-id'
    expect(resolveAppPath(blobUrl)).toBe(blobUrl)
  })

  // P-05: Path đã bắt đầu bằng BASE_URL
  it('P-05: trả về nguyên giá trị nếu đã bắt đầu bằng BASE_URL', () => {
    expect(resolveAppPath('/kim-dung-forum-vuejs/images/a.jpg')).toBe('/kim-dung-forum-vuejs/images/a.jpg')
  })

  // P-06: Path /relative cần được thêm BASE_URL
  it('P-06: thêm BASE_URL cho path bắt đầu bằng /', () => {
    expect(resolveAppPath('/images/avatar.png')).toBe('/kim-dung-forum-vuejs/images/avatar.png')
  })

  it('P-06: thêm BASE_URL cho path /images/banner.jpg', () => {
    expect(resolveAppPath('/images/banner.jpg')).toBe('/kim-dung-forum-vuejs/images/banner.jpg')
  })
})
