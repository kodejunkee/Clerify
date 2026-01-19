import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();


  const handleAnalyzePress = () => {
    router.push('/analyze');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <MaterialCommunityIcons name="scale-balance" size={24} color={Colors.text} style={styles.headerIcon} />
              <Text style={styles.headerTitleText}>Clerify</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
          title: '' // Clear default title
        }}
      />
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="scale-balance" size={64} color={Colors.white} />
          </View>
          <Text style={styles.subtitle}>
            Upload or paste legal text to get a clear Risk Score and Red Flags.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>

          {/* Upload Button */}
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleAnalyzePress}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Analyze Document</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>Upload PDF, JPG, PNG or Paste Text</Text>
          </View>


          {/* Scan History Link */}
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/history')}>
            <Text style={styles.linkText}>View Scan History</Text>
          </TouchableOpacity>

        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.infoText}>
            AI-Powered analysis helps you understand what you're signing.
            Protect yourself from unfair clauses.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
    backgroundColor: '#1C1C1E',
    color: Colors.white,
    padding: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center', // Center vertically
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#1C1C1E', // Dark gray/black box
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  actions: {
    width: '100%',
    gap: 32,
    marginBottom: 40,
  },
  actionGroup: {
    gap: 8,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  linkButton: {
    alignSelf: 'center',
    padding: 8,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 24,
  },
  infoText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '90%',
  },
});
