/**
 * Setup Ziina Webhook
 * Run this script to register your webhook URL with Ziina
 * 
 * Usage: 
 *   tsx scripts/setup-ziina-webhook.ts
 * 
 * Or with custom URL:
 *   ZIINA_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook tsx scripts/setup-ziina-webhook.ts
 */

import crypto from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local file
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    console.log('📂 Looking for .env.local at:', envPath)
    const envFile = readFileSync(envPath, 'utf-8')
    const envVars: Record<string, string> = {}
    
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remove quotes
          envVars[key.trim()] = value.trim()
        }
      }
    })
    
    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value
      }
    })
    
    console.log('✅ Loaded .env.local file')
    if (envVars.ZIINA_API_KEY) {
      console.log('✅ Found ZIINA_API_KEY in .env.local')
    } else {
      console.log('⚠️  ZIINA_API_KEY not found in .env.local')
    }
    console.log('')
  } catch (error: any) {
    // .env.local might not exist, that's okay
    console.log('⚠️  .env.local not found at:', join(process.cwd(), '.env.local'))
    console.log('   Using system environment variables instead')
    console.log('')
  }
}

// Load environment variables
loadEnvFile()

async function setupZiinaWebhook() {
  const apiKey = process.env.ZIINA_API_KEY
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  let webhookUrl = process.env.ZIINA_WEBHOOK_URL || `${baseUrl}/api/payments/webhook`
  
  if (!apiKey) {
    console.error('❌ ZIINA_API_KEY is not set in environment variables')
    console.error('')
    console.error('   Please add ZIINA_API_KEY to your .env.local file:')
    console.error('   ZIINA_API_KEY="your-ziina-api-key"')
    console.error('')
    console.error('   Or set it as an environment variable:')
    console.error('   $env:ZIINA_API_KEY="your-key"; npx tsx scripts/setup-ziina-webhook.ts')
    console.error('')
    process.exit(1)
  }

  // Check if using localhost (not allowed by Ziina)
  if (webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1')) {
    console.error('❌ Ziina does not accept localhost URLs for webhooks')
    console.error('')
    console.error('   Webhook URL must be publicly accessible with HTTPS')
    console.error('')
    console.error('   Options:')
    console.error('   1. Use ngrok for local development:')
    console.error('      - Install ngrok: https://ngrok.com/download')
    console.error('      - Run: ngrok http 3000')
    console.error('      - Use the HTTPS URL: https://xxxx.ngrok.io/api/payments/webhook')
    console.error('      - Set: $env:ZIINA_WEBHOOK_URL="https://xxxx.ngrok.io/api/payments/webhook"')
    console.error('')
    console.error('   2. Use your production URL:')
    console.error('      - Set: $env:ZIINA_WEBHOOK_URL="https://yourdomain.com/api/payments/webhook"')
    console.error('')
    console.error('   3. Skip webhook setup for now (use payment verification instead)')
    console.error('      - Subscriptions will still work via payment verification route')
    console.error('')
    process.exit(1)
  }

  // Generate a secure webhook secret
  const webhookSecret = crypto.randomBytes(32).toString('hex')

  console.log('🔧 Setting up Ziina webhook...')
  console.log('📡 Webhook URL:', webhookUrl)
  console.log('🔑 Generated Secret:', webhookSecret.substring(0, 8) + '...')
  console.log('')

  try {
    const response = await fetch('https://api-v2.ziina.com/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: webhookUrl,
        secret: webhookSecret,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Failed to setup webhook')
      console.error('   Status:', response.status, response.statusText)
      console.error('   Error:', JSON.stringify(errorData, null, 2))
      console.error('')
      
      if (response.status === 400 && errorData.message?.includes('URL')) {
        console.error('💡 This usually means:')
        console.error('   - URL must be publicly accessible (not localhost)')
        console.error('   - URL must use HTTPS (not HTTP)')
        console.error('   - URL must be a valid, reachable endpoint')
        console.error('')
        console.error('   For local development, use ngrok:')
        console.error('   1. Install ngrok: https://ngrok.com/download')
        console.error('   2. Run: ngrok http 3000')
        console.error('   3. Use the HTTPS URL from ngrok')
        console.error('   4. Set ZIINA_WEBHOOK_URL environment variable')
        console.error('')
      }
      
      process.exit(1)
    }

    const data = await response.json()
    
    console.log('✅ Webhook configured successfully!')
    console.log('')
    console.log('📋 Add this to your .env.local file:')
    console.log('')
    console.log(`ZIINA_WEBHOOK_SECRET="${webhookSecret}"`)
    console.log('')
    if (webhookUrl.includes('localhost')) {
      console.log('⚠️  Note: You are using localhost. For production, update ZIINA_WEBHOOK_URL to your production domain')
      console.log('   Example: ZIINA_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook')
      console.log('')
    }
    console.log('📝 Webhook Response:', JSON.stringify(data, null, 2))
    console.log('')
    console.log('✨ Next Steps:')
    console.log('   1. Add ZIINA_WEBHOOK_SECRET to your .env.local file')
    console.log('   2. Restart your development server')
    console.log('   3. Test a payment to verify webhook is working')
    
  } catch (error: any) {
    console.error('❌ Error setting up webhook:', error.message)
    console.error('')
    console.error('💡 Troubleshooting:')
    console.error('   - Verify ZIINA_API_KEY is correct')
    console.error('   - Check your internet connection')
    console.error('   - Ensure the webhook URL is publicly accessible (not localhost for production)')
    process.exit(1)
  }
}

setupZiinaWebhook()
