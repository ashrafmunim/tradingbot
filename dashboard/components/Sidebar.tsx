'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  History,
  BarChart3,
  Settings,
  Activity,
  Wallet,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sentiment', href: '/sentiment', icon: TrendingUp },
  { name: 'Positions', href: '/positions', icon: Wallet },
  { name: 'Trade History', href: '/history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const bottomNav = [
  { name: 'Bot Status', href: '/status', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto z-20">
      <nav className="p-4 space-y-1">
        {/* Live Status */}
        <div className="px-3 py-3 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Bot Active
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            Paper Trading Mode
          </p>
        </div>

        {/* Main navigation */}
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-[#e8f0fe] dark:bg-blue-900/30 text-[#1a73e8] dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}

        {/* Section Divider */}
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            System
          </p>
        </div>

        {/* Bottom navigation */}
        {bottomNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-[#e8f0fe] dark:bg-blue-900/30 text-[#1a73e8] dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
          <Activity className="w-4 h-4" />
          <span>Next check in 12:34</span>
        </div>
      </div>
    </aside>
  )
}
