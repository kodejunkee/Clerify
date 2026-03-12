import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, Radius, Shadows } from '../constants/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { generateContractPDF } from '../services/pdf';

export default function AnalysisResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const scoreAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pdfScale = useRef(new Animated.Value(1)).current;

    const result = params.result ? JSON.parse(params.result as string) : null;

    useEffect(() => {
        if (result) {
            Animated.parallel([
                Animated.timing(scoreAnim, {
                    toValue: result.score,
                    duration: 1200,
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, []);

    const animatePressIn = (anim: Animated.Value) => {
        Animated.spring(anim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };
    const animatePressOut = (anim: Animated.Value) => {
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };

    if (!result) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error loading results.</Text>
            </SafeAreaView>
        );
    }

    const { score, redFlags, summary } = result;

    // Risk level from figma colors
    const riskColor = score > 75 ? '#BE123C' : score > 40 ? '#D4AF37' : '#10B981';
    const riskColorLight = score > 75 ? '#FFF1F2' : score > 40 ? '#FFFBEB' : '#ECFDF5';
    const riskLabel = score > 75 ? 'Critical Risk' : score > 40 ? 'Moderate Risk' : 'Safe';
    const riskIcon = score > 75 ? 'alert-octagon' as const : score > 40 ? 'alert' as const : 'shield-check' as const;

    // Hero gradient colors based on risk
    const heroColors = score > 75
        ? ['#7F1D1D', '#991B1B', '#B91C1C'] as [string, string, string] // Deeper Red
        : score > 40
        ? ['#78350F', '#92400E', '#B45309'] as [string, string, string] // Deeper Amber
        : ['#064E3B', '#065F46', '#059669'] as [string, string, string] // Deeper Emerald

    const criticalCount = redFlags.filter((f: any) => f.severity === 'critical').length;
    const moderateCount = redFlags.filter((f: any) => f.severity === 'moderate').length;
    const lowCount = redFlags.filter((f: any) => f.severity !== 'critical' && f.severity !== 'moderate').length;

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* ═══ Risk-Colored Hero Banner ═══ */}
                <LinearGradient
                    colors={heroColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroBanner}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>

                    <Text style={styles.heroTitle}>Analysis Complete</Text>

                    {/* Score Ring */}
                    <View style={styles.scoreRingOuter}>
                        <View style={styles.scoreRingInner}>
                            <Animated.Text style={styles.scoreValue}>
                                {scoreAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0', '100'],
                                    extrapolate: 'clamp',
                                })}
                            </Animated.Text>
                            <Text style={styles.scoreMax}>/100</Text>
                        </View>
                    </View>

                    <View style={styles.riskBadge}>
                        <MaterialCommunityIcons name={riskIcon} size={16} color={Colors.white} />
                        <Text style={styles.riskBadgeText}>{riskLabel}</Text>
                    </View>
                </LinearGradient>

                {/* ═══ Floating Stats Card ═══ */}
                <View style={styles.statsCardWrapper}>
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: '#BE123C' }]}>{criticalCount}</Text>
                            <Text style={styles.statLabel}>Critical</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: '#D4AF37' }]}>{moderateCount}</Text>
                            <Text style={styles.statLabel}>Moderate</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: '#10B981' }]}>{lowCount}</Text>
                            <Text style={styles.statLabel}>Low</Text>
                        </View>
                    </View>
                </View>

                {/* ═══ Summary Section ═══ */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <View style={styles.sectionTitleRow}>
                        <View style={styles.sectionIconBox}>
                            <MaterialCommunityIcons name="text-box-outline" size={16} color={Colors.primary} />
                        </View>
                        <Text style={styles.sectionTitle}>Summary</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <View style={[styles.summaryAccent, { backgroundColor: Colors.primary }]} />
                        <Text style={styles.summaryText}>{summary}</Text>
                    </View>
                </Animated.View>

                {/* ═══ Red Flags Section ═══ */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                            <MaterialCommunityIcons name="flag-outline" size={16} color="#EF4444" />
                        </View>
                        <Text style={styles.sectionTitle}>Red Flags</Text>
                        <View style={styles.flagCountBadge}>
                            <Text style={styles.flagCountText}>{redFlags.length}</Text>
                        </View>
                    </View>

                    {redFlags.map((flag: any, index: number) => {
                        const isCritical = flag.severity === 'critical';
                        const isModerate = flag.severity === 'moderate';

                        const accentColor = isCritical ? '#BE123C' : isModerate ? '#D4AF37' : '#10B981';
                        const cardBorder = isCritical ? '#FECDD3' : isModerate ? '#FDE68A' : '#A7F3D0';
                        const iconName = isCritical ? 'alert-decagram' as const : isModerate ? 'alert-circle-outline' as const : 'information-outline' as const;
                        const severityLabel = isCritical ? 'CRITICAL' : isModerate ? 'MODERATE' : 'LOW';

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.flagCard,
                                    { borderLeftColor: accentColor, opacity: fadeAnim },
                                ]}
                            >
                                <View style={styles.flagHeader}>
                                    <View style={[styles.flagIconCircle, { backgroundColor: `${accentColor}15` }]}>
                                        <MaterialCommunityIcons name={iconName} size={18} color={accentColor} />
                                    </View>
                                    <View style={[styles.severityChip, { backgroundColor: `${accentColor}15` }]}>
                                        <View style={[styles.severityDot, { backgroundColor: accentColor }]} />
                                        <Text style={[styles.severityText, { color: accentColor }]}>{severityLabel}</Text>
                                    </View>
                                </View>
                                <Text style={styles.flagText}>{flag.clause}</Text>
                            </Animated.View>
                        );
                    })}

                    {redFlags.length === 0 && (
                        <View style={styles.emptyFlags}>
                            <View style={styles.emptyFlagIcon}>
                                <MaterialCommunityIcons name="shield-check-outline" size={32} color="#10B981" />
                            </View>
                            <Text style={styles.emptyFlagTitle}>All Clear!</Text>
                            <Text style={styles.emptyFlagText}>No specific red flags detected in this document.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ═══ Fixed Footer ═══ */}
            <View style={styles.footer}>
                <Animated.View style={{ transform: [{ scale: pdfScale }], flex: 1 }}>
                    <Pressable
                        onPressIn={() => animatePressIn(pdfScale)}
                        onPressOut={() => animatePressOut(pdfScale)}
                        onPress={() => generateContractPDF(result)}
                    >
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.pdfButtonGradient}
                        >
                            <MaterialCommunityIcons name="file-download-outline" size={20} color={Colors.textOnPrimary} style={{ marginRight: 10 }} />
                            <Text style={styles.pdfButtonText}>Download as PDF</Text>
                        </LinearGradient>
                    </Pressable>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: pdfScale }] }}>
                    <Pressable
                        onPressIn={() => animatePressIn(pdfScale)}
                        onPressOut={() => animatePressOut(pdfScale)}
                        onPress={() => router.push('/analyze')}
                        style={styles.newScanButton}
                    >
                        <MaterialCommunityIcons name="plus" size={22} color={Colors.primary} />
                    </Pressable>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    errorText: {
        ...Typography.body,
        textAlign: 'center',
        marginTop: Spacing['3xl'],
    },

    // ═══════════════════════════════
    // HERO BANNER
    // ═══════════════════════════════
    heroBanner: {
        paddingTop: 56,
        paddingBottom: 48,
        paddingHorizontal: Spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.primary,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: Spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    heroTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 24,
        marginBottom: Spacing.xl,
        letterSpacing: 0.5,
    },

    // ─ Score Ring ─
    scoreRingOuter: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 8,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    scoreRingInner: {
        width: 116,
        height: 116,
        borderRadius: 58,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 48,
        color: Colors.text,
    },
    scoreMax: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: -4,
    },

    // ─ Risk Badge ─
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: Radius.full,
        gap: 8,
    },
    riskBadgeText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.white,
    },

    // ═══════════════════════════════
    // STATS CARD
    // ═══════════════════════════════
    statsCardWrapper: {
        marginTop: -28,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.base,
        ...Shadows.lg,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 24,
        marginBottom: 2,
    },
    statLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.textMuted,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.border,
    },

    // ═══════════════════════════════
    // SECTIONS
    // ═══════════════════════════════
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.base,
        gap: 10,
    },
    sectionIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: Colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 18,
        color: Colors.text,
        flex: 1,
    },

    // ─ Summary Card ─
    summaryCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        paddingLeft: Spacing.lg + 6,
        position: 'relative',
        overflow: 'hidden',
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    summaryAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    summaryText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        lineHeight: 26,
        color: Colors.text,
    },

    // ─ Flag Count Badge ─
    flagCountBadge: {
        backgroundColor: '#FFF1F2',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: Radius.full,
    },
    flagCountText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: '#EF4444',
    },

    // ─ Flag Card ─
    flagCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        padding: Spacing.base,
        marginBottom: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: '#BE123C',
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    flagHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    flagIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    severityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: Radius.full,
        gap: 6,
    },
    severityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    severityText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        letterSpacing: 0.8,
    },
    flagText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        lineHeight: 22,
        color: Colors.text,
        marginLeft: 2,
    },

    // ─ Empty Flags ─
    emptyFlags: {
        alignItems: 'center',
        paddingVertical: Spacing['2xl'],
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        ...Shadows.sm,
    },
    emptyFlagIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    emptyFlagTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 18,
        color: Colors.text,
        marginBottom: 4,
    },
    emptyFlagText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
    },

    // ═══════════════════════════════
    // FOOTER
    // ═══════════════════════════════
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.base,
        paddingBottom: Spacing['2xl'],
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    pdfButtonGradient: {
        paddingVertical: 16,
        borderRadius: Radius.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pdfButtonText: {
        ...Typography.button,
        color: Colors.textOnPrimary,
    },
    newScanButton: {
        width: 52,
        height: 52,
        borderRadius: Radius.lg,
        backgroundColor: Colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
