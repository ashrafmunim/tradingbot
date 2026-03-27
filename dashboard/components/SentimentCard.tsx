'use client'

import { useState } from 'react'
import { Card } from './Card'
import { SignalBadge } from './Badge'
import { SentimentGauge } from './SentimentGauge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Twitter, MessageCircle, Newspaper, ChevronDown } from 'lucide-react'

interface SentimentCardProps {
  symbol: string
  price: number
  change: number
  combinedScore: number
  twitterScore: number | null
  redditScore: number | null
  newsScore: number | null
  signal: string
  confidence: number
}

export function SentimentCard({
  symbol,
  price,
  change,
  combinedScore,
  twitterScore,
  redditScore,
  newsScore,
  signal,
  confidence,
}: SentimentCardProps) {
  const [expanded, setExpanded] = useState(false)

  const ScoreIndicator = ({ score, label, icon: Icon }: { score: number | null, label: string, icon: any }) => {
    if (score === null) return (
      <div className="flex items-center gap-2 text-gray-400 dark:text-slate-600">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
        <span className="text-xs">N/A</span>
      </div>
    )

    return (
      <div className="flex items-center gap-2">
        <Icon className={cn(
          'w-4 h-4',
          score > 0.1 ? 'text-emerald-500' : score < -0.1 ? 'text-rose-500' : 'text-amber-500'
        )} />
        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
        <span className={cn(
          'text-xs font-medium',
          score > 0.1 ? 'text-emerald-600 dark:text-emerald-400' : score < -0.1 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
        )}>
          {score > 0 ? '+' : ''}{score.toFixed(2)}
        </span>
      </div>
    )
  }

  const ScoreBar = ({ score, label }: { score: number | null, label: string }) => {
    if (score === null) return null
    const pct = ((score + 1) / 2) * 100
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-slate-400 w-14">{label}</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-slate-600" />
          <div
            className={cn(
              'h-full rounded-full transition-all',
              score > 0.1 ? 'bg-emerald-500' : score < -0.1 ? 'bg-rose-500' : 'bg-amber-500'
            )}
            style={{
              width: `${pct}%`,
            }}
          />
        </div>
        <span className={cn(
          'text-xs font-mono w-10 text-right',
          score > 0.1 ? 'text-emerald-600 dark:text-emerald-400' : score < -0.1 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
        )}>
          {score > 0 ? '+' : ''}{score.toFixed(2)}
        </span>
      </div>
    )
  }

  return (
    <Card
      className={cn('p-4 cursor-pointer select-none transition-all', expanded && 'ring-1 ring-[#1a73e8]/30')}
      interactive
    >
      <div onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">{symbol}</h3>
              <ChevronDown className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                expanded && 'rotate-180'
              )} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-mono text-gray-700 dark:text-slate-200">
                ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={cn(
                'flex items-center gap-1 text-sm',
                change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          </div>
          <SignalBadge signal={signal} />
        </div>

        <div className="flex items-center justify-between">
          <SentimentGauge score={combinedScore} size="sm" showLabel={false} />

          <div className="space-y-1.5">
            <ScoreIndicator score={twitterScore} label="Twitter" icon={Twitter} />
            <ScoreIndicator score={redditScore} label="Reddit" icon={MessageCircle} />
            <ScoreIndicator score={newsScore} label="News" icon={Newspaper} />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-slate-500">Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1a73e8] rounded-full"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-gray-600 dark:text-slate-400">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Sentiment Breakdown Bars */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-slate-300 mb-2">Sentiment Breakdown</p>
            <div className="space-y-2">
              <ScoreBar score={twitterScore} label="Twitter" />
              <ScoreBar score={redditScore} label="Reddit" />
              <ScoreBar score={newsScore} label="News" />
            </div>
          </div>

          {/* Combined Score */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-slate-500">Combined Score</span>
            <span className={cn(
              'font-semibold',
              combinedScore > 0.1 ? 'text-emerald-600 dark:text-emerald-400' : combinedScore < -0.1 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
            )}>
              {combinedScore > 0 ? '+' : ''}{combinedScore.toFixed(2)}
            </span>
          </div>

          {/* Signal Strength */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-slate-500">Signal Strength</span>
            <span className={cn(
              'font-medium px-2 py-0.5 rounded-full text-xs',
              confidence >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              confidence >= 0.6 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
            )}>
              {confidence >= 0.8 ? 'Strong' : confidence >= 0.6 ? 'Moderate' : 'Weak'}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
