export default async function handler(req, res) {
  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path || '']
  const targetUrl = 'https://api.openai.com/' + parts.join('/')

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization || '',
    },
    body: req.method !== 'GET' && req.method !== 'HEAD'
      ? JSON.stringify(req.body)
      : undefined,
  })

  const text = await response.text()

  if (!response.ok) {
    return res.status(response.status).json({
      _debug: {
        method: req.method,
        targetUrl,
        status: response.status,
        hasAuth: !!req.headers.authorization,
        bodyType: typeof req.body,
      },
      _openaiResponse: text,
    })
  }

  res.status(response.status).end(text)
}
