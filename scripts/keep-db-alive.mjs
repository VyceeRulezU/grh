const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars")
  process.exit(1)
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?select=id&limit=1`, {
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  },
})

console.log(`Keep-alive pinged at ${new Date().toISOString()} — HTTP ${res.status}`)
