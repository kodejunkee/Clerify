import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface HistoryItemProps {
    name: string;
    size: string;
    date?: string; // Optional date for more detailed views
    onPress: () => void;
    onDelete: () => void;
    layout?: 'horizontal' | 'vertical'; // Support different layouts
}

export const HistoryItem = ({ name, size, date, onPress, onDelete, layout = 'horizontal' }: HistoryItemProps) => {

    if (layout === 'vertical') {
        return (
            <TouchableOpacity style={styles.verticalItem} onPress={onPress}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.primary} />
                </View>
                <View style={styles.verticalInfo}>
                    <Text style={styles.verticalName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.verticalMeta}>
                        {size} • {date ? new Date(date).toLocaleDateString() : ''}
                    </Text>
                </View>
                <TouchableOpacity style={styles.verticalDelete} onPress={(e) => { e.stopPropagation(); onDelete(); }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.textLight} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.horizontalItem} onPress={onPress}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.horizontalName} numberOfLines={1}>{name}</Text>
            <Text style={styles.horizontalSize}>{size}</Text>
            <TouchableOpacity style={styles.horizontalDelete} onPress={(e) => { e.stopPropagation(); onDelete(); }}>
                <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.danger} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Horizontal Layout (Analyze Screen)
    horizontalItem: {
        width: 140,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        marginRight: 12,
        position: 'relative',
        backgroundColor: Colors.white,
    },
    horizontalName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        color: Colors.text,
    },
    horizontalSize: {
        fontSize: 12,
        color: Colors.textLight,
    },
    horizontalDelete: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        padding: 4,
    },

    // Vertical Layout (History Screen)
    verticalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    verticalInfo: {
        flex: 1,
    },
    verticalName: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 4,
    },
    verticalMeta: {
        fontSize: 12,
        color: Colors.textLight,
    },
    verticalDelete: {
        padding: 8,
    },
});
