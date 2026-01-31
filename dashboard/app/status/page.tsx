'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import {
  Bot,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
} from 'lucide-react'

interface LogEntry {
  id: number
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
}

const mockLogs: LogEntry[] = [
  { id: 1, timestamp: '2024-01-15T10:30:15', level: 'success', message: 'Trade executed: BUY 0.05 BTC/USDT @ $42,850' },
  { id: 2, timestamp: '2024-01-15T10:30:12', level: 'info', message: 'Signal generated: BTC/USDT - Strong Buy (score: 0.65)' },
  { id: 3, timestamp: '2024-01-15T10:30:05', level: 'info', message: 'Sentiment analysis completed for 8 symbols' },
  { id: 4, timestamp: '2024-01-15T10:30:00', level: 'info', message: 'Starting analysis cycle...' },
  { id: 5, timestamp: '2024-01-15T10:15:00', level: 'info', message: 'Scheduled analysis cycle completed' },
  { id: 6, timestamp: '2024-01-15T10:14:55', level: 'warning', message: 'Twitter rate limit approaching (80%)' },
  { id: 7, timestamp: '2024-01-15T10:14:50', level: 'info', message: 'Fetched 150 tweets for sentiment analysis' },
  { id: 8, timestamp: '2024-01-15T10:00:00', level: 'info', message: 'Bot started in paper trading mode' },
]

export default function StatusPage() {
  const [botStatus, setBotStatus] = useState<'running' | 'paused'>('running')
  const [isRestarting, setIsRestarting] = useState(false)

  const handleToggleBot = () => {
    setBotStatus(prev => prev === 'running' ? 'paused' : 'running')
  }

  const handleRestart = () => {
    setIsRestarting(true)
    setTimeout(() => {
      setIsRestarting(false)
      setBotStatus('running')
    }, 2000)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'error': return <XCircle className="w-4 h-4 text-rose-500" />
      default: return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getLevelClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-emerald-600 dark:text-emerald-400'
      case 'warning': return 'text-amber-600 dark:text-amber-400'
      case 'error': return 'text-rose-600 dark:text-rose-400'
      default: return 'text-gray-600 dark:text-slate-400'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Bot Status
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            Monitor and control the trading bot
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestart}
            disabled={isRestarting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isRestarting && 'animate-spin')} />
            Restart
          </button>
          <button
            onClick={handleToggleBot}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              botStatus === 'running'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            )}
          >
            {botStatus === 'running' ? (
              <>
                <Pause className="w-4 h-4" />
                Pause Bot
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Bot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Status Card */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                botStatus === 'running'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-amber-100 dark:bg-amber-900/30'
              )}>
                <Bot className={cn(
                  'w-8 h-8',
                  botStatus === 'running' ? 'text-emerald-600' : 'text-amber-600'
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                    Trading Bot
                  </h2>
                  <Badge variant={botStatus === 'running' ? 'success' : 'warning'}>
                    {botStatus === 'running' ? 'Running' : 'Paused'}
                  </Badge>
                </div>
                <p className="text-gray-500 dark:text-slate-500">Paper Trading Mode</p>
              </div>
            </div>

            {botStatus === 'running' && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-slate-500">Next analysis in</p>
                <p className="text-2xl font-mono font-bold text-[#1a73e8]">12:34</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Uptime</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">4h 32m</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-500 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Cycles Today</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">18</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-500 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Trades Today</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">5</p>
            </div>
          </div>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">CPU Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '23%' }} />
                </div>
                <span className="text-sm text-gray-600 dark:text-slate-400">23%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                </div>
                <span className="text-sm text-gray-600 dark:text-slate-400">45%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">API Latency</span>
              </div>
              <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">42ms</span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">Service Status</p>
              <div className="space-y-2">
                {['Sentiment Analyzer', 'Market Data', 'Order Executor', 'Database'].map((service) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-slate-300">{service}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Online</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
          <button className="text-sm text-[#1a73e8] hover:text-[#1557b0]">
            Clear Log
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {mockLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {getLevelIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', getLevelClass(log.level))}>
                    {log.message}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-slate-600 whitespace-nowrap">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
