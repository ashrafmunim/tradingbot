'use client'

const STORAGE_KEY = 'tracked-tokens'

// Default tokens
const DEFAULT_TOKENS = [
  'ByeKZWmkmJB3Yqayx5sRdHawiZAZQcnqQmceMCRVpump',
  'ASwb21az441NXoGP524CHnjnSKYdCpzpqsHoaDi5pump',
]

export function getTrackedTokens(): string[] {
  if (typeof window === 'undefined') return DEFAULT_TOKENS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_TOKENS
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TOKENS
  } catch {
    return DEFAULT_TOKENS
  }
}

export function addTrackedToken(address: string): string[] {
  const tokens = getTrackedTokens()
  if (tokens.includes(address)) return tokens
  const updated = [...tokens, address]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('tracked-tokens-changed'))
  return updated
}

export function removeTrackedToken(address: string): string[] {
  const tokens = getTrackedTokens().filter(t => t !== address)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  window.dispatchEvent(new Event('tracked-tokens-changed'))
  return tokens
}

export function isTokenTracked(address: string): boolean {
  return getTrackedTokens().includes(address)
}
