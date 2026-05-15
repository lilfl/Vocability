export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/notion/, '')
  const targetUrl = `https://api.notion.com${path}${url.search}`

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  })
  const auth = request.headers.get('authorization')
  if (auth) headers.set('Authorization', auth)

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.text()
    : null

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body ?? undefined,
  })

  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
