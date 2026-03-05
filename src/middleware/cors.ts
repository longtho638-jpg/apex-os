import { type NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://apexrebate.com',
  'https://www.apexrebate.com',
  'https://sophia-ai-factory.vercel.app',
  'https://telegram.org',
  'https://web.telegram.org',
];

if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000');
}

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow specific Vercel production and preview deployments
  if (origin === 'https://sophia-ai-factory.vercel.app' || origin.endsWith('-longtho638-jpg.vercel.app')) return true;
  // Allow Telegram subdomains
  if (origin.endsWith('.telegram.org')) return true;
  // Allow TradingView
  if (origin.endsWith('.tradingview.com')) return true;
  return false;
}

export function applyCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');

  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, sentry-trace, baggage, x-client-info, x-admin-role',
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export function handleOptionsRequest(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (origin && isOriginAllowed(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With, sentry-trace, baggage, x-client-info, x-admin-role',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return new NextResponse(null, { status: 204 });
}
