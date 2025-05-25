import { formatDistanceToNow } from 'date-fns'

interface SaveStatusProps {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  className?: string
}

export function SaveStatus({ isSaving, lastSaved, error, className = '' }: SaveStatusProps) {
  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-red-400 ${className}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Save failed: {error}</span>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-blue-400 ${className}`}>
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Saving...</span>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-green-400 ${className}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Saved {formatDistanceToNow(lastSaved)} ago</span>
      </div>
    )
  }

  return null
} 