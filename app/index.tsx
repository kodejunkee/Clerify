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
                source={require('../assets/icon.png')}
                style={styles.headerLogo}
                contentFit="contain"
              />
              <Text style={styles.headerTitleText}>Contract Guardian</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          title: '',
        }}
      />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={styles.hero}>
          {/* Architectural Shield Backdrop */}
          <View style={styles.shieldBackdrop}>
            <View style={[styles.shieldRing, { width: 280, height: 280, transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.shieldRing, { width: 220, height: 220, opacity: 0.15, transform: [{ rotate: '45deg' }] }]} />
            <View style={styles.ambientSpotlight} />
          </View>

          <View style={styles.diamondContainer}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.diamondRim}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.diamondInner}>
                <Image
                  source={require('../assets/transparent-logo.png')}
                  style={styles.heroLogo}
                  contentFit="contain"
                />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.heroTitle}>Understand What{'\n'}You're Signing</Text>
          <Text style={styles.subtitle}>
            Connect with transparency. Get an instant{'\n'}Risk Score and Red Flag analysis.
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
                <MaterialCommunityIcons name="shield-search" size={22} color={Colors.textOnPrimary} style={{ marginRight: 10 }} />
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
    paddingTop: 40,
  },
  shieldBackdrop: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: -1,
  },
  shieldRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.primary,
    opacity: 0.08,
    borderRadius: Radius.lg,
  },
  ambientSpotlight: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.03,
  },
  diamondContainer: {
    width: 130,
    height: 130,
    transform: [{ rotate: '45deg' }],
    marginBottom: 48,
    ...Shadows.xl,
  },
  diamondRim: {
    flex: 1,
    padding: 2,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamondInner: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8F9FA', // Soft pearl/off-white
    borderRadius: Radius.xl - 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  heroLogo: {
    width: 64,
    height: 64,
  },
  heroTitle: {
    ...Typography.displaySm,
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 24,
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
    color: Colors.textOnPrimary,
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
