import React from 'react';
import { View, Text, StyleSheet, Animated, Pressable, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, Radius, Shadows } from '../constants/Theme';

interface HistoryItemProps {
    name: string;
    size: string;
    date?: string;
    onPress: () => void;
    onDelete: () => void;
    layout?: 'horizontal' | 'vertical';
}

export const HistoryItem = ({ name, size, date, onPress, onDelete, layout = 'horizontal' }: HistoryItemProps) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };
    const onPressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };

    if (layout === 'vertical') {
        return (
            <Animated.View style={[styles.verticalWrapper, { transform: [{ scale: scaleAnim }] }]}>
                <Pressable
                    style={styles.verticalItem}
                    onPress={onPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                >
                    {/* Visual Accent Strip */}
                    <View style={styles.verticalAccent} />
                    
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="file-document-outline" size={22} color={Colors.primary} />
                    </View>
                    
                    <View style={styles.verticalInfo}>
                        <Text style={styles.verticalName} numberOfLines={1}>{name}</Text>
                        <View style={styles.verticalMetaRow}>
                            <MaterialCommunityIcons name="database-outline" size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                            <Text style={styles.verticalMetaText}>{size}</Text>
                            {date && (
                                <>
                                    <View style={styles.metaDot} />
                                    <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                                    <Text style={styles.verticalMetaText}>
                                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.verticalDelete}
                            onPress={(e) => { e.stopPropagation(); onDelete(); }}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    // Horizontal Layout (used in Analyze Screen "Recent")
    return (
        <Animated.View style={[styles.horizontalWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <Pressable
                style={styles.horizontalItem}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <View style={styles.horizontalIconCircle}>
                    <MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.primary} />
                </View>
                
                <Text style={styles.horizontalName} numberOfLines={1}>{name}</Text>
                
                <View style={styles.horizontalMeta}>
                    <Text style={styles.horizontalSize}>{size}</Text>
                    <TouchableOpacity
                        style={styles.horizontalDelete}
                        onPress={(e) => { e.stopPropagation(); onDelete(); }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // ─── Horizontal Layout ───
    horizontalWrapper: {
        marginRight: Spacing.md,
        paddingBottom: 4, // Space for shadow
    },
    horizontalItem: {
        width: 160,
        padding: Spacing.md,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surface,
        ...Shadows.md,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    horizontalIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    horizontalName: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.text,
        marginBottom: 8,
    },
    horizontalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    horizontalSize: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: Colors.textMuted,
    },
    horizontalDelete: {
        padding: 4,
    },

    // ─── Vertical Layout ───
    verticalWrapper: {
        marginBottom: Spacing.sm,
    },
    verticalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
    },
    verticalAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 4,
        backgroundColor: Colors.primary,
        opacity: 0.15,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    verticalInfo: {
        flex: 1,
    },
    verticalName: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: Colors.text,
        marginBottom: 4,
    },
    verticalMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verticalMetaText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: Colors.textMuted,
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    verticalDelete: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
    },
});
