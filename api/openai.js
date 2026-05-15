export default async function handler(req, res) {
  const path = req.query.path || ''
  const targetUrl = `https://api.openai.com/${path}`

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
  res.status(response.status).end(text)
}
