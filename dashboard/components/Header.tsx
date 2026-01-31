'use client'

import { useState } from 'react'
import {
  Bell,
  Moon,
  Sun,
  Search,
  Settings,
  User,
  LogOut
} from 'lucide-react'

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
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets, trades..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-sm"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

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
