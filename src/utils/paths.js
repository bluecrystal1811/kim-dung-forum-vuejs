const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i

export const resolveAppPath = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return value
  }

  const trimmed = value.trim()

  if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }

  if (trimmed.startsWith(import.meta.env.BASE_URL)) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return `${import.meta.env.BASE_URL}${trimmed.slice(1)}`
  }

  return trimmed
}