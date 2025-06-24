'use client'

import { useState } from 'react'
import { Button } from '@/app/_components/ui/button'

interface Props {
  defaultUrl?: string
}

export default function UrlForm({ defaultUrl = '' }: Props) {
  const [url, setUrl] = useState(defaultUrl)

  return (
    <form method="GET" className="flex gap-2 w-full">
      <input
        type="url"
        name="url"
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.example.com"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
      <Button type="submit" variant="default" size="sm">
        Check
      </Button>
    </form>
  )
} 