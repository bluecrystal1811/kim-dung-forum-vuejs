const buildMockDbUrl = () => `${import.meta.env.BASE_URL}db.json`

let cachedMockDbPromise

const loadMockDb = async () => {
  if (!cachedMockDbPromise) {
    cachedMockDbPromise = fetch(buildMockDbUrl(), { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.json()
      })
      .catch((error) => {
        cachedMockDbPromise = null
        throw error
      })
  }

  return cachedMockDbPromise
}

export const loadMockCollection = async (key) => {
  const data = await loadMockDb()
  const collection = data?.[key]
  return Array.isArray(collection) ? collection : []
}