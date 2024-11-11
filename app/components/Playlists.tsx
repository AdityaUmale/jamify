'use client';
import { useEffect, useState } from 'react';

interface Track {
  added_at: string;
  added_by: {
    id: string;
    display_name?: string;
  };
  track: {
    id: string;
    name: string;
    artists: Array<{
      name: string;
    }>;
    album: {
      name: string;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
    };
    duration_ms: number;
    uri: string;
  } | null;
  is_local: boolean;
}

interface TracksResponse {
  items: Track[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

interface Playlist {
  collaborative: boolean;
  description: string | null;
  external_urls: { spotify: string };
  href: string;
  id: string;
  images: { url: string; height: number; width: number }[];
  name: string;
  owner: {
    display_name: string;
    id: string;
    type: string;
    uri: string;
  };
  public: boolean;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
}

interface PlaylistsResponse {
  items: Playlist[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllPlaylists = async () => {
    try {
      setLoading(true);
      let allPlaylists: Playlist[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`/api/spotify/playlists?limit=50&offset=${offset}`);
        if (!response.ok) throw new Error('Failed to fetch playlists');
        const data: PlaylistsResponse = await response.json();
        
        allPlaylists = [...allPlaylists, ...data.items];
        
        if (data.next) {
          offset += data.limit;
        } else {
          hasMore = false;
        }
      }

      setPlaylists(allPlaylists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistTracks = async (playlistId: string) => {
    try {
      setLoadingTracks(true);
      setError(null);
      let allTracks: Track[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `/api/spotify/playlists/${playlistId}/tracks?limit=50&offset=${offset}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tracks: ${response.statusText}`);
        }
        
        const data: TracksResponse = await response.json();
        const validTracks = data.items.filter(item => item.track !== null);
        allTracks = [...allTracks, ...validTracks];
        
        if (data.next) {
          offset += data.limit;
        } else {
          hasMore = false;
        }
      }

      setPlaylistTracks(allTracks);
    } catch (err) {
      console.error('Error in fetchPlaylistTracks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tracks');
    } finally {
      setLoadingTracks(false);
    }
  };

  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    fetchPlaylistTracks(playlistId);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    fetchAllPlaylists();
  }, []);

  if (loading && playlists.length === 0) return <div>Loading playlists...</div>;
  if (error) return <div>Error: {error}</div>;
  if (playlists.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handlePlaylistClick(playlist.id)}
          >
            {playlist.images[0] && (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="w-full h-48 object-cover rounded-md"
              />
            )}
            <h3 className="text-xl font-semibold mt-2">{playlist.name}</h3>
            {playlist.description && (
              <p className="text-gray-600 mt-1">{playlist.description}</p>
            )}
            <p className="text-gray-600 mt-1">
              By {playlist.owner.display_name} • {playlist.tracks.total} tracks
            </p>
            <p className="text-gray-600 mt-1">
              {playlist.public ? 'Public' : 'Private'} •
              {playlist.collaborative ? ' Collaborative' : ' Standard'}
            </p>
          </div>
        ))}
      </div>

      {selectedPlaylist && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Tracks</h2>
          {loadingTracks ? (
            <div>Loading tracks...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div className="space-y-2">
              {playlistTracks.map((item, index) => {
                if (!item.track) return null;
                
                return (
                  <div 
                    key={item.track.id || `local-${index}`}
                    className="flex items-center p-2 hover:bg-gray-100 rounded"
                  >
                    <div className="w-12 h-12">
                      {item.track.album.images[0] && (
                        <img 
                          src={item.track.album.images[0].url}
                          alt={item.track.album.name}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="font-medium">{item.track.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.track.artists.map(artist => artist.name).join(', ')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDuration(item.track.duration_ms)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-center text-gray-600">
        Showing all {playlists.length} playlists
      </div>
    </div>
  );
}