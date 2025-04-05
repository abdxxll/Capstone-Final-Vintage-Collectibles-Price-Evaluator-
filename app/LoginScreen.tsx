// app/login.tsx
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert("Login Error", error.message);
    }
    // ❌ Do not redirect here — let layout handle it
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
}
