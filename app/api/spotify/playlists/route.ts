import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    // First get the user profile to get the user_id
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await profileResponse.json();
    
    // Get the search params
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    // Then get the user's playlists
    const playlistsResponse = await fetch(
      `https://api.spotify.com/v1/users/${profile.id}/playlists?` + 
      new URLSearchParams({
        limit,
        offset
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!playlistsResponse.ok) {
      throw new Error('Failed to fetch playlists');
    }

    const data = await playlistsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}