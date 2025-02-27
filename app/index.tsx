import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const HomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DFCEF3",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
        Plutus
      </Text>
      <Image
        source={require("../assets/images/logo.png")}
        style={{ width: 100, height: 100, marginVertical: 20 }}
      />
      <TouchableOpacity
        onPress={() => router.push("/inference")}
        style={{
          backgroundColor: "#DFCEF3",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          minWidth: 120,
          alignItems: "center",
          borderWidth: 2, 
          borderColor: "white", 
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Go to Inference</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/camera")}
          style={{
            backgroundColor: "##DFCEF3",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            minWidth: 120,
            alignItems: "center",
            borderWidth: 2, 
            borderColor: "white", 
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Go to App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
