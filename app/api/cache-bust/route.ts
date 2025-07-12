export const revalidate = 0

export async function GET() {
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    message: "FORCE CSS REBUILD - Fresh deployment with new CSS assets",
    deployment: "2025-07-12-22-15-FORCE-CSS-REBUILD", 
    version: "v2.1.0-CSS-FIX"
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