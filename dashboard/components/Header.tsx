'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell,
  Moon,
  Sun,
  Search,
  Settings,
  User,
  LogOut,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Droplets,
  BarChart3,
  Activity,
  Zap,
  Loader2,
  X,
} from 'lucide-react'
import { addTrackedToken, isTokenTracked } from '@/lib/tracked-tokens'

interface SearchResult {
  symbol: string
  name: string
  address: string
  pairAddress: string
  priceUsd: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  liquidity: number
  dexId: string
  url: string
}

function formatCompact(n: number) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function formatPrice(p: number) {
  if (p < 0.0001) return p.toExponential(3)
  if (p < 0.01) return p.toFixed(6)
  if (p < 1) return p.toFixed(4)
  return p.toFixed(2)
}

function CoinSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [trackedMap, setTrackedMap] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setResults(data)
        const map: Record<string, boolean> = {}
        data.forEach((r: SearchResult) => { map[r.address] = isTokenTracked(r.address) })
        setTrackedMap(map)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (val: string) => {
    setQuery(val)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleTrack = (address: string) => {
    addTrackedToken(address)
    setTrackedMap(prev => ({ ...prev, [address]: true }))
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex-1 max-w-xl mx-8 relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (query.length >= 2) setOpen(true) }}
          placeholder="Search coins by name, symbol, or address..."
          className="w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-700 rounded">
            {'\u2318'}K
          </kbd>
        </div>
      </div>

      {/* Dropdown results */}
      {open && (query.length >= 2) && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-[420px] overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="p-4 text-center text-sm text-gray-400 dark:text-slate-500">
              {query.length >= 2 ? 'No Solana tokens found' : 'Type to search...'}
            </div>
          )}

          {results.map((coin) => (
            <div
              key={`${coin.address}-${coin.pairAddress}`}
              className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                {/* Token info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-slate-100">{coin.symbol}</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{coin.name}</span>
                    <span className={cn(
                      'text-[10px] font-mono',
                      coin.priceChange24h >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    )}>
                      {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500 dark:text-slate-400">
                    <span className="font-mono">${formatPrice(coin.priceUsd)}</span>
                    <span className="flex items-center gap-0.5"><BarChart3 className="w-3 h-3" />{formatCompact(coin.marketCap)}</span>
                    <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" />{formatCompact(coin.liquidity)}</span>
                    <span className="flex items-center gap-0.5"><Activity className="w-3 h-3" />{formatCompact(coin.volume24h)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleTrack(coin.address)}
                    className={cn(
                      'px-2 py-1 text-[10px] font-medium rounded transition-colors',
                      trackedMap[coin.address]
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-[#1a73e8]/10 text-[#1a73e8] hover:bg-[#1a73e8]/20'
                    )}
                  >
                    {trackedMap[coin.address] ? 'Tracked' : 'Track'}
                  </button>
                  <a
                    href={`/simulate?pool=${coin.pairAddress}&symbol=${encodeURIComponent(coin.symbol)}`}
                    className="px-2 py-1 text-[10px] font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                  >
                    <Zap className="w-3 h-3 inline" /> Sim
                  </a>
                  <a
                    href={coin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-[#1a73e8]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}

          {results.length > 0 && (
            <div className="px-3 py-2 text-[10px] text-gray-400 dark:text-slate-500 text-center border-t border-gray-100 dark:border-slate-700">
              Showing Solana tokens from DexScreener
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Header() {
  const [isDark, setIsDark] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-30">
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a73e8] to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Trading Bot
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <SparkleIcon />
            AI
          </span>
        </div>

        {/* Search */}
        <CoinSearch />

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">JD</span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 py-1">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">John Doe</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">john@example.com</p>
                  </div>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </a>
                  <div className="my-1 border-t border-gray-200 dark:border-slate-700" />
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function SparkleIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  )
}
