import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for User Preferences
  return NextResponse.json({
    email_notifications: true,
    push_notifications: false,
    language: 'en',
    theme: 'dark',
  });
}

export async function PUT(request: Request) {
  const data = await request.json();
  return NextResponse.json({
    email_notifications: data.email_notifications ?? true,
    push_notifications: data.push_notifications ?? false,
    language: data.language || 'en',
    theme: data.theme || 'dark',
  });
}
