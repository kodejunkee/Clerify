import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { getHistory, deleteHistoryItem, clearHistory, HistoryItem as HistoryItemModel } from '../services/history';
import { HistoryItem } from '../components/HistoryItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

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

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen
                options={{
                    title: 'Scan History',
                    headerStyle: { backgroundColor: Colors.white },
                    headerTintColor: Colors.text,
                    headerShadowVisible: false,
                    headerRight: () => (
                        history.length > 0 ? (
                            <TouchableOpacity onPress={handleClearAll} style={{ padding: 8 }}>
                                <Text style={{ color: Colors.danger, fontSize: 14 }}>Clear All</Text>
                            </TouchableOpacity>
                        ) : null
                    )
                }}
            />

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="history" size={64} color={Colors.textLight} />
                    <Text style={styles.emptyText}>No scan history available.</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <HistoryItem
                            name={item.fileName}
                            size={item.fileSize || ''}
                            date={item.date}
                            onPress={() => handlePress(item)}
                            onDelete={() => handleDelete(item.id)}
                            layout="vertical"
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textLight,
    },
});
