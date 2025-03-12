import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";



export default function Layout() {
  return (
    <Stack>
          <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="camera" />
      </GestureHandlerRootView>
    </Stack>
  );
}
