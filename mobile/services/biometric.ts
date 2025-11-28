import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export const BiometricService = {
    /**
     * Check if hardware supports biometrics
     */
    async checkHardware(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        return hasHardware;
    },

    /**
     * Check if biometrics are enrolled
     */
    async checkEnrollment(): Promise<boolean> {
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return isEnrolled;
    },

    /**
     * Authenticate user
     */
    async authenticate(): Promise<boolean> {
        try {
            const hasHardware = await this.checkHardware();
            const isEnrolled = await this.checkEnrollment();

            if (!hasHardware || !isEnrolled) {
                Alert.alert('Biometrics not available', 'Please enable FaceID or TouchID in your device settings.');
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access Apex OS',
                fallbackLabel: 'Use Passcode',
            });

            return result.success;
        } catch (error) {
            console.error('Biometric auth error:', error);
            return false;
        }
    }
};
