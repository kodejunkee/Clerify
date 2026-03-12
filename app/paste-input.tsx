import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Radius, Shadows, Spacing, Typography } from '../constants/Theme';
import { analyzeContract } from '../services/analysis';

export default function PasteInputScreen() {
    const [text, setText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const router = useRouter();
    const buttonScale = useRef(new Animated.Value(1)).current;

    const animatePressIn = () => {
        Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };
    const animatePressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };

    const handleAnalyzePress = async () => {
        if (text.trim().length < 50) {
            Alert.alert("Too Short", "Please enter at least 50 characters for a meaningful analysis.");
            return;
        }

        setAnalyzing(true);
        try {
            const result = await analyzeContract(text);
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
                    title: 'Paste Text',
                    headerStyle: { backgroundColor: Colors.background },
                    headerTintColor: Colors.primary,
                    headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: Colors.text },
                    headerShadowVisible: false,
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
                            placeholderTextColor={Colors.textMuted}
                            value={text}
                            onChangeText={setText}
                            textAlignVertical="top"
                            autoFocus
                            maxLength={10000}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Text style={styles.charCount}>{text.length}/10000 characters</Text>
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <Pressable
                            onPressIn={animatePressIn}
                            onPressOut={animatePressOut}
                            onPress={handleAnalyzePress}
                            disabled={!text.trim() || analyzing}
                            style={{ borderRadius: Radius.full, overflow: 'hidden', opacity: (!text.trim() || analyzing) ? 0.5 : 1 }}
                        >
                            <LinearGradient
                                colors={Colors.gradientPrimary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.analyzeButton}
                            >
                                {analyzing ? (
                                    <ActivityIndicator color={Colors.textOnPrimary} />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="shield-search" size={20} color={Colors.textOnPrimary} style={{ marginRight: 8 }} />
                                        <Text style={styles.analyzeButtonText}>Analyze Risk</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.base,
    },
    label: {
        ...Typography.label,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: Colors.surfaceElevated,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        minHeight: 200,
        ...Shadows.sm,
    },
    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.text,
    },
    footer: {
        padding: Spacing.base,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    charCount: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    analyzeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.full,
    },
    analyzeButtonText: {
        ...Typography.buttonSm,
        color: Colors.textOnPrimary,
    },
});
