import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { BiometricService } from '../services/biometric';
import { StorageService } from '../services/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanFace, Lock } from 'lucide-react-native';

export default function LoginScreen() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleBiometricLogin = async () => {
        setIsAuthenticating(true);
        const success = await BiometricService.authenticate();

        if (success) {
            // Mock login success - store a dummy token
            await StorageService.saveItem('auth_token', 'mock_mobile_token_123');
            router.replace('/(tabs)');
        }
        setIsAuthenticating(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Lock size={40} color="#00FF94" />
                    </View>
                    <Text style={styles.title}>Apex Financial OS</Text>
                    <Text style={styles.subtitle}>Institutional Grade Security</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.biometricButton}
                        onPress={handleBiometricLogin}
                        disabled={isAuthenticating}
                    >
                        <ScanFace size={24} color="#000" />
                        <Text style={styles.biometricButtonText}>
                            {isAuthenticating ? 'Verifying...' : 'Sign in with FaceID'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Use Password</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 255, 148, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 148, 0.2)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    actions: {
        gap: 16,
    },
    biometricButton: {
        backgroundColor: '#00FF94',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        gap: 12,
    },
    biometricButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        padding: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 14,
    },
});
