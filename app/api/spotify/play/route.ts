import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { device_id, uris } = body;

    if (!device_id || !uris) {
      return NextResponse.json(
        { error: 'Missing device_id or uris in request body' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_id,
        uris
      })
    });

    if (!response.ok) {
      // Handle specific Spotify API errors
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error.message || 'Failed to start playback' },
        { status: response.status }
      );
    }

    // Spotify returns 204 No Content on success
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in play endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to control playback' },
      { status: 500 }
    );
  }
}

// Optionally add PATCH method for pause/resume
export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, device_id } = body;

    if (!action || (action !== 'pause' && action !== 'resume')) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "pause" or "resume"' },
        { status: 400 }
      );
    }

    const endpoint = action === 'pause' 
      ? 'https://api.spotify.com/v1/me/player/pause'
      : 'https://api.spotify.com/v1/me/player/play';

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: device_id ? JSON.stringify({ device_id }) : null
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error.message || `Failed to ${action} playback` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`Error in ${request.method} playback endpoint:`, error);
    return NextResponse.json(
      { error: 'Failed to control playback' },
      { status: 500 }
    );
  }
}