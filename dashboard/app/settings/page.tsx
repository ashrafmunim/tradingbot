'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import {
  Settings,
  Key,
  Bell,
  Shield,
  Sliders,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
} from 'lucide-react'

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [tradingMode, setTradingMode] = useState<'paper' | 'live'>('paper')
  const [notifications, setNotifications] = useState({
    trades: true,
    signals: true,
    errors: true,
    dailyReport: false,
  })
  const [riskSettings, setRiskSettings] = useState({
    maxPositionSize: 5,
    stopLoss: 3,
    takeProfit: 6,
    maxPositions: 10,
  })

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const apiKeys = [
    { id: 'alpaca', name: 'Alpaca API', status: 'connected', lastUsed: '2 min ago' },
    { id: 'binance', name: 'Binance API', status: 'connected', lastUsed: '5 min ago' },
    { id: 'twitter', name: 'Twitter/X API', status: 'connected', lastUsed: '1 min ago' },
    { id: 'reddit', name: 'Reddit API', status: 'connected', lastUsed: '3 min ago' },
    { id: 'newsapi', name: 'News API', status: 'connected', lastUsed: '1 min ago' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          Configure your trading bot and API connections
        </p>
      </div>

      {/* Trading Mode */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1a73e8]" />
            <CardTitle>Trading Mode</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTradingMode('paper')}
              className={cn(
                'flex-1 p-4 rounded-lg border-2 transition-all',
                tradingMode === 'paper'
                  ? 'border-[#1a73e8] bg-[#e8f0fe] dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-slate-100">Paper Trading</span>
                {tradingMode === 'paper' && <Check className="w-5 h-5 text-[#1a73e8]" />}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 text-left">
                Simulate trades without real money. Perfect for testing strategies.
              </p>
            </button>

            <button
              onClick={() => setTradingMode('live')}
              className={cn(
                'flex-1 p-4 rounded-lg border-2 transition-all',
                tradingMode === 'live'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-slate-100">Live Trading</span>
                {tradingMode === 'live' && <Check className="w-5 h-5 text-rose-500" />}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 text-left">
                Execute real trades with real money. Use with caution.
              </p>
            </button>
          </div>

          {tradingMode === 'live' && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Warning: Live Mode</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Live trading involves real financial risk. Ensure you understand the risks before proceeding.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#1a73e8]" />
            <CardTitle>API Connections</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys.map((api) => (
            <div
              key={api.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-slate-100">{api.name}</span>
                  <Badge variant={api.status === 'connected' ? 'success' : 'error'}>
                    {api.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
                  Last used: {api.lastUsed}
                </p>
              </div>
              <button
                onClick={() => toggleApiKeyVisibility(api.id)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {showApiKeys[api.id] ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          ))}

          <button className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-slate-600 hover:border-[#1a73e8] dark:hover:border-blue-400 text-gray-600 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400 rounded-lg transition-colors">
            + Add New API Key
          </button>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1a73e8]" />
            <CardTitle>Risk Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Max Position Size (% of portfolio)
              </label>
              <span className="text-sm font-mono text-gray-600 dark:text-slate-400">
                {riskSettings.maxPositionSize}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={riskSettings.maxPositionSize}
              onChange={(e) => setRiskSettings(prev => ({ ...prev, maxPositionSize: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Stop Loss (%)
              </label>
              <span className="text-sm font-mono text-gray-600 dark:text-slate-400">
                {riskSettings.stopLoss}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={riskSettings.stopLoss}
              onChange={(e) => setRiskSettings(prev => ({ ...prev, stopLoss: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Take Profit (%)
              </label>
              <span className="text-sm font-mono text-gray-600 dark:text-slate-400">
                {riskSettings.takeProfit}%
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={riskSettings.takeProfit}
              onChange={(e) => setRiskSettings(prev => ({ ...prev, takeProfit: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Max Concurrent Positions
              </label>
              <span className="text-sm font-mono text-gray-600 dark:text-slate-400">
                {riskSettings.maxPositions}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={riskSettings.maxPositions}
              onChange={(e) => setRiskSettings(prev => ({ ...prev, maxPositions: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1a73e8]" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-slate-100 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-500">
                  {key === 'trades' && 'Get notified when trades are executed'}
                  {key === 'signals' && 'Get notified when new signals are generated'}
                  {key === 'errors' && 'Get notified when errors occur'}
                  {key === 'dailyReport' && 'Receive a daily summary of activity'}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  value ? 'bg-[#1a73e8]' : 'bg-gray-200 dark:bg-slate-700'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    value ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-lg transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}
