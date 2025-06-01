import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to get an access token from GCP service account credentials
async function getGcpAccessToken(credentialsJson: string) {
  const credentials = JSON.parse(credentialsJson)
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: credentials.token_uri,
    exp,
    iat,
  }
  // Deno has crypto.subtle for signing
  function base64url(input: string) {
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  const enc = new TextEncoder()
  const headerBase64 = base64url(JSON.stringify(header))
  const payloadBase64 = base64url(JSON.stringify(payload))
  const toSign = `${headerBase64}.${payloadBase64}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(atob(credentials.private_key.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\n/g, ''))),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(toSign)))
  const jwt = `${toSign}.${base64url(String.fromCharCode(...signature))}`
  // Exchange JWT for access token
  const res = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to get GCP access token')
  return data.access_token
}

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voiceId, languageCode, pitch, speakingRate } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const GCP_TTS_CREDENTIALS = Deno.env.get('GCP_TTS_CREDENTIALS')
    const credentials = JSON.parse(GCP_TTS_CREDENTIALS)

    if (!GCP_TTS_CREDENTIALS) {
      throw new Error('GCP_TTS_CREDENTIALS environment variable is not set')
    }

    const accessToken = await getGcpAccessToken(GCP_TTS_CREDENTIALS)

    // Call GCP Text-to-Speech API
    const ttsRes = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: languageCode || 'en-US',
          name: voiceId || undefined,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: typeof pitch === 'number' ? pitch : 0.0, // Default pitch
          speakingRate: typeof speakingRate === 'number' ? speakingRate : 1.0, // Default rate
        },
      }),
    })

    if (!ttsRes.ok) {
      const errorData = await ttsRes.json().catch(() => ({}))
      console.error('GCP TTS API error:', errorData)
      throw new Error(`GCP TTS API error: ${ttsRes.status}`)
    }

    const ttsData = await ttsRes.json()

    return new Response(
      JSON.stringify({
        audioContent: ttsData.audioContent, // already base64
        format: 'mp3',
        voice: voiceId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
