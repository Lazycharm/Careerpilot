// AI Provider Abstraction Layer
// Supports: mock, openai, and future providers (local, anthropic, etc.)

export type AIProvider = 'mock' | 'openai' | 'local'

export interface AIProviderConfig {
  provider: AIProvider
  apiKey?: string
  baseUrl?: string
}

export interface AIGenerateOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIProviderInterface {
  generateText(prompt: string, options?: AIGenerateOptions): Promise<string>
  isAvailable(): boolean
}

// Mock Provider (for development/testing)
class MockAIProvider implements AIProviderInterface {
  isAvailable(): boolean {
    return true
  }

  async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return contextual mock response based on prompt
    if (prompt.includes('summary') || prompt.includes('Professional Summary') || prompt.includes('Generate a professional summary')) {
      return `Results-driven professional with extensive experience in the UAE job market. Proven track record of delivering exceptional results and driving business growth. Strong expertise with excellent communication skills and ability to work effectively in multicultural environments. Strategic thinker with demonstrated leadership capabilities and commitment to excellence.`
    }
    
    if (prompt.includes('bullet') || prompt.includes('experience') || prompt.includes('achievement') || prompt.includes('Optimize work experience')) {
      return `• Achieved significant results through strategic initiatives and data-driven decision making
• Improved operational efficiency by 25% by implementing best practices and process optimization
• Collaborated with cross-functional teams across 5+ departments to deliver projects on time and within budget
• Demonstrated strong leadership by mentoring 3 junior team members and increasing team productivity by 30%
• Led key initiatives that resulted in measurable business impact and stakeholder satisfaction`
    }
    
    if (prompt.includes('skill') || prompt.includes('competency') || prompt.includes('Suggest relevant skills')) {
      // Return comma-separated list for skills
      return `JavaScript, TypeScript, React, Node.js, Python, SQL, Git, Agile Methodologies, Project Management, Communication, Leadership, Problem-solving, Teamwork, UAE Market Knowledge`
    }
    
    if (prompt.includes('Tailor') || prompt.includes('tailor') || prompt.includes('JSON')) {
      // Return minimal JSON for tailoring
      return `{
  "summary": "Results-driven professional with extensive experience in the UAE job market. Proven track record aligned with the target role requirements.",
  "skills": [
    {
      "category": "Technical Skills",
      "items": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL"]
    },
    {
      "category": "Soft Skills",
      "items": ["Communication", "Leadership", "Problem-solving", "Teamwork"]
    }
  ]
}`
    }
    
    return `[MOCK AI Response] This is a simulated AI response. Set OPENAI_API_KEY in your environment variables for real AI assistance, or keep AI_DEMO_MODE=true for testing.`
  }
}

// OpenAI Provider
class OpenAIProvider implements AIProviderInterface {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl || 'https://api.openai.com/v1'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const messages: any[] = []
    
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 429) {
          throw new Error('QUOTA_EXCEEDED')
        }
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error: any) {
      if (error.message === 'QUOTA_EXCEEDED') {
        throw new Error('QUOTA_EXCEEDED')
      }
      throw error
    }
  }
}

// Provider Factory
export function createAIProvider(config: AIProviderConfig): AIProviderInterface {
  switch (config.provider) {
    case 'mock':
      return new MockAIProvider()
    
    case 'openai':
      if (!config.apiKey) {
        console.warn('OpenAI API key not provided, falling back to mock provider')
        return new MockAIProvider()
      }
      return new OpenAIProvider(config.apiKey, config.baseUrl)
    
    case 'local':
      // Future: Local model support (Ollama, etc.)
      throw new Error('Local provider not yet implemented')
    
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`)
  }
}

// Get configured provider instance
export function getAIProvider(): AIProviderInterface {
  const apiKey = process.env.OPENAI_API_KEY
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProvider
  const baseUrl = process.env.OPENAI_BASE_URL

  // Use real OpenAI when API key is set (ignore AI_DEMO_MODE so paid API is used)
  if (apiKey && provider === 'openai') {
    return new OpenAIProvider(apiKey, baseUrl)
  }

  // Demo/mock only when no API key or explicitly in demo mode
  const demoMode = process.env.AI_DEMO_MODE === 'true'
  if (demoMode || !apiKey) {
    if (demoMode) {
      console.log('🎭 AI Demo Mode enabled - using mock provider')
    } else if (provider === 'openai') {
      console.warn('OpenAI API key not set - using mock provider. Add OPENAI_API_KEY to .env.local for real AI.')
    }
    return new MockAIProvider()
  }

  return createAIProvider({
    provider,
    apiKey,
    baseUrl,
  })
}

