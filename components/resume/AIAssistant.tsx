'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, Check, X } from 'lucide-react'

interface AIAssistantProps {
  onApply: (content: string) => void
  onCancel: () => void
  generating: boolean
  preview: string | null
  label: string
}

export function AIAssistant({ onApply, onCancel, generating, preview, label }: AIAssistantProps) {
  if (!preview && !generating) return null

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          AI {label} Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {generating ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI suggestions...
          </div>
        ) : preview ? (
          <>
            <div className="bg-white p-4 rounded border text-sm whitespace-pre-wrap">
              {preview}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onApply(preview)}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

interface AIButtonProps {
  onClick: () => void
  loading: boolean
  disabled?: boolean
  label: string
  'data-action'?: string
}

export function AIButton({ onClick, loading, disabled, label, 'data-action': dataAction }: AIButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={loading || disabled}
      className="text-xs"
      data-action={dataAction}
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3 mr-1" />
          {label}
        </>
      )}
    </Button>
  )
}

