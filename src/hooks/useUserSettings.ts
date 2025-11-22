/**
 * useUserSettings - Hook for managing all user settings data
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    fetchUserProfile,
    updateUserProfile,
    fetchAPIKeys,
    createAPIKey,
    deleteAPIKey,
    fetchPreferences,
    updatePreferences,
    UserProfile,
    APIKeyMetadata,
    UserPreferences,
    UpdateProfileData,
    CreateAPIKeyData,
    UpdatePreferencesData
} from '@/lib/api/settings';

interface UseUserSettingsResult {
    // Data
    profile: UserProfile | null;
    apiKeys: APIKeyMetadata[];
    preferences: UserPreferences | null;

    // Loading states
    loading: boolean;
    profileLoading: boolean;
    keysLoading: boolean;
    preferencesLoading: boolean;

    // Error state
    error: Error | null;

    // Actions
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    addAPIKey: (data: CreateAPIKeyData) => Promise<void>;
    removeAPIKey: (keyId: string) => Promise<void>;
    updatePrefs: (data: UpdatePreferencesData) => Promise<void>;
    refetch: () => void;
}

export function useUserSettings(): UseUserSettingsResult {
    const { user, token } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [apiKeys, setAPIKeys] = useState<APIKeyMetadata[]>([]);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [keysLoading, setKeysLoading] = useState(false);
    const [preferencesLoading, setPreferencesLoading] = useState(false);

    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!user || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [profileData, keysData, prefsData] = await Promise.all([
                fetchUserProfile(user.id, token),
                fetchAPIKeys(user.id, token),
                fetchPreferences(user.id, token)
            ]);

            setProfile(profileData);
            setAPIKeys(keysData);
            setPreferences(prefsData);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateProfile = useCallback(async (data: UpdateProfileData) => {
        if (!user || !token) return;

        try {
            setProfileLoading(true);
            setError(null);
            const updated = await updateUserProfile(user.id, data, token);
            setProfile(updated);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setProfileLoading(false);
        }
    }, [user, token]);

    const addAPIKey = useCallback(async (data: CreateAPIKeyData) => {
        if (!user || !token) return;

        try {
            setKeysLoading(true);
            setError(null);
            await createAPIKey(user.id, data, token);
            // Refetch keys
            const keys = await fetchAPIKeys(user.id, token);
            setAPIKeys(keys);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setKeysLoading(false);
        }
    }, [user, token]);

    const removeAPIKey = useCallback(async (keyId: string) => {
        if (!user || !token) return;

        try {
            setKeysLoading(true);
            setError(null);
            await deleteAPIKey(user.id, keyId, token);
            // Update local state
            setAPIKeys(prev => prev.filter(k => k.id !== keyId));
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setKeysLoading(false);
        }
    }, [user, token]);

    const updatePrefs = useCallback(async (data: UpdatePreferencesData) => {
        if (!user || !token) return;

        try {
            setPreferencesLoading(true);
            setError(null);
            const updated = await updatePreferences(user.id, data, token);
            setPreferences(updated);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setPreferencesLoading(false);
        }
    }, [user, token]);

    return {
        profile,
        apiKeys,
        preferences,
        loading,
        profileLoading,
        keysLoading,
        preferencesLoading,
        error,
        updateProfile,
        addAPIKey,
        removeAPIKey,
        updatePrefs,
        refetch: fetchData
    };
}
