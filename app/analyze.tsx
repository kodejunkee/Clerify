import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { pickDocument, PickedDocument } from '../services/document';
import { analyzeContractFromFile, analyzeContract } from '../services/analysis';
import { saveScan, getHistory, deleteHistoryItem, HistoryItem as HistoryItemModel } from '../services/history';
import { HistoryItem } from '../components/HistoryItem';

type Tab = 'upload' | 'paste';

export default function AnalyzeScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Upload State
    const [selectedFile, setSelectedFile] = useState<PickedDocument | null>(null);

    // Paste State
    const [text, setText] = useState('');

    // History State
    const [history, setHistory] = useState<HistoryItemModel[]>([]);

    // Load history when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
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
                Alert.alert("File Too Large", "Please select a file smaller than 15MB.");
            } else {
                console.error(error);
            }
        }
    };

    const handleAnalyzeFile = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        try {
            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
                encoding: 'base64',
            });

            // Analyze with mimeType
            const result = await analyzeContractFromFile(base64, selectedFile.mimeType);

            // Save to history
            const newItem: HistoryItemModel = {
                id: Date.now().toString(),
                fileName: selectedFile.name,
                date: new Date().toISOString(),
                fileSize: selectedFile.size ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown',
                result: result,
            };
            await saveScan(newItem);
            loadHistory();

            router.push({
                pathname: '/analysis-result',
                params: { result: JSON.stringify(result) }
            });

            // Clear selection after successful analyze? Maybe keep it. 
            // Let's keep it for now so user sees what they just did if they come back.

        } catch (error) {
            Alert.alert("Analysis Failed", "Could not analyze the file. Please try again.");
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

            // Save to history
            const newItem: HistoryItemModel = {
                id: Date.now().toString(),
                fileName: "Pasted Text Analysis",
                date: new Date().toISOString(),
                fileSize: text.length + ' chars',
                result: result,
            };
            await saveScan(newItem);
            loadHistory();

            router.push({
                pathname: '/analysis-result',
                params: { result: JSON.stringify(result) }
            });
        } catch (error) {
            Alert.alert("Analysis Error", "Failed to analyze text.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen
                options={{
                    title: 'Analyze Document',
                    headerStyle: { backgroundColor: Colors.white },
                    headerTintColor: Colors.text,
                    headerShadowVisible: false,
                }}
            />

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
                    onPress={() => setActiveTab('upload')}
                >
                    <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>Upload File</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'paste' && styles.activeTab]}
                    onPress={() => setActiveTab('paste')}
                >
                    <Text style={[styles.tabText, activeTab === 'paste' && styles.activeTabText]}>Paste Text</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>

                {activeTab === 'upload' ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {!selectedFile ? (
                            <TouchableOpacity style={styles.uploadArea} onPress={handlePickFile}>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons name="file-document-outline" size={40} color={Colors.primary} />
                                </View>
                                <Text style={styles.uploadTitle}>Click to Upload a PDF, JPG or PNG File</Text>
                                <Text style={styles.uploadSubtitle}>(Max 15MB)</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.selectedFileContainer}>
                                <View style={styles.selectedFileIcon}>
                                    <MaterialCommunityIcons name="file-check-outline" size={32} color={Colors.white} />
                                </View>
                                <View style={styles.selectedFileInfo}>
                                    <Text style={styles.selectedFileName} numberOfLines={1}>{selectedFile.name}</Text>
                                    <Text style={styles.selectedFileSize}>
                                        {(selectedFile.size ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.removeFileButton}>
                                    <MaterialCommunityIcons name="close" size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            </View>
                        )}

                        {selectedFile && (
                            <TouchableOpacity
                                style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
                                onPress={handleAnalyzeFile}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <ActivityIndicator color={Colors.white} />
                                ) : (
                                    <Text style={styles.analyzeButtonText}>Analyze Contract</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        <View style={{ height: 24 }} />

                        <View style={styles.historyHeader}>
                            <Text style={styles.sectionTitle}>Previous Scans</Text>
                            {history.length > 0 && (
                                <Text style={styles.historyCount}>{history.length} items</Text>
                            )}
                        </View>

                        {history.length === 0 ? (
                            <Text style={styles.emptyHistory}>No output history yet.</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentList}>
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
                    </ScrollView>
                ) : (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.pasteContainer}
                    >
                        <TextInput
                            style={styles.pasteInput}
                            multiline
                            placeholder="Paste your contract text here..."
                            value={text}
                            onChangeText={setText}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            style={[styles.analyzeButton, (!text.trim() || isAnalyzing) && styles.disabledButton]}
                            onPress={handlePasteAnalyze}
                            disabled={!text.trim() || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.analyzeButtonText}>Analyze Contract</Text>
                            )}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                )}

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#F5F5F5',
        margin: 16,
        borderRadius: 12,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: Colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        color: Colors.textLight,
        fontWeight: '600',
    },
    activeTabText: {
        color: Colors.text,
    },
    contentContainer: {
        flex: 1,
        // backgroundColor: '#FAFAFA', 
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAFA',
        marginBottom: 32,
        minHeight: 250,
    },
    selectedFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    selectedFileIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    selectedFileInfo: {
        flex: 1,
    },
    selectedFileName: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedFileSize: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    removeFileButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    uploadSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    historyCount: {
        fontSize: 12,
        color: Colors.textLight,
    },
    emptyHistory: {
        fontStyle: 'italic',
        color: Colors.textLight,
        marginBottom: 24,
    },
    recentList: {
        flexGrow: 0,
        marginBottom: 24,
    },
    pasteContainer: {
        flex: 1,
        padding: 16,
        // paddingBottom will be handled by KeyboardAvoidingView
    },
    pasteInput: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    analyzeButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    analyzeButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
