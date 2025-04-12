import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";

const { width, height } = Dimensions.get("window");

const IconUser = () => (
  <View style={styles.userIconContainer}>
    <View style={styles.userIconHead} />
    <View style={styles.userIconBody} />
  </View>
);

const HomeScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // For the rotating effect in the background
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slow continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.primaryBackground} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Capstone</Text>
          {/* <Text style={styles.tagline}>Scan items and discover their value</Text> */}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/screens/profile")}
          style={styles.profileButton}
        >
          <IconUser />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Rotating background effect */}
        <Animated.View 
          style={[
            styles.rotatingBackground, 
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          <View style={styles.rotatingBackgroundInner} />
        </Animated.View>

        {/* Scan Button with Text and Animation */}
        <View style={styles.scanButtonContainer}>
          <Animated.View
            style={[
              styles.scanButtonAnimatedContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: pulseAnim }
                ],
              },
            ]}
          >
            <View style={styles.scanButtonGlow} />
            <TouchableOpacity
              onPress={() => router.push("/screens/camera")}
              activeOpacity={0.8}
              style={styles.scanButton}
            >
              <AntDesign name="videocamera" size={54} color={COLORS.primary} />
     
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.scanButtonHint}>Tap to scan an item</Text>
        </View>

        {/* Feature Cards */}
        {/* <View style={styles.featureCardsContainer}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push("/screens/history")}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.featureTitle}>History</Text>
            <Text style={styles.featureDescription}>View your recently scanned items</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push("/screens/discover")}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name="compass-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.featureTitle}>Discover</Text>
            <Text style={styles.featureDescription}>Explore trending items</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/screens/home" })} 
          style={styles.footerTab}
        >
          <Ionicons name="home" size={24} color={textColor.primary} />
          <Text style={styles.footerTabTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/screens/camera")} 
          style={styles.footerTab}
        >
          <Ionicons name="scan-outline" size={24} color={textColor.secondary} />
          <Text style={styles.footerTabText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/screens/history")} 
          style={styles.footerTab}
        >
          <Ionicons name="time-outline" size={24} color={textColor.secondary} />
          <Text style={styles.footerTabText}>History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: textColor.primary,
  },
  tagline: {
    fontSize: 12,
    color: textColor.secondary,
    marginTop: 2,
  },
  profileButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
  },
  userIconHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginBottom: 2,
  },
  userIconBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: COLORS.primary,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  rotatingBackground: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  rotatingBackgroundInner: {
    width: '85%',
    height: '85%',
    borderRadius: width * 0.45,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  scanButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonAnimatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scanButtonGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  scanButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primaryBackground,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  scanButtonText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '600',
    color: textColor.primary,
  },
  scanButtonHint: {
    marginTop: 8,
    fontSize: 14,
    color: textColor.secondary,
    marginBottom: 30,
  },
  featureCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColor.primary,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: textColor.secondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'white',
  },
  footerTab: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  footerTabText: {
    fontSize: 12,
    marginTop: 2,
    color: textColor.secondary,
  },
  footerTabTextActive: {
    fontSize: 12,
    marginTop: 2,
    color: textColor.primary,
    fontWeight: '600',
  },
});

export default HomeScreen;