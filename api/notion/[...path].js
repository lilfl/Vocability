module.exports = async function handler(req, res) {
  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path || '']
  const targetUrl = 'https://api.notion.com/' + parts.join('/')

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      'Authorization': req.headers.authorization || '',
    },
    body: req.method !== 'GET' && req.method !== 'HEAD'
      ? JSON.stringify(req.body)
      : undefined,
  })

  const text = await response.text()
  res.status(response.status).end(text)
}
