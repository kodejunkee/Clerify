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

    const currentActionName = isUpload ? 'UPLOAD' : 'PASTE';
    const currentActionIcon = isUpload ? 'file-document' : 'file-document';

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
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
                    {/* Header Details */}
                    <View style={styles.headerArea}>
                        <TouchableOpacity style={{ marginBottom: 16 }} onPress={() => router.back()}>
                            <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Analyze Document</Text>
                        <Text style={styles.headerSubtitle}>
                            Upload a contract and let AI identify risks{'\n'}and red flags for you.
                        </Text>
                    </View>

                    {/* Stepper Component */}
                    <View style={styles.stepperContainer}>
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, styles.stepCircleActive]}>
                                <MaterialCommunityIcons name={currentActionIcon} size={20} color="#000" />
                            </View>
                            <Text style={[styles.stepLabel, styles.stepLabelActive]}>{currentActionName}</Text>
                        </View>
                        
                        <View style={styles.stepConnector} />
                        
                        <View style={styles.stepItem}>
                            <View style={styles.stepCircle}>
                                <MaterialCommunityIcons name="eye" size={20} color="#64748B" />
                            </View>
                            <Text style={styles.stepLabel}>AI SCAN</Text>
                        </View>

                        <View style={styles.stepConnector} />

                        <View style={styles.stepItem}>
                            <View style={styles.stepCircle}>
                                <MaterialCommunityIcons name="shield-check" size={20} color="#64748B" />
                            </View>
                            <Text style={styles.stepLabel}>RESULTS</Text>
                        </View>
                    </View>

                    {/* ═══ Main Dark Navy Card ═══ */}
                    <View style={styles.mainCard}>
                        
                        {/* Tab Switcher */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, isUpload && styles.tabButtonActive]}
                                onPress={() => setActiveTab('upload')}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="upload"
                                    size={18}
                                    color={isUpload ? Colors.primary : Colors.textMuted}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.tabText, isUpload && styles.tabTextActive]}>
                                    Upload File
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, isPaste && styles.tabButtonActive]}
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

                        {/* ═══ Content Area ═══ */}
                        {isUpload ? (
                            /* Upload Zone */
                            <View style={styles.uploadArea}>
                                {!selectedFile ? (
                                    <Animated.View style={{ transform: [{ scale: uploadScale }], width: '100%' }}>
                                        <Pressable
                                            onPressIn={() => animatePressIn(uploadScale)}
                                            onPressOut={() => animatePressOut(uploadScale)}
                                            onPress={handlePickFile}
                                            style={styles.uploadZoneInner}
                                        >
                                            <View style={styles.uploadIconOuter}>
                                                <MaterialCommunityIcons name="cloud-upload-outline" size={32} color={Colors.primary} />
                                            </View>
                                            <Text style={styles.uploadTitle}>Tap to upload{'\n'}document</Text>
                                            <Text style={styles.uploadFormats}>PDF, JPG, or PNG • Max 10MB</Text>
                                            <View style={styles.browseButton}>
                                                <MaterialCommunityIcons name="folder" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                                                <Text style={styles.browseButtonText}>Browse files</Text>
                                            </View>
                                        </Pressable>
                                    </Animated.View>
                                ) : (
                                    <View style={styles.fileSection}>
                                        <View style={styles.selectedFile}>
                                            <View style={styles.fileIconBox}>
                                                <MaterialCommunityIcons name="file-check-outline" size={24} color={Colors.white} />
                                            </View>
                                            <View style={styles.fileDetails}>
                                                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                                <Text style={styles.fileSize}>
                                                    {(selectedFile.size ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB • Ready
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.fileRemove}>
                                                <MaterialCommunityIcons name="close" size={16} color={Colors.white} />
                                            </TouchableOpacity>
                                        </View>

                                        <Animated.View style={{ transform: [{ scale: analyzeScale }] }}>
                                            <Pressable
                                                onPressIn={() => animatePressIn(analyzeScale)}
                                                onPressOut={() => animatePressOut(analyzeScale)}
                                                onPress={handleAnalyzeFile}
                                                disabled={isAnalyzing}
                                                style={[styles.analyzeCTA, { opacity: isAnalyzing ? 0.6 : 1 }]}
                                            >
                                                {isAnalyzing ? (
                                                    <View style={styles.analyzingRow}>
                                                        <ActivityIndicator color={Colors.white} size="small" />
                                                        <Text style={styles.analyzeCTAText}>  Analyzing...</Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles.analyzingRow}>
                                                        <MaterialCommunityIcons name="shield-check" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                                                        <Text style={styles.analyzeCTAText}>Analyze Document</Text>
                                                    </View>
                                                )}
                                            </Pressable>
                                        </Animated.View>
                                    </View>
                                )}
                            </View>
                        ) : (
                            /* Paste Zone */
                            <View style={styles.pasteArea}>
                                <TextInput
                                    style={styles.pasteInput}
                                    multiline
                                    placeholder="Paste your contract text here..."
                                    placeholderTextColor={Colors.textMuted}
                                    value={text}
                                    onChangeText={setText}
                                    textAlignVertical="top"
                                    maxLength={10000}
                                />
                                
                                <View style={styles.pasteFooterInner}>
                                    <Text style={styles.charCount}>{text.length}/10000 characters</Text>
                                    <Animated.View style={{ transform: [{ scale: analyzeScale }] }}>
                                        <Pressable
                                            onPressIn={() => animatePressIn(analyzeScale)}
                                            onPressOut={() => animatePressOut(analyzeScale)}
                                            onPress={handlePasteAnalyze}
                                            disabled={!text.trim() || isAnalyzing}
                                            style={[styles.pasteAnalyzeBtn, { opacity: (!text.trim() || isAnalyzing) ? 0.5 : 1 }]}
                                        >
                                            {isAnalyzing ? (
                                                <ActivityIndicator color={Colors.white} size="small" />
                                            ) : (
                                                <>
                                                    <MaterialCommunityIcons name="shield-check" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                                                    <Text style={styles.pasteAnalyzeBtnText}>Analyze</Text>
                                                </>
                                            )}
                                        </Pressable>
                                    </Animated.View>
                                </View>
                            </View>
                        )}

                        {/* Features Strip */}
                        <View style={styles.featuresStrip}>
                            {[
                                { icon: 'lightning-bolt' as const, text: 'AI-Powered' },
                                { icon: 'lock' as const, text: 'Private' },
                                { icon: 'clock' as const, text: 'Instant' },
                            ].map((f) => (
                                <View key={f.text} style={styles.featureItem}>
                                    <MaterialCommunityIcons name={f.icon} size={14} color={Colors.primary} />
                                    <Text style={styles.featureText}>{f.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Previous Scans */}
                    <View style={styles.scansSection}>
                        <View style={styles.scansSectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.sectionAccent} />
                                <Text style={styles.sectionTitle}>Previous Scan</Text>
                            </View>
                            {history.length > 0 && (
                                <TouchableOpacity onPress={() => router.push('/history')}>
                                    <Text style={styles.viewAllText}>See all</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {history.length === 0 ? (
                            <View style={styles.emptyScans}>
                                <MaterialCommunityIcons name="file-search-outline" size={28} color={Colors.textMuted} />
                                <Text style={styles.emptyTitle}>No scans yet</Text>
                            </View>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.md }}>
                                {history.slice(0, 5).map((item) => (
                                    <HistoryItem
                                        key={item.id}
                                        name={item.fileName}
                                        size={item.fileSize || ''}
                                        date={item.date}
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
        backgroundColor: Colors.backgroundLight,
    },

    // ─ Header Details ─
    headerArea: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 24,
        paddingBottom: Spacing.xl,
    },
    headerTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 32,
        color: '#474747',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: '#64748B',
        lineHeight: 24,
    },

    // ─ Stepper Component ─
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: 32,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepCircleActive: {
        backgroundColor: '#E6CD7B',
    },
    stepLabel: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: '#64748B',
        letterSpacing: 1,
    },
    stepLabelActive: {
        color: '#D4AF37',
    },
    stepConnector: {
        flex: 1,
        height: 2,
        backgroundColor: '#000',
        marginHorizontal: 16,
        marginTop: -24, // Shift up to align with circles vertically
    },

    // ─ Main Dark Navy Card ─
    mainCard: {
        backgroundColor: Colors.background, // Should be '#0A1120'
        marginHorizontal: Spacing.lg,
        borderRadius: 24,
        padding: 4,
        ...Shadows.lg,
    },

    // ─ Tab Container ─
    tabContainer: {
        flexDirection: 'row',
        margin: Spacing.md,
        borderRadius: 16,
        backgroundColor: '#111827', // A bit darker than the main card, or maybe the same
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
    },
    tabButtonActive: {
        backgroundColor: '#1F2937', // Light active color
    },
    tabText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 15,
        color: Colors.textMuted,
    },
    tabTextActive: {
        color: Colors.primary,
        fontFamily: 'Inter_600SemiBold',
    },

    // ─ Upload Zone ─
    uploadArea: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    uploadZoneInner: {
        borderWidth: 1,
        borderColor: '#1F2937', // Subtle border
        borderRadius: 20,
        paddingVertical: 48,
        alignItems: 'center',
        backgroundColor: '#111827',
    },
    uploadIconOuter: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(212, 175, 55, 0.1)', // Gold tint
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    uploadTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 20,
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 28,
    },
    uploadFormats: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        marginBottom: 24,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    browseButtonText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.primary,
    },

    // ─ Selected File (Upload Area) ─
    fileSection: {
        gap: Spacing.base,
    },
    selectedFile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
        backgroundColor: '#111827',
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    fileIconBox: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: Colors.primary,
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
        color: Colors.textMuted,
    },
    fileRemove: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: Radius.full,
    },
    analyzeCTA: {
        backgroundColor: Colors.primaryDark,
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
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: Colors.white,
    },

    // ─ Paste Content ─
    pasteArea: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    pasteInput: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: Spacing.lg,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: Colors.white,
        textAlignVertical: 'top',
        minHeight: 280,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    pasteFooterInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 32,
        left: 32,
        right: 32,
    },
    charCount: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
    },
    pasteAnalyzeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#CDA153',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    pasteAnalyzeBtnText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.white,
    },

    // ─ Features Strip ─
    featuresStrip: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.primary,
    },

    // ─ Previous Scans ─
    scansSection: {
        marginTop: 32,
        paddingHorizontal: Spacing.lg,
    },
    scansSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionAccent: {
        width: 4,
        height: 20,
        backgroundColor: '#C59A45', // Gold accent
        borderRadius: 2,
        marginRight: Spacing.sm,
    },
    sectionTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: '#000',
    },
    viewAllText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: '#D4AF37',
    },
    emptyScans: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    emptyTitle: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: '#000',
        marginTop: 8,
    },
});
