import * as SecureStore from 'expo-secure-store';

export const StorageService = {
    async saveItem(key: string, value: string) {
        await SecureStore.setItemAsync(key, value);
    },

    async getItem(key: string) {
        return await SecureStore.getItemAsync(key);
    },

    async deleteItem(key: string) {
        await SecureStore.deleteItemAsync(key);
    }
};
