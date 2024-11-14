interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: SpotifyPlayerConfig) => Spotify.Player;
    };
  }
  
  declare namespace Spotify {
    interface Player {
      connect(): Promise<boolean>;
      disconnect(): void;
      addListener(event: string, callback: (state: any) => void): boolean;
      removeListener(event: string): void;
      getCurrentState(): Promise<PlayerState | null>;
      setVolume(volume: number): Promise<void>;
      pause(): Promise<void>;
      resume(): Promise<void>;
      togglePlay(): Promise<void>;
      seek(position_ms: number): Promise<void>;
      previousTrack(): Promise<void>;
      nextTrack(): Promise<void>;
    }
  
    interface PlayerState {
      context: {
        uri: string;
        metadata: any;
      };
      bitrate: number;
      position: number;
      duration: number;
      paused: boolean;
      shuffle: boolean;
      repeat_mode: number;
      track_window: {
        current_track: Track;
        previous_tracks: Track[];
        next_tracks: Track[];
      };
      timestamp: number;
      restrictions: {
        disallow_resuming_reasons: string[];
        disallow_skipping_prev_reasons: string[];
      };
    }
  
    interface Track {
      uri: string;
      id: string;
      type: string;
      media_type: string;
      name: string;
      duration_ms: number;
      artists: Artist[];
      album: Album;
      is_playable: boolean;
    }
  
    interface Artist {
      uri: string;
      name: string;
    }
  
    interface Album {
      uri: string;
      name: string;
      images: Image[];
    }
  
    interface Image {
      url: string;
    }
  
    interface SpotifyPlayerConfig {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }
  }

  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: {
      Player: new (config: SpotifyPlayerConfig) => Spotify.Player;
    };
  }