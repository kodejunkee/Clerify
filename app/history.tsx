import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, Radius, Shadows } from '../constants/Theme';
import { getHistory, deleteHistoryItem, clearHistory, HistoryItem as HistoryItemModel } from '../services/history';
import { HistoryItem } from '../components/HistoryItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<HistoryItemModel[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        const items = await getHistory();
        setHistory(items);
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Delete Scan",
            "Are you sure you want to delete this scan?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteHistoryItem(id);
                        loadHistory();
                    }
                }
            ]
        );
    };

    const handleClearAll = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        await clearHistory();
                        loadHistory();
                    }
                }
            ]
        );
    };

    const handlePress = (item: HistoryItemModel) => {
        router.push({
            pathname: '/analysis-result',
            params: { result: JSON.stringify(item.result) }
        });
    };

    const historyStats = useMemo(() => {
        if (history.length === 0) return { count: 0, lastScan: 'NONE' };
        
        const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastScanDate = new Date(sorted[0].date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        return {
            count: history.length,
            lastScan: lastScanDate
        };
    }, [history]);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* ═══ Header ═══ */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan History</Text>
                {history.length > 0 ? (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearHeaderButton}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearHeaderButton}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.contentWrapper}>
                <Text style={styles.pageSubtitle}>
                    Review your past contract scans and risk{'\n'}analysis reports with high-precision AI{'\n'}diagnostics.
                </Text>

                {/* ═══ Stats Cards ═══ */}
                <View style={styles.statsCardWrapper}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#2A2A2E' }]}>
                            <MaterialCommunityIcons name="file-document" size={20} color={Colors.primaryLight} />
                        </View>
                        <Text style={styles.statValue}>{historyStats.count}</Text>
                        <Text style={styles.statLabel}>TOTAL SCANS</Text>
                    </View>
                    
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#1C292A' }]}>
                            <MaterialCommunityIcons name="calendar-blank" size={20} color={Colors.success} />
                        </View>
                        <Text style={styles.statValue}>{historyStats.lastScan}</Text>
                        <Text style={styles.statLabel}>LAST SCAN</Text>
                    </View>
                </View>

                {history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIllustration}>
                            <View style={styles.emptyCircleLarge}>
                                <MaterialCommunityIcons name="file-document-edit-outline" size={56} color={Colors.primaryDark} />
                            </View>
                            <View style={styles.emptyCircleSmall}>
                                <MaterialCommunityIcons name="magnify" size={20} color={Colors.primary} />
                            </View>
                        </View>
                        
                        <Text style={styles.emptyTitle}>No Scans Yet</Text>
                        <Text style={styles.emptyText}>Analyze your first document to see{'\n'}your scan history here. Our AI{'\n'}engine provides instant risk{'\n'}assessment.</Text>
                        
                        <TouchableOpacity 
                            style={styles.analyzeNowButton}
                            onPress={() => router.push('/analyze')}
                        >
                            <MaterialCommunityIcons name="plus-circle" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.analyzeNowText}>Start New Analysis</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flex: 1, marginTop: 24 }}>
                        <View style={styles.listHeader}>
                            <View style={styles.sectionAccent} />
                            <Text style={styles.sectionTitle}>Recent Activities</Text>
                        </View>
                        <FlatList
                            data={history}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.itemWrapper}>
                                    <HistoryItem
                                        name={item.fileName}
                                        size={item.fileSize || ''}
                                        date={item.date}
                                        onPress={() => handlePress(item)}
                                        onDelete={() => handleDelete(item.id)}
                                        layout="vertical"
                                    />
                                </View>
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
    },
    
    // ═══════════════════════════════
    // HEADER
    // ═══════════════════════════════
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: Colors.backgroundLight,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 20,
        color: '#000',
    },
    clearHeaderButton: {
        width: 60,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    clearText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.primaryDark,
    },

    contentWrapper: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    pageSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
        marginBottom: Spacing.xl,
    },

    // ═══════════════════════════════
    // STATS CARDS
    // ═══════════════════════════════
    statsCardWrapper: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.cardDark,
        borderRadius: 16,
        padding: Spacing.xl,
        ...Shadows.md,
    },
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    statValue: {
        fontFamily: 'Inter_400Regular',
        fontSize: 24,
        color: Colors.white,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: '#94A3B8',
        letterSpacing: 1,
    },

    // ═══════════════════════════════
    // LIST CONTENT
    // ═══════════════════════════════
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionAccent: {
        width: 4,
        height: 20,
        backgroundColor: Colors.primaryDark,
        borderRadius: 2,
        marginRight: Spacing.sm,
    },
    sectionTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: '#000',
    },
    listContent: {
        paddingBottom: Spacing['3xl'],
    },
    itemWrapper: {
        marginBottom: Spacing.sm,
    },

    // ═══════════════════════════════
    // EMPTY STATE
    // ═══════════════════════════════
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    emptyIllustration: {
        position: 'relative',
        marginBottom: Spacing.xl,
    },
    emptyCircleLarge: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E5C76B',
        opacity: 0.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyCircleSmall: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.cardDark,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.md,
    },
    emptyTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 28,
        color: '#000',
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: Spacing['3xl'],
    },
    analyzeNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.cardDark,
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        ...Shadows.lg,
    },
    analyzeNowText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: Colors.white,
    },
});
