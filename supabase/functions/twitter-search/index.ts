const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
    if (!bearerToken) {
      return new Response(
        JSON.stringify({ error: 'TWITTER_BEARER_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const query = url.searchParams.get('query') || 'autonomous'
    const maxResults = url.searchParams.get('max_results') || '20'

    const twitterUrl = new URL('https://api.x.com/2/tweets/search/recent')
    twitterUrl.searchParams.set('query', `${query} -is:retweet lang:en`)
    twitterUrl.searchParams.set('max_results', maxResults)
    twitterUrl.searchParams.set('tweet.fields', 'created_at,public_metrics,author_id')
    twitterUrl.searchParams.set('expansions', 'author_id')
    twitterUrl.searchParams.set('user.fields', 'name,username,verified,profile_image_url')

    console.log('Fetching tweets:', twitterUrl.toString())

    const response = await fetch(twitterUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Twitter API error:', JSON.stringify(data))
      return new Response(
        JSON.stringify({ error: data.detail || data.title || 'Twitter API error', status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map users by ID for easy lookup
    const users: Record<string, any> = {}
    if (data.includes?.users) {
      for (const user of data.includes.users) {
        users[user.id] = user
      }
    }

    // Transform into our tweet format
    const tweets = (data.data || []).map((tweet: any, i: number) => {
      const user = users[tweet.author_id] || {}
      const metrics = tweet.public_metrics || {}
      return {
        id: tweet.id,
        handle: `@${user.username || 'unknown'}`,
        username: user.name || 'Unknown',
        avatar: (user.name || 'U').slice(0, 2).toUpperCase(),
        avatarUrl: user.profile_image_url || null,
        content: tweet.text,
        timestamp: tweet.created_at,
        likes: metrics.like_count || 0,
        retweets: metrics.retweet_count || 0,
        replies: metrics.reply_count || 0,
        verified: user.verified || false,
      }
    })

    console.log(`Returning ${tweets.length} tweets`)

    return new Response(
      JSON.stringify({ tweets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
