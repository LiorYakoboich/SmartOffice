export const AUTH_API_URL = 'https://localhost:7195/api/auth'
export const ASSET_API_URL = 'https://localhost:7244/api/assets'

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()

    throw new Error(
      errorText || `Request failed with status ${response.status}`
    )
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}