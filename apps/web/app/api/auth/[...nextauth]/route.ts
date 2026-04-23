// Stub auth route for static export compatibility
export async function generateStaticParams() {
  return [
    { nextauth: ['signin'] },
    { nextauth: ['signout'] },
    { nextauth: ['session'] },
    { nextauth: ['csrf'] },
    { nextauth: ['callback', 'google'] },
    { nextauth: ['error'] },
  ];
}

export async function GET() {
  return new Response(JSON.stringify({ error: 'Auth requires server runtime' }), { status: 503 });
}
export async function POST() {
  return new Response(JSON.stringify({ error: 'Auth requires server runtime' }), { status: 503 });
}
