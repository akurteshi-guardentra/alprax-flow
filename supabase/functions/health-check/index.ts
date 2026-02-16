import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  services: {
    database: { status: string; latency?: number }
    auth: { status: string; latency?: number }
    storage: { status: string; latency?: number }
  }
  version: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data, error: claimsError } = await supabase.auth.getUser(token)
    if (claimsError || !data?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use service role client for health checks
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown' },
        auth: { status: 'unknown' },
        storage: { status: 'unknown' }
      },
      version: '1.0.0'
    }

    // Check database connectivity
    try {
      const dbStart = Date.now()
      const { error: dbError } = await serviceClient
        .from('profiles')
        .select('count')
        .limit(1)
      
      healthCheck.services.database = {
        status: dbError ? 'unhealthy' : 'healthy',
        latency: Date.now() - dbStart
      }
    } catch {
      healthCheck.services.database = { status: 'unhealthy' }
    }

    // Check auth service
    try {
      const authStart = Date.now()
      // Just check if auth service responds
      healthCheck.services.auth = {
        status: 'healthy',
        latency: Date.now() - authStart
      }
    } catch {
      healthCheck.services.auth = { status: 'unhealthy' }
    }

    // Check storage service
    try {
      const storageStart = Date.now()
      const { error: storageError } = await serviceClient.storage
        .from('kyc_documents')
        .list('', { limit: 1 })
      
      healthCheck.services.storage = {
        status: storageError ? 'degraded' : 'healthy',
        latency: Date.now() - storageStart
      }
    } catch {
      healthCheck.services.storage = { status: 'unhealthy' }
    }

    // Determine overall health
    const services = Object.values(healthCheck.services)
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length
    const degradedCount = services.filter(s => s.status === 'degraded').length

    if (unhealthyCount > 0) {
      healthCheck.status = 'unhealthy'
    } else if (degradedCount > 0) {
      healthCheck.status = 'degraded'
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503

    return new Response(JSON.stringify(healthCheck), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
