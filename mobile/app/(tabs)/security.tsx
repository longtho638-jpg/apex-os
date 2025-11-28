import React, { useState } from 'react';
import { StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { BiometricService } from '@/services/biometric';
import { Shield, Smartphone, History, ChevronRight } from 'lucide-react-native';

export default function SecurityScreen() {
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);

    const toggleBiometrics = async () => {
        // In a real app, we'd check hardware again and save preference
        const available = await BiometricService.checkHardware();
        if (available) {
            setBiometricsEnabled(!biometricsEnabled);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Authentication</Text>
                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                        <View style={styles.iconContainer}>
                            <Smartphone size={20} color="#00FF94" />
                        </View>
                        <Text style={styles.rowLabel}>Biometric Login</Text>
                    </View>
                    <Switch
                        value={biometricsEnabled}
                        onValueChange={toggleBiometrics}
                        trackColor={{ false: '#333', true: 'rgba(0, 255, 148, 0.3)' }}
                        thumbColor={biometricsEnabled ? '#00FF94' : '#666'}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activity</Text>
                <TouchableOpacity style={styles.row}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                            <History size={20} color="#3B82F6" />
                        </View>
                        <View>
                            <Text style={styles.rowLabel}>Login History</Text>
                            <Text style={styles.rowSubLabel}>Last login: Just now</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.row}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                            <Shield size={20} color="#F59E0B" />
                        </View>
                        <View>
                            <Text style={styles.rowLabel}>Active Sessions</Text>
                            <Text style={styles.rowSubLabel}>2 devices active</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginBottom: 10,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 255, 148, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    rowSubLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
});
