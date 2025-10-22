/**
 * API Service - Handles all backend API calls
 */
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface MoodLog {
  id: number;
  user_id: number;
  mood_tags: string[];
  journal_entry: string;
  created_at: string;
}

export interface SpotifyTrack {
  id: number;
  track_id: string;
  track_name: string;
  artist: string;
  preview_url?: string;
}

export interface UserReaction {
  id: number;
  user_id: number;
  mood_log_id: number;
  track_id: number;
  reaction_type: string;
}

// User API
export const userAPI = {
  create: async (email: string, username: string, password: string): Promise<User> => {
    const response = await api.post<User>('/api/users', { email, username, password });
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  },
};

// Mood Log API
export const moodLogAPI = {
  create: async (user_id: number, mood_tags: string[], journal_entry?: string): Promise<MoodLog> => {
    const response = await api.post<MoodLog>('/api/mood-logs', {
      user_id,
      mood_tags,
      journal_entry,
    });
    return response.data;
  },

  getAll: async (user_id?: number): Promise<MoodLog[]> => {
    const params = user_id ? { user_id } : {};
    const response = await api.get<MoodLog[]>('/api/mood-logs', { params });
    return response.data;
  },

  getById: async (id: number): Promise<MoodLog> => {
    const response = await api.get<MoodLog>(`/api/mood-logs/${id}`);
    return response.data;
  },
};

// Spotify Track API
export const spotifyTrackAPI = {
  create: async (track_id: string, track_name: string, artist: string, preview_url?: string): Promise<SpotifyTrack> => {
    const response = await api.post<SpotifyTrack>('/api/spotify-tracks', {
      track_id,
      track_name,
      artist,
      preview_url,
    });
    return response.data;
  },

  getAll: async (): Promise<SpotifyTrack[]> => {
    const response = await api.get<SpotifyTrack[]>('/api/spotify-tracks');
    return response.data;
  },

  getById: async (id: number): Promise<SpotifyTrack> => {
    const response = await api.get<SpotifyTrack>(`/api/spotify-tracks/${id}`);
    return response.data;
  },
};

// User Reaction API
export const userReactionAPI = {
  create: async (user_id: number, mood_log_id: number, track_id: number, reaction_type: string): Promise<UserReaction> => {
    const response = await api.post<UserReaction>('/api/user-reactions', {
      user_id,
      mood_log_id,
      track_id,
      reaction_type,
    });
    return response.data;
  },

  getAll: async (user_id?: number, mood_log_id?: number): Promise<UserReaction[]> => {
    const params: any = {};
    if (user_id) params.user_id = user_id;
    if (mood_log_id) params.mood_log_id = mood_log_id;
    const response = await api.get<UserReaction[]>('/api/user-reactions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<UserReaction> => {
    const response = await api.get<UserReaction>(`/api/user-reactions/${id}`);
    return response.data;
  },
};

export default api;
