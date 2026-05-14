import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? '']
  const path = parts.join('/')

  const targetUrl = `https://api.notion.com/${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  }

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization
  }

  const response = await fetch(targetUrl, {
    method: req.method ?? 'GET',
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
