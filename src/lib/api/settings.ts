/**
 * Settings API Client - User Profile, API Keys, and Preferences
 */

import { apiClient } from './client';

// ==================== TypeScript Interfaces ====================

export interface UserProfile {
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
}

export interface APIKeyMetadata {
  id: string;
  exchange: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
}

export interface CreateAPIKeyData {
  exchange: string;
  api_key: string;
  api_secret: string;
  label?: string;
}

export interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  language: string;
  theme: string;
}

export interface UpdatePreferencesData {
  email_notifications?: boolean;
  push_notifications?: boolean;
  language?: string;
  theme?: string;
}

// ==================== API Functions ====================

export async function fetchUserProfile(_userId: string, token: string): Promise<UserProfile> {
  const response = await apiClient<UserProfile>('/user/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export async function updateUserProfile(_userId: string, data: UpdateProfileData, token: string): Promise<UserProfile> {
  const response = await apiClient<UserProfile>('/user/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function fetchAPIKeys(_userId: string, token: string): Promise<APIKeyMetadata[]> {
  const response = await apiClient<APIKeyMetadata[]>('/user/api-keys', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export async function createAPIKey(
  _userId: string,
  data: CreateAPIKeyData,
  token: string,
): Promise<{ success: boolean; key_id: string; message: string }> {
  const response = await apiClient<{ success: boolean; key_id: string; message: string }>('/user/api-keys', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response;
}

export async function deleteAPIKey(
  _userId: string,
  keyId: string,
  token: string,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient<{ success: boolean; message: string }>(`/user/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export async function fetchPreferences(_userId: string, token: string): Promise<UserPreferences> {
  const response = await apiClient<UserPreferences>('/user/preferences', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export async function updatePreferences(
  _userId: string,
  data: UpdatePreferencesData,
  token: string,
): Promise<UserPreferences> {
  const response = await apiClient<UserPreferences>('/user/preferences', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response;
}
