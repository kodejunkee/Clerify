import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeContract } from '../services/analysis';
import { ActivityIndicator } from 'react-native';

export default function PasteInputScreen() {
    const [text, setText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const router = useRouter();

    const handleAnalyzePress = async () => {
        if (text.trim().length < 50) {
            Alert.alert("Too Short", "Please enter at least 50 characters for a meaningful analysis.");
            return;
        }

        setAnalyzing(true);
        try {
            const result = await analyzeContract(text);
            // Navigate to result screen with data
            router.push({
                pathname: '/analysis-result',
                params: { result: JSON.stringify(result) }
            });
        } catch (error) {
            Alert.alert("Analysis Error", "Failed to analyze text. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen
                options={{
                    title: 'Paste Contract Text',
                    headerStyle: { backgroundColor: Colors.white },
                    headerTintColor: Colors.primary,
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoid}
            >
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.label}>Paste or type your legal text below:</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            multiline
                            placeholder="e.g. '7. Term and Termination...'"
                            placeholderTextColor={Colors.textLight}
                            value={text}
                            onChangeText={setText}
                            textAlignVertical="top"
                            autoFocus
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Text style={styles.charCount}>{text.length} characters</Text>
                    <TouchableOpacity
                        style={[styles.analyzeButton, (!text.trim() || analyzing) && styles.disabledButton]}
                        onPress={handleAnalyzePress}
                        disabled={!text.trim() || analyzing}
                    >
                        {analyzing ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="shield-search" size={24} color={Colors.white} style={{ marginRight: 8 }} />
                                <Text style={styles.analyzeButtonText}>Analyze Risk</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    label: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        minHeight: 200,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        lineHeight: 24,
    },
    footer: {
        padding: 16,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    charCount: {
        color: Colors.textLight,
        fontSize: 14,
    },
    analyzeButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30, // Pill shape
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: Colors.textLight,
        opacity: 0.7,
    },
    analyzeButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
