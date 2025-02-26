import { Link } from "expo-router"; // Expo Router for navigation
import { Image, Text, View } from "react-native";

export default function Index() {

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
      <Link href={"/camera"} style={{ marginBottom: 20 }}>
        <Text style={{ color: "#6A0DAD", fontSize: 16, fontWeight: "bold" }}>
          Go to App
        </Text>
      </Link>
    </View>
  );
}
