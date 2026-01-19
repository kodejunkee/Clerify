import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { generateContractPDF } from '../services/pdf';

export default function AnalysisResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Scrollbar State
    const [contentHeight, setContentHeight] = useState(1);
    const [scrollViewHeight, setScrollViewHeight] = useState(1);
    const [scrollOffset, setScrollOffset] = useState(0);

    // Parse the result string properly
    const result = params.result ? JSON.parse(params.result as string) : null;

    if (!result) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Error loading results.</Text>
            </SafeAreaView>
        )
    }

    const { score, redFlags, summary } = result;

    // Determine risk level color
    const riskColor = score > 75 ? Colors.danger : score > 40 ? '#D69E2E' : Colors.success;
    const riskLabel = score > 75 ? 'Critical Risk' : score > 40 ? 'Moderate Risk' : 'Safe';

    // Calculate Scrollbar positioning
    const indicatorSize = scrollViewHeight > contentHeight
        ? 0
        : (scrollViewHeight / contentHeight) * scrollViewHeight;

    const indicatorPosition = scrollViewHeight > contentHeight
        ? 0
        : (scrollOffset / contentHeight) * scrollViewHeight;

    const showScrollbar = scrollViewHeight < contentHeight;

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen
                options={{
                    title: 'Analysis Result',
                    headerBackTitle: 'Back',
                    headerStyle: { backgroundColor: Colors.white },
                    headerTintColor: Colors.primary,
                }}
            />

            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={(e) => setScrollOffset(e.nativeEvent.contentOffset.y)}
                    onContentSizeChange={(_, height) => setContentHeight(height)}
                    onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
                >

                    {/* Score Card */}
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreTitle}>Risk Score</Text>
                        <View style={[styles.scoreCircle, { borderColor: riskColor }]}>
                            <Text style={[styles.scoreValue, { color: riskColor }]}>{score}</Text>
                            <Text style={styles.scoreMax}>/100</Text>
                        </View>
                        <Text style={[styles.riskLabel, { color: riskColor }]}>{riskLabel}</Text>
                    </View>

                    {/* Summary Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.summaryText}>{summary}</Text>
                    </View>

                    {/* Red Flags Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Red Flags ({redFlags.length})</Text>

                        {redFlags.map((flag: any, index: number) => {
                            // Dynamic styling based on severity
                            const isCritical = flag.severity === 'critical';
                            const isModerate = flag.severity === 'moderate';

                            // Default to gray/blue for minor, yellow for moderate, red for critical
                            const cardBg = isCritical ? '#FEF2F2' : isModerate ? '#FFFFF0' : '#F0F9FF';
                            const iconColor = isCritical ? Colors.danger : isModerate ? '#D69E2E' : '#3182CE';
                            const iconName = isCritical ? "alert-decagram" : "alert-circle-outline";

                            return (
                                <View key={index} style={[styles.flagCard, { backgroundColor: cardBg }]}>
                                    <MaterialCommunityIcons
                                        name={iconName}
                                        size={24}
                                        color={iconColor}
                                        style={{ marginTop: 2 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        {/* Render the SEVERITY label */}
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            color: iconColor,
                                            marginBottom: 4,
                                            textTransform: 'uppercase'
                                        }}>
                                            {flag.severity} RISK
                                        </Text>

                                        {/* Render the actual text (flag.clause) */}
                                        <Text style={styles.flagText}>{flag.clause}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {redFlags.length === 0 && (
                            <Text style={styles.emptyState}>No specific red flags detected.</Text>
                        )}
                    </View>

                </ScrollView>

                {/* Custom Scrollbar */}
                {showScrollbar && (
                    <View style={styles.scrollbarTrack}>
                        <View
                            style={[
                                styles.scrollbarThumb,
                                {
                                    height: Math.max(30, indicatorSize),
                                    transform: [{ translateY: indicatorPosition }]
                                }
                            ]}
                        />
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.pdfButton} onPress={() => generateContractPDF(result)}>
                    <MaterialCommunityIcons name="file-download-outline" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.pdfButtonText}>Download as PDF</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 160, // Increased for larger footer
    },
    // Scrollbar Styles
    scrollbarTrack: {
        position: 'absolute',
        right: 4,
        top: 4,
        bottom: 4,
        width: 6,
        borderRadius: 3,
        backgroundColor: 'transparent',
    },
    scrollbarThumb: {
        width: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary, // Using the global Blue
        opacity: 0.8,
    },
    scoreCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    scoreTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textLight,
        marginBottom: 16,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreValue: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    scoreMax: {
        fontSize: 14,
        color: Colors.textLight,
    },
    riskLabel: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 16,
        color: Colors.text,
        lineHeight: 24,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    flagCard: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    flagText: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        lineHeight: 22,
    },
    emptyState: {
        color: Colors.textLight,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 12,
    },
    pdfButton: {
        backgroundColor: '#1F2937', // Dark gray
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pdfButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
