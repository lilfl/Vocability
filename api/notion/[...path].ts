import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? '']
  const targetUrl = `https://api.notion.com/${parts.join('/')}`

  const headers: Record<string, string> = {
    'Content-Type': req.headers['content-type'] ?? 'application/json',
    'Notion-Version': '2022-06-28',
  }
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization as string
  }

  const chunks: Buffer[] = []
  for await (const chunk of req as unknown as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const rawBody = Buffer.concat(chunks)

  const response = await fetch(targetUrl, {
    method: req.method ?? 'GET',
    headers,
    body: rawBody.length > 0 ? rawBody : undefined,
  })

  const text = await response.text()
  res.status(response.status).setHeader('Content-Type', 'application/json').send(text)
}
