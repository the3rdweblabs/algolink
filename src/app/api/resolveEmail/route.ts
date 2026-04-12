// src/app/api/resolveEmail/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getPublicWalletByEmail } from '@/app/actions/walletActions'; // Using the server action

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email query parameter is required' }, { status: 400 });
  }
  
  if (!/^\S+@\S+\.\S+$/.test(email)) {
     return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Simulate a short delay (optional, can be removed if DB query is fast enough)
  // await new Promise(resolve => setTimeout(resolve, 100));

  const foundLink = await getPublicWalletByEmail(email);

  if (foundLink) {
    return NextResponse.json({ 
      email: foundLink.email, 
      walletAddress: foundLink.walletAddress 
    });
  } else {
    return NextResponse.json({ 
      error: 'Wallet not found or not publicly listed for this email' 
    }, { status: 404 });
  }
}
