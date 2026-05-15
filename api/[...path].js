export default async function handler(req, res) {
  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path || '']
  const [service, ...rest] = parts

  let targetBase
  const extraHeaders = {}

  if (service === 'openai') {
    targetBase = 'https://api.openai.com'
  } else if (service === 'notion') {
    targetBase = 'https://api.notion.com'
    extraHeaders['Notion-Version'] = '2022-06-28'
  } else {
    return res.status(400).json({ error: `Unknown service: ${service}` })
  }

  const targetUrl = targetBase + '/' + rest.join('/')

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization || '',
      ...extraHeaders,
    },
    body: req.method !== 'GET' && req.method !== 'HEAD'
      ? JSON.stringify(req.body)
      : undefined,
  })

  const text = await response.text()
  res.status(response.status).end(text)
}
