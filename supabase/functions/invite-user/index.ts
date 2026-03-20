import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight options request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Check if the user making the request is an admin
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role?.toLowerCase() !== 'admin' && (!user.email || !user.email.toLowerCase().includes('admin'))) {
      return new Response(JSON.stringify({ error: 'Forbidden: Requires Admin Role' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const body = await req.json()
    const { email, name, role } = body

    if (!email || !name) {
       return new Response(JSON.stringify({ error: 'Email and name are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Create a Supabase admin client to invite the user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Starting invitation for ${email}...`);

    // 1. Generate an invitation link - This is DB-only and EXTREMELY fast.
    console.log("Step 1: Generating invitation link...");
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        data: { full_name: name, role: role || 'Learner' },
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/dashboard`
      }
    })

    let targetUserId: string | undefined
    let invitationLink: string | undefined

    if (linkError) {
      console.log("Link generation error (checking if user exists):", linkError.message);
      if (linkError.message.includes('already registered') || linkError.message.includes('exists')) {
        // Fetch existing user ID
        const { data: existingUser } = await supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle()
        targetUserId = existingUser?.id
        console.log("Existing user found with ID:", targetUserId);
      } else {
        throw linkError
      }
    } else {
      targetUserId = linkData.user.id
      invitationLink = linkData.properties?.action_link
    }

    if (!targetUserId) {
      // One last try to get the ID if we still don't have it
      const { data: authUser } = await supabaseAdmin.auth.admin.listUsers()
      targetUserId = authUser.users.find(u => u.email === email)?.id
    }

    if (!targetUserId) throw new Error("Could not identify or create user")

    // 2. Upsert the profile table immediately
    console.log(`Step 2: Upserting profile for user ${targetUserId}...`);
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: targetUserId,
        email,
        name,
        role: role || 'Learner',
        status: 'Active'
      })

    if (profileError) throw profileError

    // 3. Try sending the email, but don't let it block the response forever if it's slow
    // We'll give it a short race
    console.log("Step 3: Attempting to send invitation email...");
    const invitePromise = supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name, role: role || 'Learner' }
    })

    // Wait up to 5 seconds for the email, then just return the link
    const inviteRace = await Promise.race([
      invitePromise,
      new Promise((res) => setTimeout(() => res({ data: null, error: 'Email delivery taking too long, returning link' }), 5000))
    ]) as any;

    return new Response(JSON.stringify({ 
      message: inviteRace.error ? 'User created, but email delivery is slow.' : 'Invitation successful', 
      userId: targetUserId,
      inviteLink: invitationLink 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
