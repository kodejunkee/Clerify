import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable, Dimensions, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
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

    // Risk level thresholds matching the Figma designs
    const isCritical = score > 75;
    const isModerate = score > 40 && score <= 75;

    const ringColor = isCritical ? '#C91D42' : isModerate ? '#E4C76B' : '#1AB670';
    const riskLabelColor = isCritical ? '#C91D42' : isModerate ? '#D4AF37' : '#1AB670';
    const riskLabel = isCritical ? 'Critical  Risk' : isModerate ? 'Moderate Risk' : 'Safe  Risk';
    const riskIcon = isCritical
        ? ('alert-outline' as const)
        : isModerate
        ? ('alert-outline' as const)
        : ('shield-check-outline' as const);

    const criticalCount = redFlags.filter((f: any) => f.severity === 'critical').length;
    const moderateCount = redFlags.filter((f: any) => f.severity === 'moderate').length;
    const lowCount = redFlags.filter((f: any) => f.severity !== 'critical' && f.severity !== 'moderate').length;

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* ═══ Dark Navy Hero ═══ */}
                <View style={styles.heroArea}>
                    {/* Back Button & Title Row */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.heroTitle}>Analysis Complete</Text>
                        {/* Spacer to balance the row */}
                        <View style={{ width: 36 }} />
                    </View>

                    {/* Score Ring */}
                    <View style={styles.scoreRingOuter}>
                        <View style={[styles.scoreRingTrack, { borderColor: ringColor }]} />
                        <View style={styles.scoreCenter}>
                            <Animated.Text style={styles.scoreValue}>
                                {scoreAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0', '100'],
                                    extrapolate: 'clamp',
                                })}
                            </Animated.Text>
                            <Text style={[styles.scoreMax, { color: ringColor }]}>/100</Text>
                        </View>
                    </View>

                    {/* Risk Badge */}
                    <View style={styles.riskBadge}>
                        <MaterialCommunityIcons name={riskIcon} size={16} color={riskLabelColor} />
                        <Text style={[styles.riskBadgeText, { color: riskLabelColor }]}>{riskLabel}</Text>
                    </View>
                </View>

                {/* ═══ White Bottom Sheet with rounded top corners ═══ */}
                <View style={styles.whiteSheet}>

                    {/* ─ Frosted Stats Card ─
                         Overlaps the top rounded edge of the white sheet via negative marginTop */}
                    <View style={styles.statsCardClip}>
                        <BlurView
                            intensity={80}
                            tint="light"
                            style={styles.statsBlur}
                        >
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#BE123C' }]}>{criticalCount}</Text>
                                    <Text style={styles.statLabel}>Critical</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#D4AF37' }]}>{moderateCount}</Text>
                                    <Text style={styles.statLabel}>Moderate</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#10B981' }]}>{lowCount}</Text>
                                    <Text style={styles.statLabel}>Low</Text>
                                </View>
                            </View>
                        </BlurView>
                    </View>

                    {/* Summary Section */}
                    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="text-box" size={18} color="#C59A45" />
                            <Text style={styles.sectionTitle}>Summary</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryText}>{summary}</Text>
                        </View>
                    </Animated.View>

                    {/* Red Flags Section */}
                    {redFlags.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionTitleRow}>
                                <MaterialCommunityIcons name="flag-outline" size={18} color="#EF4444" />
                                <Text style={styles.sectionTitle}>Red Flags</Text>
                                <View style={styles.flagCountBadge}>
                                    <Text style={styles.flagCountText}>{redFlags.length}</Text>
                                </View>
                            </View>

                            {redFlags.map((flag: any, index: number) => (
                                <Animated.View
                                    key={index}
                                    style={[styles.flagCard, { opacity: fadeAnim }]}
                                >
                                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#C59A45" style={{ marginTop: 2 }} />
                                    <Text style={styles.flagText}>{flag.clause}</Text>
                                </Animated.View>
                            ))}
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
                        <View style={styles.pdfButton}>
                            <MaterialCommunityIcons name="file-download-outline" size={20} color={Colors.white} style={{ marginRight: 10 }} />
                            <Text style={styles.pdfButtonText}>Download as PDF</Text>
                        </View>
                    </Pressable>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: pdfScale }] }}>
                    <Pressable
                        onPressIn={() => animatePressIn(pdfScale)}
                        onPressOut={() => animatePressOut(pdfScale)}
                        onPress={() => router.push('/analyze')}
                        style={styles.newScanButton}
                    >
                        <MaterialCommunityIcons name="plus" size={22} color="#C59A45" />
                    </Pressable>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1120',
    },
    errorText: {
        ...Typography.body,
        textAlign: 'center',
        marginTop: Spacing['3xl'],
        color: Colors.white,
    },

    // ═══════════════════════════════
    // HERO AREA  (#0A1120 navy)
    // ═══════════════════════════════
    heroArea: {
        backgroundColor: '#0A1120',
        paddingTop: 8,
        paddingBottom: 90,  // Room for: 24px gap + 36px stats card overlap + 30px sheet overlap
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: Spacing.lg,
        marginBottom: 24,
    },
    backButton: {
        padding: 4,
    },
    heroTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: Colors.white,
    },

    // ─ Score Ring ─
    scoreRingOuter: {
        width: 180,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    scoreRingTrack: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 14,
    },
    scoreCenter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 56,
        color: Colors.white,
    },
    scoreMax: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        marginTop: -6,
    },

    // ─ Risk Badge ─
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: Radius.full,
        gap: 8,
    },
    riskBadgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
    },

    // ═══════════════════════════════
    // WHITE BOTTOM SHEET
    // Rounded top corners, overlaps hero slightly
    // ═══════════════════════════════
    whiteSheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -30,           // Pull white sheet 30px into the hero's bottom padding
        paddingTop: 0,
        minHeight: Dimensions.get('window').height * 0.5,
    },

    // ─ Stats Card (Glassmorphism) ─
    // Lives inside whiteSheet, overlaps its rounded top edge
    statsCardClip: {
        marginHorizontal: Spacing.xl,
        marginTop: -36,           // Float 36px above white sheet top to straddle the edge
        marginBottom: Spacing.xl,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#E6CD7B',
        backgroundColor: Platform.OS === 'android'
            ? 'rgba(230, 230, 235, 0.85)'
            : 'rgba(255, 255, 255, 0.25)',
    },
    statsBlur: {
        paddingVertical: 20,
        paddingHorizontal: Spacing.base,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 24,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: '#6B7280',
    },

    // ─ Sections ─
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.base,
        gap: 8,
    },
    sectionTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 18,
        color: '#000',
        flex: 1,
    },

    // ─ Summary Card ─
    summaryCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: '#D4AF37',
    },
    summaryText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        lineHeight: 24,
        color: '#000',
    },

    // ─ Flag Count Badge ─
    flagCountBadge: {
        backgroundColor: '#FFE4E6',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: Radius.full,
    },
    flagCountText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
        color: '#E11D48',
    },

    // ─ Flag Card ─
    flagCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1.5,
        borderColor: '#D4AF37',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
    },
    flagText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        lineHeight: 20,
        color: '#000',
        flex: 1,
    },

    // ═══════════════════════════════
    // FOOTER
    // ═══════════════════════════════
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.base,
        paddingBottom: Spacing['2xl'],
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    pdfButton: {
        backgroundColor: '#0A1120',
        paddingVertical: 16,
        borderRadius: Radius.full,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pdfButtonText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: Colors.white,
    },
    newScanButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        ...Shadows.sm,
    },
});
