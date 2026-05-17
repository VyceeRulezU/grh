import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Try models in priority order — stops at the first successful response
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
]

const callGemini = async (apiKey: string, model: string, contents: any[], generationConfig: any) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, generationConfig }),
  })
  const data = await response.json()
  console.log(`[gemini] model=${model} status=${response.status}`)
  return { ok: response.ok, status: response.status, data }
}

// Always return HTTP 200 so Supabase SDK puts response in data, never in error.
// The client reads data.error or data.content to determine the outcome.
const ok = (body: object) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  })

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS })
  }

  try {
    if (!GOOGLE_AI_API_KEY) return ok({ error: "missing_api_key", detail: "GOOGLE_AI_API_KEY not configured" })
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return ok({ error: "missing_supabase_config" })

    const { userText, context, conversationHistory, userId } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Rate Limiting (20 queries per day per user)
    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase
        .from('explore_usage')
        .select('query_count')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if (usage && usage.query_count >= 20) {
        return ok({ error: 'daily_limit_reached', limit: 20 })
      }

      if (usage) {
        await supabase.from('explore_usage').update({ query_count: usage.query_count + 1 }).eq('user_id', userId).eq('date', today)
      } else {
        await supabase.from('explore_usage').insert({ user_id: userId, query_count: 1, date: today })
      }
    }

    // 2. Gap Logging — fire-and-forget, never crash if table missing
    if (!context || context.trim() === '') {
      supabase.from('explore_gaps').insert({ query: userText, user_id: userId }).then(() => {})
    }

    // 3. Build Gemini request payload
    const systemPrompt = `You are the GRH Research Assistant — an expert in governance, public financial management, anti-corruption, electoral systems, and institutional governance.

STRICT RULES:
1. If Hub documents are provided below, base your answer primarily on those documents.
2. You may add brief clarifying context from your general governance knowledge.
3. If no Hub documents are provided, answer from expert governance knowledge and state: "This answer is based on general governance expertise."
4. Be precise, factual, and authoritative. Avoid filler phrases.
5. Use conversation history to resolve references like "that" or "it".

FORMAT:
- Lead with the direct answer
- Use bullet points for lists of 3+ items
- End with one actionable takeaway where relevant
- Keep responses under 400 words unless more detail is needed

${context ? `### HUB DOCUMENTS:\n${context}` : ''}`

    const contents = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: `System: ${systemPrompt}\n\nUser: ${userText}` }]
      }
    ]

    const generationConfig = { maxOutputTokens: 1000, temperature: 0.3 }

    // 4. Try each model in order until one succeeds
    let lastError = ''
    for (const model of MODELS) {
      const { ok: isOk, status, data } = await callGemini(GOOGLE_AI_API_KEY, model, contents, generationConfig)

      if (status === 429) {
        // Rate limited — try next model, or fail with retryable error
        lastError = `rate_limited:${model}`
        console.warn(`[gemini] ${model} rate limited (429), trying next model`)
        continue
      }

      if (status === 404) {
        // Model not available with this key — try next
        lastError = `model_not_found:${model}`
        console.warn(`[gemini] ${model} not found (404), trying next model`)
        continue
      }

      if (!isOk) {
        lastError = data?.error?.message || `http_${status}`
        console.error(`[gemini] ${model} error:`, lastError)
        continue
      }

      if (data?.promptFeedback?.blockReason) {
        console.warn(`[gemini] ${model} blocked:`, data.promptFeedback.blockReason)
        return ok({ error: `blocked:${data.promptFeedback.blockReason}` })
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!content) {
        const reason = data.candidates?.[0]?.finishReason || 'unknown'
        console.error(`[gemini] ${model} no content. finishReason:`, reason)
        lastError = `no_content:${reason}`
        continue
      }

      // Success
      console.log(`[gemini] ${model} responded successfully`)
      return ok({ content, model })
    }

    // All models failed
    console.error('[gemini] All models failed. Last error:', lastError)
    return ok({ error: 'all_models_failed', detail: lastError })

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[gemini] Unhandled exception:', msg)
    return ok({ error: 'exception', detail: msg })
  }
})
