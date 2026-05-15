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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Custom Header */}
        <View style={styles.customHeader}>
          <View style={styles.headerLogoBox}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.headerLogoImage}
              contentFit="contain"
            />
          </View>
          <Text style={styles.headerTitleText}>Contract Guardian</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroImageStack}>
            {/* Background Diamond */}
            <LinearGradient
              colors={Colors.gradientGold}
              style={styles.heroDiamond}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Foreground White Square */}
            <View style={styles.heroWhiteSquare}>
              <Image
                source={require('../assets/transparent-logo.png')}
                style={styles.heroMainLogo}
                contentFit="contain"
              />
            </View>
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
                colors={Colors.gradientGold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <View style={styles.ctaIconContainer}>
                  <MaterialCommunityIcons name="shield-check" size={16} color={Colors.primaryDark} />
                </View>
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
            <MaterialCommunityIcons name="shield-check-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              AI-Powered analysis helps you understand what{'\n'}you're signing.
            </Text>
          </View>
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  headerLogoBox: {
    width: 40,
    height: 30,
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerLogoImage: {
    width: 24,
    height: 24,
  },
  headerTitleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.white,
  },
  scrollContent: {
    padding: Spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing['4xl'],
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  heroImageStack: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  heroDiamond: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: Radius.xl,
    transform: [{ rotate: '45deg' }],
  },
  heroWhiteSquare: {
    position: 'absolute',
    width: 180,
    height: 180,
    backgroundColor: Colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xl,
  },
  heroMainLogo: {
    width: 120,
    height: 120,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: Colors.white,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  ctaIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  ctaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textOnPrimary,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },

  // Footer
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
