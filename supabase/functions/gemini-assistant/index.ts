import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    const { userText, context, conversationHistory, userId } = await req.json()

    if (!GOOGLE_AI_API_KEY) throw new Error("GOOGLE_AI_API_KEY is not set")
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase environment variables not set")

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Rate Limiting (20 queries per day per user)
    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage, error: usageError } = await supabase
        .from('explore_usage')
        .select('query_count')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (usage && usage.query_count >= 20) {
        return new Response(JSON.stringify({ error: 'daily_limit_reached', limit: 20 }), {
          status: 200, // Handle as response with error field
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        })
      }

      if (usage) {
        await supabase.from('explore_usage').update({ query_count: usage.query_count + 1 }).eq('user_id', userId).eq('date', today)
      } else {
        await supabase.from('explore_usage').insert({ user_id: userId, query_count: 1, date: today })
      }
    }

    // 2. Gap Logging (if no context matches)
    if (!context || context.trim() === '') {
      await supabase.from('explore_gaps').insert({ query: userText, user_id: userId })
    }

    // 3. Google Gemini API Setup
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`;

    const systemPrompt = `You are the GRH Research Assistant — an expert in governance, public financial management, anti-corruption, electoral systems, and institutional governance.

STRICT RULES:
1. If Hub documents are provided below, you MUST base your answer on those documents. Do not introduce outside information as primary content.
2. You may use your general governance knowledge only to add brief clarifying context, clearly separated from the document-based answer.
3. If no Hub documents are provided, answer from your expert governance knowledge and clearly state: "This answer is based on general governance expertise. We don't have a specific Hub resource on this topic yet."
4. Be precise, factual, and authoritative. Avoid filler phrases.
5. Structure longer answers with clear headings where appropriate.
6. Always be aware of the conversation history — if the user says "that" or "it", resolve what they are referring to from previous messages.

FORMAT:
- Lead with the direct answer
- Use bullet points for lists of 3+ items
- End with one actionable takeaway where relevant
- Keep responses under 400 words unless the question demands more detail

${context ? `### HUB DOCUMENTS:\n${context}` : ''}`;

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

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1,
        }
      }),
    })

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  }
})
