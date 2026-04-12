import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")

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
    const { userText, context } = await req.json()

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not set")
    }

    // Google Gemini API Endpoint for Gemini 1.5 Flash
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`;

    const systemPrompt = `You are the Expert Governance AI Assistant for the Governance Resource Hub (GRH).
You have access to a vast library of public sector frameworks, PFM strategies, and anti-corruption tools.

${context ? `### MANDATORY REFERENCE MATERIAL:
The following relevant documents were found in our hub library:
${context}

INSTRUCTIONS:
1. Use the information in the documents above to answer the user's question accurately.
2. If the user asks for a summary, provide a professional synthesis of the provided context.
3. Mention that you are using information found in the hub library.
4. If the context doesn't fully answer the question, supplement with your general knowledge but prioritize the context.` : 'Answer based on your general knowledge of governance, but mention that you couldn\'t find a specific document match in the hub library for this exact query.'}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System: ${systemPrompt}\n\nUser: ${userText}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1, // Lower temperature for more consistent/grounded responses
        }
      }),
    })

    const data = await response.json()
    // Gemini response structure: candidates[0].content.parts[0].text
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
