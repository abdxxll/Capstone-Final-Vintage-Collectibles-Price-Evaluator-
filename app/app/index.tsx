import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
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
import { COLORS, textColor } from "../../styles/theme";


const { width, height } = Dimensions.get("window");

const IconUser = () => (
  <View style={{ width: 24, height: 24, alignItems: "center" }}>
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.softPurple, marginBottom: 2 }} />
    <View style={{ width: 16, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: COLORS.softPurple }} />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.softIvory }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.softIvory} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: textColor.primary }}>Capstone</Text>
        <TouchableOpacity
          onPress={() => router.push("/screens/LoginScreen")}
          style={{ backgroundColor: COLORS.softIvory, padding: 8, borderRadius: 50 }}
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
            onPress={() => router.push("/screens/camera")}
            activeOpacity={0.8}
            style={{
              width: 150,
              height: 150,
              borderRadius: 45,
              backgroundColor: COLORS.softIvory,
              justifyContent: "center",
              alignItems: "center",
              elevation: 8,
              shadowColor: COLORS.softPurple,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
        <AntDesign name="videocamera" size={56} color="charcoalBrown" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingTop: 12 }}>
  <TouchableOpacity onPress={() => router.push({ pathname: "/app" })} style={{ alignItems: "center" }}>
    <Ionicons name="home-outline" size={24} color={textColor.primary} />
    <Text style={{ fontSize: 12, color: textColor.primary }}>Home</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => router.push("/screens/history")} style={{ alignItems: "center" }}>
    <Ionicons name="time-outline" size={24} color={textColor.secondary} />
    <Text style={{ fontSize: 12, color: textColor.secondary }}>History</Text>
  </TouchableOpacity>
</View>

    
    </SafeAreaView>
  );
};

export default HomeScreen;
