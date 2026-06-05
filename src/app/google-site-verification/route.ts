import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Replace with actual verification code from Google Search Console
  return new NextResponse('google-site-verification: your-verification-code', {
    headers: { 'Content-Type': 'text/html' },
  })
}
