import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Radius, Shadows, Spacing, Typography } from '../constants/Theme';

export default function HomeScreen() {
  const router = useRouter();
  const ctaScale = useRef(new Animated.Value(1)).current;
  const linkScale = useRef(new Animated.Value(1)).current;

  const animatePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const animatePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Image
                source={require('../assets/transparent-logo.png')}
                style={styles.headerLogo}
                contentFit="contain"
              />
              <Text style={styles.headerTitleText}>Clerify</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          title: '',
        }}
      />
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={styles.hero}>
          {/* Glow effect behind the logo */}
          <View style={styles.glowOuter}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.15)', 'rgba(59, 130, 246, 0.08)', 'transparent']}
              style={styles.glowGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </View>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={Colors.gradientLight}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={require('../assets/transparent-logo.png')}
                style={styles.heroLogo}
                contentFit="contain"
              />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Understand What{'\n'}You're Signing</Text>
          <Text style={styles.subtitle}>
            Upload or paste legal text to get an instant{'\n'}Risk Score and Red Flag analysis.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* CTA Button */}
          <Animated.View style={[styles.ctaWrapper, { transform: [{ scale: ctaScale }] }]}>
            <Pressable
              onPressIn={() => animatePressIn(ctaScale)}
              onPressOut={() => animatePressOut(ctaScale)}
              onPress={() => router.push('/analyze')}
              style={styles.ctaPressable}
            >
              <LinearGradient
                colors={Colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <MaterialCommunityIcons name="shield-search" size={22} color={Colors.white} style={{ marginRight: 10 }} />
                <Text style={styles.ctaText}>Analyze Document</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          <Text style={styles.helperText}>Supports PDF, JPG, PNG or Pasted Text</Text>

          {/* Scan History Link */}
          <Animated.View style={{ transform: [{ scale: linkScale }] }}>
            <Pressable
              onPressIn={() => animatePressIn(linkScale)}
              onPressOut={() => animatePressOut(linkScale)}
              onPress={() => router.push('/history')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>View Scan History</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.primary} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={Colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.infoText}>
              AI-Powered analysis helps you understand what you're signing.
            </Text>
          </View>
          <Text style={styles.infoText}>Protect yourself from unfair clauses.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: Radius.sm,
  },
  headerTitleText: {
    ...Typography.headingLg,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing['4xl'],
    marginTop: 20,
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
    position: 'relative',
    paddingTop: 15,
  },
  glowOuter: {
    position: 'absolute',
    top: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
    ...Shadows.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: Radius['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLogo: {
    width: 70,
    height: 70,
  },
  heroTitle: {
    ...Typography.displaySm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '85%',
  },

  // Actions
  actions: {
    width: '100%',
    gap: Spacing.lg,
    marginBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  ctaWrapper: {
    width: '100%',
    borderRadius: Radius.lg,
    ...Shadows.colored(Colors.primary),
  },
  ctaPressable: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaText: {
    ...Typography.button,
    letterSpacing: 0.3,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    gap: 4,
  },
  linkText: {
    ...Typography.label,
    color: Colors.primary,
  },

  // Footer
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    gap: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.textMuted,
  },
});
