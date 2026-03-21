import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")

serve(async (req) => {
  // Handle CORS
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
    const { userText } = await req.json()

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in Supabase secrets")
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are the Governance AI Assistant for the Governance Resource Hub (GRH). You are trained on governance, public financial management, anti-corruption, electoral systems, and open government resources. Be concise, evidence-based, and cite frameworks or documents where relevant." },
          { role: "user", content: userText },
        ],
        max_tokens: 400,
      }),
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

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
