'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  Sparkles,
  TrendingUp,
  FileText
} from 'lucide-react'
import type { ResumeData } from '@/types'
import { analyzeATS, type ATSSuggestion } from '@/lib/ai/atsOptimizer'

interface ATSOptimizerProps {
  resume: ResumeData
  onApplySuggestion?: (suggestion: ATSSuggestion, missingKeywords?: string[]) => void
}

export function ATSOptimizer({ resume, onApplySuggestion }: ATSOptimizerProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeATS> | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      const result = analyzeATS(resume, jobDescription || undefined)
      setAnalysis(result)
      setAnalyzing(false)
    }, 500)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300'
    if (score >= 60) return 'bg-yellow-100 border-yellow-300'
    return 'bg-red-100 border-red-300'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyword':
        return <TrendingUp className="h-4 w-4" />
      case 'format':
        return <FileText className="h-4 w-4" />
      case 'content':
        return <Info className="h-4 w-4" />
      case 'structure':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            ATS Optimization Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Job Description (Optional - for keyword matching)
            </label>
            <Textarea
              placeholder="Paste the job description here to check keyword matches..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to check general ATS optimization
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>

          {analysis && (
            <div className="space-y-4 mt-4">
              {/* Score Display */}
              <Card className={`border-2 ${getScoreBgColor(analysis.score)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ATS Score</p>
                      <p className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}/100
                      </p>
                    </div>
                    <div className="text-right">
                      {analysis.score >= 80 ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-6 w-6" />
                          <span className="font-medium">Excellent</span>
                        </div>
                      ) : analysis.score >= 60 ? (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <AlertCircle className="h-6 w-6" />
                          <span className="font-medium">Good</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-6 w-6" />
                          <span className="font-medium">Needs Work</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Matches */}
              {jobDescription && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Keyword Match:</strong> {analysis.keywordMatches} keywords found
                    {analysis.missingKeywords.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Missing keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.missingKeywords.slice(0, 10).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Suggestions for Improvement</h3>
                  {analysis.suggestions.map((suggestion, idx) => (
                    <Card key={idx} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(suggestion.type)}
                              <Badge className={getPriorityColor(suggestion.priority)}>
                                {suggestion.priority}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {suggestion.section}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">{suggestion.message}</p>
                            <p className="text-xs text-gray-600">{suggestion.suggestion}</p>
                          </div>
                          {onApplySuggestion && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onApplySuggestion(suggestion, analysis.missingKeywords)}
                              className="ml-2"
                            >
                              Apply
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Great! Your resume is well-optimized for ATS systems.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
