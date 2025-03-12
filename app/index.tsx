import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "../styles/theme";

const { width, height } = Dimensions.get("window");

// Updated Icons with Modern Colors
const IconUser = () => (
  <View style={{ width: 24, height: 24, alignItems: "center" }}>
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.platinumSilver, marginBottom: 2 }} />
    <View style={{ width: 16, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: COLORS.platinumSilver }} />
  </View>
);

const HomeScreen = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
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
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.obsidianBlack }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.obsidianBlack} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.white }}>PLUTUS AI</Text>
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={{ backgroundColor: COLORS.imperialPurple, padding: 8, borderRadius: 50 }}
        >
          <IconUser />
        </TouchableOpacity>
      </View>

      {/* Centered Circular Scan Button */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/camera")}
            activeOpacity={0.8}
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: COLORS.imperialPurple,
              justifyContent: "center",
              alignItems: "center",
              elevation: 8,
              shadowColor: COLORS.platinumSilver,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Text style={{ fontSize: 32, color: COLORS.white }}>📷</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, backgroundColor: COLORS.royalSapphire, borderTopWidth: 1, borderTopColor: COLORS.platinumSilver }}>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <View style={{ backgroundColor: COLORS.imperialPurple, padding: 10, borderRadius: 30, marginBottom: 5 }}>
            <Text style={{ fontSize: 18, color: COLORS.platinumSilver }}>📸</Text>
          </View>
          <Text style={{ fontSize: 12, color: COLORS.platinumSilver }}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center", opacity: 0.7 }}>
          <View style={{ padding: 10, borderRadius: 30, marginBottom: 5 }}>
            <Text style={{ fontSize: 18, color: COLORS.platinumSilver }}>📈</Text>
          </View>
          <Text style={{ fontSize: 12, color: COLORS.platinumSilver }}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center", opacity: 0.7 }}>
          <View style={{ padding: 10, borderRadius: 30, marginBottom: 5 }}>
            <Text style={{ fontSize: 18, color: COLORS.platinumSilver }}>🔎</Text>
          </View>
          <Text style={{ fontSize: 12, color: COLORS.platinumSilver }}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center", opacity: 0.7 }}>
          <View style={{ padding: 10, borderRadius: 30, marginBottom: 5 }}>
            <Text style={{ fontSize: 18, color: COLORS.platinumSilver }}>👤</Text>
          </View>
          <Text style={{ fontSize: 12, color: COLORS.platinumSilver }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
