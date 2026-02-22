const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8288'
const TOKEN = import.meta.env.VITE_API_TOKEN || ''

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${BASE_URL}/api/v1${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
