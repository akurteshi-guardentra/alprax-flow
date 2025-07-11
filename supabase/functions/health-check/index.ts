import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  services: {
    database: { status: string; latency?: number; error?: string }
    auth: { status: string; latency?: number; error?: string }
    storage: { status: string; latency?: number; error?: string }
  }
  version: string
  uptime: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const startTime = Date.now()
    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown' },
        auth: { status: 'unknown' },
        storage: { status: 'unknown' }
      },
      version: '1.0.0',
      uptime: startTime
    }

    // Check database connectivity
    try {
      const dbStart = Date.now()
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      healthCheck.services.database = {
        status: dbError ? 'unhealthy' : 'healthy',
        latency: Date.now() - dbStart,
        error: dbError?.message
      }
    } catch (error) {
      healthCheck.services.database = {
        status: 'unhealthy',
        error: error.message
      }
    }

    // Check auth service
    try {
      const authStart = Date.now()
      const { error: authError } = await supabase.auth.getUser()
      
      healthCheck.services.auth = {
        status: authError ? 'degraded' : 'healthy',
        latency: Date.now() - authStart,
        error: authError?.message
      }
    } catch (error) {
      healthCheck.services.auth = {
        status: 'unhealthy',
        error: error.message
      }
    }

    // Check storage service
    try {
      const storageStart = Date.now()
      const { error: storageError } = await supabase.storage
        .from('kyc_documents')
        .list('', { limit: 1 })
      
      healthCheck.services.storage = {
        status: storageError ? 'degraded' : 'healthy',
        latency: Date.now() - storageStart,
        error: storageError?.message
      }
    } catch (error) {
      healthCheck.services.storage = {
        status: 'unhealthy',
        error: error.message
      }
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
      timestamp: new Date().toISOString(),
      error: error.message
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})