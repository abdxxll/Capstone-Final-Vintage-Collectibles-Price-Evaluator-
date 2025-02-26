import { useNavigation } from "@react-navigation/native";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DFCEF3", // Purple background
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
        Plutus
      </Text>
      <Image
        source={require("../assets/images/logo.png")} // Replace with actual logo path
        style={{ width: 100, height: 100, marginVertical: 20 }}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("MainFunction")}
        style={{
          backgroundColor: "white",
          padding: 10,
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#6A0DAD", fontSize: 16, fontWeight: "bold" }}>
          Go to App
        </Text>
      </TouchableOpacity>
    </View>
  );
}
