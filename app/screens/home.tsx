import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
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
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

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

  const handlePressIn = () => {
    Animated.timing(buttonScaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(buttonScaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
      <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/CAPSTONE.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
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
        {/* <Animated.View 
          style={[
            styles.rotatingBackground, 
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          <View style={styles.rotatingBackgroundInner} />
        </Animated.View> */}

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
            <Animated.View style={[
              styles.scanButtonOuterRing,
              { transform: [{ scale: pulseAnim }] }
            ]} />
            
            <TouchableOpacity
              onPress={() => router.push("/screens/camera")}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
              style={styles.scanButton}
            >
              <Animated.View style={{ 
                transform: [{ scale: buttonScaleAnim }],
                alignItems: 'center' 
              }}>
                <AntDesign name="videocamera" size={48} color={COLORS.primary} />
                <Text style={styles.scanButtonText}>Scan Now</Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.scanButtonHint}>Tap to scan an item</Text>
        </View>

        {/* Quick Actions */}
        {/* <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/screens/history")}
          >
            <View style={styles.quickActionIconContainer}>
              <Ionicons name="time-outline" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/screens/discover")}
          >
            <View style={styles.quickActionIconContainer}>
              <Ionicons name="compass-outline" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/screens/settings")}
          >
            <View style={styles.quickActionIconContainer}>
              <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/screens/home" })} 
          style={styles.footerTab}
        >
          <View style={styles.activeTabIndicator} />
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
    position: 'relative',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: COLORS.primaryBackground,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 12,
    color: textColor.secondary,
    marginTop: 2,
  },
  logoImage: {
    height: 50,
    width: 50,
   
  },
  profileButton: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    padding: 10,
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    backgroundColor: COLORS.primaryBackground,
    
  },
  rotatingBackground: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  rotatingBackgroundInner: {
    width: '90%',
    height: '90%',
    borderRadius: width * 0.45,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    borderStyle: 'dashed',
  },
  scanButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  scanButtonAnimatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanButtonGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  scanButtonOuterRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: COLORS.primary,
    opacity: 0.6,
  },
  scanButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  scanButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scanButtonHint: {
    marginTop: 16,
    fontSize: 14,
    color: textColor.secondary,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickActionButton: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    color: textColor.primary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerTab: {
    alignItems: "center",
    paddingHorizontal: 24,
    position: 'relative',
  },
  activeTabIndicator: {
    position: 'absolute',
    top: -14,
    width: 24,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  footerTabText: {
    fontSize: 12,
    marginTop: 4,
    color: textColor.secondary,
  },
  footerTabTextActive: {
    fontSize: 12,
    marginTop: 4,
    color: textColor.primary,
    fontWeight: '600',
  },
});

export default HomeScreen;