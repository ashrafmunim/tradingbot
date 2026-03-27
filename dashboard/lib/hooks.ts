'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch<T>(url: string, refreshInterval?: number) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const controllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    // Abort any in-flight request
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const res = await fetch(url, {
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const json = await res.json()
      // Don't set error responses as data
      if (json && typeof json === 'object' && json.error) {
        throw new Error(json.error)
      }
      if (!controller.signal.aborted) {
        setData(json)
        setError(null)
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return
      if (!controller.signal.aborted) {
        setError(e.message)
        // Keep previous data on error instead of wiping it
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [url])

  useEffect(() => {
    fetchData()
    let interval: NodeJS.Timeout | undefined
    if (refreshInterval) {
      interval = setInterval(fetchData, refreshInterval)
    }
    return () => {
      controllerRef.current?.abort()
      if (interval) clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return { data, error, loading, refetch: fetchData }
}
