import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from './analysis';

const HISTORY_KEY = 'scan_history';
const MAX_HISTORY_ITEMS = 20;

export interface HistoryItem {
    id: string;
    fileName: string;
    date: string; // ISO string
    fileSize?: string;
    result: AnalysisResult;
}

export const saveScan = async (item: HistoryItem): Promise<void> => {
    try {
        const currentHistory = await getHistory();

        // Add to top
        const updatedHistory = [item, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save scan history:", error);
    }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error("Failed to load history:", error);
        return [];
    }
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
    try {
        const currentHistory = await getHistory();
        const updatedHistory = currentHistory.filter(item => item.id !== id);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to delete history item:", error);
    }
};

export const clearHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Failed to clear history:", error);
    }
};
