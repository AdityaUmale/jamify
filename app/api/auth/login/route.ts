import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const state = crypto.randomBytes(20).toString('hex');
  
  const cookieStore = await cookies();
  cookieStore.set('spotify_auth_state', state);

  // Log the values being used (remove in production)
  console.log('Login Request:', {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: process.env.REDIRECT_URI
  });

  const scope = 'user-read-private user-read-email';

  return NextResponse.redirect(
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state
    })
  );
}