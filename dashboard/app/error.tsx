'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Something went wrong</h2>
      <p className="text-gray-500 dark:text-slate-400 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm"
      >
        Try again
      </button>
    </div>
  )
}
