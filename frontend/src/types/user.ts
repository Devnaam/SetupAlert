export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  voice_enabled: boolean;
  voice_name: string | null;
  voice_rate: number;
  voice_pitch: number;
  voice_volume: number;
  browser_notifications_enabled: boolean;
  sound_enabled: boolean;
  theme: 'dark' | 'light' | 'system';
  timezone: string;
  created_at: string;
  updated_at: string;
}
