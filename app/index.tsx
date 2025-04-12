import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/screens/home");
    }, 50); // delay is enough to ensure layout is mounted

    return () => clearTimeout(timer);
  }, []);

  return null;
}
