// app/_layout.tsx
import { Session } from "@supabase/supabase-js";
import { Redirect, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../supabaseClient";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔐 If not logged in, redirect to /login
  if (!session) {
    return <Redirect href="/screens/LoginScreen" />;
  }

  // ✅ Renders nested route (e.g. /, /camera, etc.)
  return <Slot />;
}
