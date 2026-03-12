import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryItem } from '../components/HistoryItem';
import { Colors } from '../constants/Colors';
import { Radius, Shadows, Spacing, Typography } from '../constants/Theme';
import { analyzeContract, analyzeContractFromFile } from '../services/analysis';
import { pickDocument, PickedDocument } from '../services/document';
import { deleteHistoryItem, getHistory, HistoryItem as HistoryItemModel, saveScan } from '../services/history';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'upload' | 'paste';

export default function AnalyzeScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('upload');
    const isUpload = activeTab === 'upload';
    const isPaste = activeTab === 'paste';
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<PickedDocument | null>(null);
    const [text, setText] = useState('');
    const [history, setHistory] = useState<HistoryItemModel[]>([]);

    const analyzeScale = useRef(new Animated.Value(1)).current;
    const uploadScale = useRef(new Animated.Value(1)).current;

    const animatePressIn = (anim: Animated.Value) => {
        Animated.spring(anim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };
    const animatePressOut = (anim: Animated.Value) => {
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };

    useFocusEffect(
        useCallback(() => { loadHistory(); }, [])
    );

    const loadHistory = async () => {
        const items = await getHistory();
        setHistory(items);
    };

    const handleDeleteHistory = async (id: string) => {
        await deleteHistoryItem(id);
        loadHistory();
    };

    const handleHistoryItemPress = (item: HistoryItemModel) => {
        router.push({
            pathname: '/analysis-result',
            params: { result: JSON.stringify(item.result) }
        });
    };

    const handlePickFile = async () => {
        try {
            const file = await pickDocument();
            if (!file) return;
            setSelectedFile(file);
        } catch (error: any) {
            if (error.message === 'FILE_TOO_LARGE') {
                Alert.alert("File Too Large", "Please select a file smaller than 10MB.");
            } else {
                console.error(error);
            }
        }
    };

    const handleAnalyzeFile = async () => {
        if (!selectedFile) return;
        setIsAnalyzing(true);
        try {
            const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, { encoding: 'base64' });
            const result = await analyzeContractFromFile(base64, selectedFile.mimeType);
            const newItem: HistoryItemModel = {
                id: Date.now().toString(),
                fileName: selectedFile.name,
                date: new Date().toISOString(),
                fileSize: selectedFile.size ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown',
                result,
            };
            await saveScan(newItem);
            loadHistory();
            router.push({ pathname: '/analysis-result', params: { result: JSON.stringify(result) } });
        } catch (error: any) {
            if (error?.message === 'TIMEOUT') {
                Alert.alert("Request Timed Out", "The analysis is taking too long. Please try again with a smaller file or check your internet connection.");
            } else {
                Alert.alert("Analysis Failed", "Could not analyze the file. Please try again.");
            }
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePasteAnalyze = async () => {
        if (text.trim().length < 50) {
            Alert.alert("Too Short", "Please enter at least 50 characters.");
            return;
        }
        setIsAnalyzing(true);
        try {
            const result = await analyzeContract(text);
            const newItem: HistoryItemModel = {
                id: Date.now().toString(),
                fileName: "Pasted Text Analysis",
                date: new Date().toISOString(),
                fileSize: text.length + ' chars',
                result,
            };
            await saveScan(newItem);
            loadHistory();
            router.push({ pathname: '/analysis-result', params: { result: JSON.stringify(result) } });
        } catch (error: any) {
            if (error?.message === 'TIMEOUT') {
                Alert.alert("Request Timed Out", "The analysis is taking too long. Please try again or check your internet connection.");
            } else {
                Alert.alert("Analysis Error", "Failed to analyze text.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ─── Dynamic Steps Data ───
    const steps = isUpload
        ? [
              { icon: 'file-upload-outline' as const, label: 'Upload' },
              { icon: 'brain' as const, label: 'AI Scan' },
              { icon: 'shield-check-outline' as const, label: 'Results' },
          ]
        : [
              { icon: 'clipboard-text-outline' as const, label: 'Paste' },
              { icon: 'brain' as const, label: 'AI Scan' },
              { icon: 'shield-check-outline' as const, label: 'Results' },
          ];

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ═══ Shared Gradient Hero Banner ═══ */}
                    <LinearGradient
                        colors={['#4F46E5', '#6366F1', '#818CF8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroBanner}
                    >
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.white} />
                        </TouchableOpacity>

                        <Text style={styles.heroTitle}>Analyze Document</Text>
                        <Text style={styles.heroSubtitle}>
                            {isUpload
                                ? 'Upload a contract and let AI identify\nrisks and red flags for you.'
                                : 'Paste or type your contract text\nand let AI scan it for risks.'}
                        </Text>

                        {/* ─ Step Indicators ─ */}
                        <View style={styles.stepsRow}>
                            {steps.map((step, i) => (
                                <React.Fragment key={step.label}>
                                    <View style={styles.stepItem}>
                                        <View style={[
                                            styles.stepCircle,
                                            i === 0 && styles.stepCircleActive,
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={step.icon}
                                                size={18}
                                                color={i === 0 ? '#4F46E5' : 'rgba(255,255,255,0.6)'}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.stepLabel,
                                            i === 0 && styles.stepLabelActive,
                                        ]}>{step.label}</Text>
                                    </View>
                                    {i < steps.length - 1 && (
                                        <View style={styles.stepConnector} />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                    </LinearGradient>

                    {/* ═══ Shared Floating Card ═══ */}
                    <View style={styles.floatingCard}>

                        {/* Shared Tab Switcher */}
                        <View style={styles.tabBar}>
                            <TouchableOpacity
                                style={[styles.tab, isUpload && styles.tabActive]}
                                onPress={() => setActiveTab('upload')}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="cloud-upload-outline"
                                    size={18}
                                    color={isUpload ? Colors.primary : Colors.textMuted}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.tabText, isUpload && styles.tabTextActive]}>
                                    Upload File
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, isPaste && styles.tabActive]}
                                onPress={() => setActiveTab('paste')}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="clipboard-text-outline"
                                    size={18}
                                    color={isPaste ? Colors.primary : Colors.textMuted}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.tabText, isPaste && styles.tabTextActive]}>
                                    Paste Text
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* ═══ Tab Content (ONLY THIS SWAPS) ═══ */}
                        {isUpload ? (
                            <>
                                {/* Upload Zone */}
                                {!selectedFile ? (
                                    <Animated.View style={{ transform: [{ scale: uploadScale }] }}>
                                        <Pressable
                                            onPressIn={() => animatePressIn(uploadScale)}
                                            onPressOut={() => animatePressOut(uploadScale)}
                                            onPress={handlePickFile}
                                            style={styles.uploadZone}
                                        >
                                            <View style={styles.uploadIconOuter}>
                                                <LinearGradient
                                                    colors={['#EEF2FF', '#E0E7FF']}
                                                    style={styles.uploadIconInner}
                                                >
                                                    <MaterialCommunityIcons name="cloud-upload-outline" size={32} color={Colors.primary} />
                                                </LinearGradient>
                                            </View>
                                            <Text style={styles.uploadTitle}>Tap to upload your document</Text>
                                            <Text style={styles.uploadFormats}>PDF, JPG, or PNG • Max 10MB</Text>
                                            <View style={styles.browseChip}>
                                                <MaterialCommunityIcons name="folder-open-outline" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                                                <Text style={styles.browseChipText}>Browse files</Text>
                                            </View>
                                        </Pressable>
                                    </Animated.View>
                                ) : (
                                    <View style={styles.fileSection}>
                                        <View style={styles.selectedFile}>
                                            <LinearGradient
                                                colors={Colors.gradientPrimary}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.selectedFileGradient}
                                            >
                                                <View style={styles.fileIconBox}>
                                                    <MaterialCommunityIcons name="file-check-outline" size={24} color={Colors.white} />
                                                </View>
                                                <View style={styles.fileDetails}>
                                                    <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                                    <Text style={styles.fileSize}>
                                                        {(selectedFile.size ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB • Ready to analyze
                                                    </Text>
                                                </View>
                                                <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.fileRemove}>
                                                    <MaterialCommunityIcons name="close" size={16} color={Colors.white} />
                                                </TouchableOpacity>
                                            </LinearGradient>
                                        </View>

                                        <Animated.View style={{ transform: [{ scale: analyzeScale }] }}>
                                            <Pressable
                                                onPressIn={() => animatePressIn(analyzeScale)}
                                                onPressOut={() => animatePressOut(analyzeScale)}
                                                onPress={handleAnalyzeFile}
                                                disabled={isAnalyzing}
                                                style={{ opacity: isAnalyzing ? 0.6 : 1 }}
                                            >
                                                <LinearGradient
                                                    colors={['#4F46E5', '#6366F1']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={styles.analyzeCTA}
                                                >
                                                    {isAnalyzing ? (
                                                        <View style={styles.analyzingRow}>
                                                            <ActivityIndicator color={Colors.white} size="small" />
                                                            <Text style={styles.analyzeCTAText}>  Analyzing...</Text>
                                                        </View>
                                                    ) : (
                                                        <View style={styles.analyzingRow}>
                                                            <MaterialCommunityIcons name="shield-search" size={20} color={Colors.white} style={{ marginRight: 10 }} />
                                                            <Text style={styles.analyzeCTAText}>Analyze Contract</Text>
                                                        </View>
                                                    )}
                                                </LinearGradient>
                                            </Pressable>
                                        </Animated.View>
                                    </View>
                                )}
                            </>
                        ) : (
                            /* ─── Paste Content ─── */
                            <View>
                                <TextInput
                                    style={styles.pasteInput}
                                    multiline
                                    placeholder="Paste your contract text here..."
                                    placeholderTextColor={Colors.textMuted}
                                    value={text}
                                    onChangeText={setText}
                                    textAlignVertical="top"
                                />

                                <View style={styles.pasteFooter}>
                                    <Text style={styles.charCount}>{text.length} characters</Text>
                                    <Animated.View style={{ transform: [{ scale: analyzeScale }] }}>
                                        <Pressable
                                            onPressIn={() => animatePressIn(analyzeScale)}
                                            onPressOut={() => animatePressOut(analyzeScale)}
                                            onPress={handlePasteAnalyze}
                                            disabled={!text.trim() || isAnalyzing}
                                            style={{ opacity: (!text.trim() || isAnalyzing) ? 0.5 : 1 }}
                                        >
                                            <LinearGradient
                                                colors={['#4F46E5', '#6366F1']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.pasteAnalyzeBtn}
                                            >
                                                {isAnalyzing ? (
                                                    <ActivityIndicator color={Colors.white} size="small" />
                                                ) : (
                                                    <>
                                                        <MaterialCommunityIcons name="shield-search" size={18} color={Colors.white} style={{ marginRight: 8 }} />
                                                        <Text style={styles.pasteAnalyzeBtnText}>Analyze</Text>
                                                    </>
                                                )}
                                            </LinearGradient>
                                        </Pressable>
                                    </Animated.View>
                                </View>
                            </View>
                        )}

                        {/* ─── Features Strip (shared) ─── */}
                        <View style={styles.featuresStrip}>
                            {[
                                { icon: 'lightning-bolt' as const, text: 'AI-Powered' },
                                { icon: 'lock-outline' as const, text: 'Private' },
                                { icon: 'timer-outline' as const, text: 'Instant' },
                            ].map((f) => (
                                <View key={f.text} style={styles.featureItem}>
                                    <MaterialCommunityIcons name={f.icon} size={14} color={Colors.primary} />
                                    <Text style={styles.featureText}>{f.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* ═══ Previous Scans Section (shared) ═══ */}
                    <View style={styles.scansSection}>
                        <View style={styles.scansSectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.sectionAccent} />
                                <Text style={styles.sectionTitle}>Previous Scans</Text>
                            </View>
                            {history.length > 0 && (
                                <TouchableOpacity onPress={() => router.push('/history')}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {history.length === 0 ? (
                            <View style={styles.emptyScans}>
                                <View style={styles.emptyIconCircle}>
                                    <MaterialCommunityIcons name="file-search-outline" size={28} color={Colors.textMuted} />
                                </View>
                                <Text style={styles.emptyTitle}>No scans yet</Text>
                                <Text style={styles.emptySubtitle}>Your analyzed documents will appear here</Text>
                            </View>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                                {history.slice(0, 5).map((item) => (
                                    <HistoryItem
                                        key={item.id}
                                        name={item.fileName}
                                        size={item.fileSize || ''}
                                        onPress={() => handleHistoryItemPress(item)}
                                        onDelete={() => handleDeleteHistory(item.id)}
                                        layout="horizontal"
                                    />
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    // ═══════════════════════════════
    // HERO BANNER
    // ═══════════════════════════════
    heroBanner: {
        paddingTop: 56,
        paddingBottom: 40,
        paddingHorizontal: Spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
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
        fontFamily: 'Inter_700Bold',
        fontSize: 26,
        color: Colors.white,
        marginTop: 28,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },

    // ─ Step Indicators ─
    stepsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    stepItem: {
        alignItems: 'center',
        gap: 6,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: Colors.white,
    },
    stepLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
    },
    stepLabelActive: {
        color: Colors.white,
        fontFamily: 'Inter_600SemiBold',
    },
    stepConnector: {
        width: 36,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.25)',
        marginHorizontal: 8,
        marginBottom: 20,
        borderRadius: 1,
    },

    // ═══════════════════════════════
    // FLOATING CARD
    // ═══════════════════════════════
    floatingCard: {
        marginTop: -24,
        marginHorizontal: Spacing.base,
        backgroundColor: Colors.surface,
        borderRadius: Radius['2xl'],
        padding: Spacing.lg,
        ...Shadows.lg,
    },

    // ─ Tabs ─
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.tabBar,
        borderRadius: Radius.md,
        padding: 3,
        marginBottom: Spacing.lg,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: Radius.sm + 2,
    },
    tabActive: {
        backgroundColor: Colors.surface,
        ...Shadows.sm,
    },
    tabText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: Colors.textMuted,
    },
    tabTextActive: {
        color: Colors.primary,
    },

    // ─ Upload Zone ─
    uploadZone: {
        borderWidth: 2,
        borderColor: '#D4D4F7',
        borderStyle: 'dashed',
        borderRadius: Radius.xl,
        paddingVertical: 36,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        backgroundColor: '#FAFAFF',
    },
    uploadIconOuter: {
        marginBottom: Spacing.base,
        borderRadius: 40,
        ...Shadows.sm,
    },
    uploadIconInner: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: Colors.text,
        marginBottom: 6,
        textAlign: 'center',
    },
    uploadFormats: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        marginBottom: Spacing.base,
    },
    browseChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: Radius.full,
    },
    browseChipText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: Colors.primary,
    },

    // ─ Selected File ─
    fileSection: {
        gap: Spacing.base,
    },
    selectedFile: {
        borderRadius: Radius.lg,
        overflow: 'hidden',
        ...Shadows.colored(Colors.primary),
    },
    selectedFileGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
    },
    fileIconBox: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.white,
        marginBottom: 3,
    },
    fileSize: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
    },
    fileRemove: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: Radius.full,
    },

    // ─ Analyze CTA ─
    analyzeCTA: {
        paddingVertical: 16,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    analyzeCTAText: {
        ...Typography.button,
        letterSpacing: 0.3,
    },

    // ─ Paste Content ─
    pasteInput: {
        backgroundColor: '#FAFAFF',
        borderRadius: Radius.lg,
        padding: Spacing.base,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        lineHeight: 24,
        color: Colors.text,
        textAlignVertical: 'top',
        borderWidth: 1.5,
        borderColor: '#D4D4F7',
        minHeight: 200,
    },
    pasteFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
    },
    charCount: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
    },
    pasteAnalyzeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: Radius.full,
    },
    pasteAnalyzeBtnText: {
        ...Typography.buttonSm,
    },

    // ─ Features Strip ─
    featuresStrip: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xl,
        marginTop: Spacing.lg,
        paddingTop: Spacing.base,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    featureText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.textSecondary,
    },

    // ═══════════════════════════════
    // PREVIOUS SCANS
    // ═══════════════════════════════
    scansSection: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    scansSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.base,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    viewAllText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: Colors.primary,
    },

    // ─ Empty Scans ─
    emptyScans: {
        alignItems: 'center',
        paddingVertical: Spacing['2xl'],
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        ...Shadows.sm,
    },
    emptyIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.surfaceSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.text,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: Colors.textMuted,
    },
});
