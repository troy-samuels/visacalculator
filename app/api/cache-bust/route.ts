export const revalidate = 0

export async function GET() {
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    message: "Cache busted - fresh deployment active",
    deployment: "2025-07-12-21-50",
    version: "v2.0.0"
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'CDN-Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    }
  })
} 