import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const cookieStore = await cookies();
  const storedState = cookieStore.get('spotify_auth_state')?.value;

  if (state === null || state !== storedState) {
    return NextResponse.redirect(new URL('/?error=state_mismatch', request.url));
  }

  cookieStore.delete('spotify_auth_state');

  try {
    // Log the values being sent (remove in production)
    console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('Redirect URI:', process.env.REDIRECT_URI);
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: querystring.stringify({
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      // Log the error response (remove in production)
      console.error('Spotify API Error:', data);
      return NextResponse.redirect(
        new URL(`/?error=${data.error}&error_description=${data.error_description}`, request.url)
      );
    }

    cookieStore.set('access_token', data.access_token);
    cookieStore.set('refresh_token', data.refresh_token);
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}