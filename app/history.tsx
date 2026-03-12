import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
        if (history.length === 0) return { count: 0, lastScan: 'None' };
        
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
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* ═══ Gradient Hero Header ═══ */}
            <LinearGradient
                colors={['#4F46E5', '#6366F1', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroHeader}
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.heroTitle}>Scan History</Text>
                    {history.length > 0 ? (
                        <TouchableOpacity onPress={handleClearAll} style={styles.clearHeaderButton}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />}
                </View>

                <Text style={styles.heroSubtitle}>
                    Review your past contract scans and{'\n'}risk analysis reports.
                </Text>
            </LinearGradient>

            {/* ═══ Floating Stats Card ═══ */}
            <View style={styles.statsCardWrapper}>
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
                            <MaterialCommunityIcons name="file-multiple-outline" size={20} color={Colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{historyStats.count}</Text>
                            <Text style={styles.statLabel}>Total Scans</Text>
                        </View>
                    </View>
                    
                    <View style={styles.statDivider} />
                    
                    <View style={styles.statItem}>
                        <View style={[styles.statIconBox, { backgroundColor: '#F0FDF4' }]}>
                            <MaterialCommunityIcons name="calendar-clock-outline" size={20} color="#16A34A" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{historyStats.lastScan}</Text>
                            <Text style={styles.statLabel}>Last Scan</Text>
                        </View>
                    </View>
                </View>
            </View>

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <LinearGradient
                            colors={['#F8FAFC', '#F1F5F9']}
                            style={styles.emptyIconGradient}
                        >
                            <MaterialCommunityIcons name="file-search-outline" size={48} color={Colors.textMuted} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.emptyTitle}>No Scans Yet</Text>
                    <Text style={styles.emptyText}>Analyze your first document to see{'\n'}your scan history here.</Text>
                    
                    <TouchableOpacity 
                        style={styles.analyzeNowButton}
                        onPress={() => router.push('/analyze')}
                    >
                        <LinearGradient
                            colors={['#4F46E5', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.analyzeNowGradient}
                        >
                            <Text style={styles.analyzeNowText}>Start New Analysis</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    
    // ═══════════════════════════════
    // HERO HEADER
    // ═══════════════════════════════
    heroHeader: {
        paddingTop: 56,
        paddingBottom: 48,
        paddingHorizontal: Spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: Colors.white,
    },
    clearHeaderButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
    },

    // ═══════════════════════════════
    // STATS CARD
    // ═══════════════════════════════
    statsCardWrapper: {
        marginTop: -32,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        ...Shadows.lg,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 18,
        color: Colors.text,
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
        marginHorizontal: Spacing.md,
    },

    // ═══════════════════════════════
    // LIST CONTENT
    // ═══════════════════════════════
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    sectionAccent: {
        width: 3,
        height: 18,
        backgroundColor: Colors.primary,
        borderRadius: 2,
        marginRight: Spacing.sm,
    },
    sectionTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: Colors.text,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
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
        paddingHorizontal: Spacing['2xl'],
        marginTop: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        ...Shadows.sm,
        marginBottom: Spacing.xl,
    },
    emptyIconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 20,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing['2xl'],
    },
    analyzeNowButton: {
        width: '100%',
        borderRadius: Radius.full,
        overflow: 'hidden',
        ...Shadows.md,
    },
    analyzeNowGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzeNowText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: Colors.white,
    },
});
