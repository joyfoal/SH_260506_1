const SYSTEM_PROMPT =
  'You are a data analyst. Return concise business insights as a JSON array of strings.'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const { summary, charts } = await req.json()
    const apiKey = process.env.API_SECRET_KEY

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          insights: ['API key is missing. Add API_SECRET_KEY to environment variables.'],
        }),
        { status: 200 },
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: JSON.stringify({
              task: 'Provide 3-5 key insights in Korean or English.',
              summary,
              charts,
            }),
          },
        ],
      }),
    })

    const completion = await response.json()
    const content = completion?.choices?.[0]?.message?.content

    if (!content) {
      return new Response(
        JSON.stringify({ insights: ['No insight text was returned from AI response.'] }),
        { status: 200 },
      )
    }

    let parsed: { insights?: string[] } = {}
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = { insights: [String(content)] }
    }

    return new Response(JSON.stringify({ insights: parsed.insights ?? [] }), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({
        insights: [
          `Insight API failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        ],
      }),
      { status: 500 },
    )
  }
}
