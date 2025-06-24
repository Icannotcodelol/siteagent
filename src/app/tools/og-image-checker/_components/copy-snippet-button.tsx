'use client'

import { useState } from 'react'
import { Button } from '@/app/_components/ui/button'
import { Check, ClipboardCopy } from 'lucide-react'

interface Props {
  snippet: string
}

export default function CopySnippetButton({ snippet }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copy} className="flex items-center gap-1">
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <ClipboardCopy className="w-4 h-4" />
      )}
      {copied ? 'Copied' : 'Copy Snippet'}
    </Button>
  )
} 