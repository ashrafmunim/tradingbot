'use client'

import { cn } from '@/lib/utils'
import { Bot, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react'

interface TokenData {
  symbol: string
  priceUsd: number
  marketCap: number
  liquidity: number
  volume24h: number
  priceChange5m: number
  priceChange1h: number
  priceChange6h: number
  priceChange24h: number
  buys1h: number
  sells1h: number
  buys24h: number
  sells24h: number
  analysis: {
    score: number
    signal: string
    signalColor: string
    momentum: number
    buyPressure: number
    liquidityRisk: string
    reasons: string[]
  }
}

function generateAdvice(t: TokenData) {
  const { analysis } = t
  const lines: string[] = []
  let verdict: 'buy' | 'sell' | 'wait' = 'wait'
  let confidence: 'high' | 'medium' | 'low' = 'low'
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'medium'

  // Determine verdict
  if (analysis.score >= 70) {
    verdict = 'buy'
    confidence = 'high'
  } else if (analysis.score >= 58) {
    verdict = 'buy'
    confidence = 'medium'
  } else if (analysis.score <= 30) {
    verdict = 'sell'
    confidence = 'high'
  } else if (analysis.score <= 42) {
    verdict = 'sell'
    confidence = 'medium'
  } else {
    verdict = 'wait'
    confidence = 'low'
  }

  // Risk assessment
  if (analysis.liquidityRisk === 'critical') riskLevel = 'extreme'
  else if (analysis.liquidityRisk === 'high') riskLevel = 'high'
  else if (t.liquidity >= 100000) riskLevel = 'low'

  // Override: don't recommend buying high-risk tokens
  if (verdict === 'buy' && riskLevel === 'extreme') {
    verdict = 'wait'
    confidence = 'low'
  }

  // Generate analysis text
  // Price action
  const allUp = t.priceChange5m > 0 && t.priceChange1h > 0 && t.priceChange6h > 0
  const allDown = t.priceChange5m < 0 && t.priceChange1h < 0 && t.priceChange6h < 0
  const shortUp = t.priceChange5m > 0 && t.priceChange1h > 0
  const longDown = t.priceChange6h < 0 && t.priceChange24h < 0

  if (allUp) {
    lines.push(`Price is rising across all timeframes — strong bullish momentum at ${analysis.momentum > 0 ? '+' : ''}${analysis.momentum}%.`)
  } else if (allDown) {
    lines.push(`Price is dropping across all timeframes — bearish momentum at ${analysis.momentum}%.`)
  } else if (shortUp && longDown) {
    lines.push(`Short-term bounce detected (+${t.priceChange1h.toFixed(1)}% in 1h) but the longer trend is still down (${t.priceChange6h.toFixed(1)}% in 6h). Could be a dead cat bounce.`)
  } else if (!shortUp && !longDown) {
    lines.push(`Short-term dip (${t.priceChange1h.toFixed(1)}% in 1h) against a longer uptrend (+${t.priceChange6h.toFixed(1)}% in 6h). Potential buy-the-dip opportunity.`)
  } else {
    lines.push(`Mixed signals — ${t.priceChange1h > 0 ? 'up' : 'down'} ${Math.abs(t.priceChange1h).toFixed(1)}% in 1h, ${t.priceChange24h > 0 ? 'up' : 'down'} ${Math.abs(t.priceChange24h).toFixed(1)}% in 24h.`)
  }

  // Buy pressure
  const total1h = t.buys1h + t.sells1h
  const buyRatio1h = total1h > 0 ? (t.buys1h / total1h) * 100 : 50
  if (buyRatio1h >= 65) {
    lines.push(`Heavy buying pressure — ${buyRatio1h.toFixed(0)}% of transactions in the last hour are buys. Demand is strong.`)
  } else if (buyRatio1h <= 35) {
    lines.push(`Selling pressure is dominant — ${(100 - buyRatio1h).toFixed(0)}% of transactions are sells. Holders are exiting.`)
  } else {
    lines.push(`Buy/sell pressure is balanced at ${buyRatio1h.toFixed(0)}%/${(100 - buyRatio1h).toFixed(0)}%. No clear dominance.`)
  }

  // Volume
  const volMcap = t.marketCap > 0 ? (t.volume24h / t.marketCap) * 100 : 0
  if (volMcap > 100) {
    lines.push(`Extremely high trading activity — 24h volume is ${volMcap.toFixed(0)}% of market cap. This coin is very actively traded right now.`)
  } else if (volMcap > 30) {
    lines.push(`Good trading volume — ${volMcap.toFixed(0)}% of market cap traded in 24h.`)
  } else if (volMcap < 5) {
    lines.push(`Low trading volume — only ${volMcap.toFixed(1)}% of market cap traded. Interest is fading.`)
  }

  // Liquidity
  if (riskLevel === 'extreme') {
    lines.push(`DANGER: Liquidity is only $${(t.liquidity / 1000).toFixed(1)}K. You will face massive slippage and may not be able to sell. Avoid large positions.`)
  } else if (riskLevel === 'high') {
    lines.push(`Low liquidity ($${(t.liquidity / 1000).toFixed(1)}K). Enter with small size only — exiting could move the price against you.`)
  } else if (riskLevel === 'low') {
    lines.push(`Liquidity is healthy at $${(t.liquidity / 1000).toFixed(0)}K — you can enter and exit with reasonable slippage.`)
  }

  // Final recommendation
  let recommendation: string
  if (verdict === 'buy' && confidence === 'high') {
    recommendation = `BUY ${t.symbol}. Multiple signals align bullish — momentum, buy pressure, and volume all support upward movement.`
  } else if (verdict === 'buy' && confidence === 'medium') {
    recommendation = `Lean BUY on ${t.symbol}. Indicators are mildly bullish but not all aligned. Consider a small position with a tight stop-loss.`
  } else if (verdict === 'sell' && confidence === 'high') {
    recommendation = `SELL / AVOID ${t.symbol}. Bearish across the board — falling price, sell pressure, and weakening volume.`
  } else if (verdict === 'sell' && confidence === 'medium') {
    recommendation = `Lean SELL on ${t.symbol}. More signals point down than up. If you're holding, consider taking profit or setting a stop-loss.`
  } else {
    recommendation = `WAIT on ${t.symbol}. Signals are mixed and there's no clear edge. Watch for a breakout in either direction before entering.`
  }

  return {
    verdict,
    confidence,
    riskLevel,
    lines,
    recommendation,
  }
}

export function AIAdvisor({ token }: { token: TokenData }) {
  const advice = generateAdvice(token)

  const verdictConfig = {
    buy: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400', icon: TrendingUp, label: 'BUY' },
    sell: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-400', icon: TrendingDown, label: 'SELL' },
    wait: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', icon: AlertTriangle, label: 'WAIT' },
  }

  const vc = verdictConfig[advice.verdict]
  const VerdictIcon = vc.icon

  const riskColors = {
    low: 'text-emerald-500',
    medium: 'text-amber-500',
    high: 'text-orange-500',
    extreme: 'text-rose-500',
  }

  return (
    <div className={cn('rounded-lg border p-3 space-y-2.5', vc.bg, vc.border)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1a73e8] to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">AI Assistant</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={cn('text-[10px] font-medium', riskColors[advice.riskLevel])}>
            Risk: {advice.riskLevel.charAt(0).toUpperCase() + advice.riskLevel.slice(1)}
          </span>
        </div>
      </div>

      {/* Verdict badge */}
      <div className="flex items-center gap-2">
        <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm', vc.bg, vc.text)}>
          <VerdictIcon className="w-4 h-4" />
          {vc.label}
        </div>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">
          Confidence: {advice.confidence}
        </span>
      </div>

      {/* Analysis */}
      <div className="space-y-1.5">
        {advice.lines.map((line, i) => (
          <p key={i} className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {/* Final recommendation */}
      <div className={cn('rounded-md px-3 py-2 text-xs font-medium leading-relaxed', vc.bg, vc.text)}>
        {advice.recommendation}
      </div>

      <p className="text-[9px] text-gray-400 dark:text-slate-600 italic">
        This is algorithmic analysis, not financial advice. Always DYOR.
      </p>
    </div>
  )
}
