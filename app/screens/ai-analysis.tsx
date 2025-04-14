import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

type GeminiAnalysis = {
  estimated_price_range: string;
  key_factors: string[];
  reasoning: string[];
  confidence_level: string;
};

export default function AIAnalysis() {
  const router = useRouter();
  const { scanId, itemName, imageUrl } = useLocalSearchParams<{
    scanId: string;
    itemName: string;
    imageUrl: string;
  }>();
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        if (!scanId) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from("rewind_scans")
          .select("price_model_results, created_at")
          .eq("scan_id", scanId)
          .single();

        if (error) {
          throw error;
        }
        
        if (!data?.price_model_results) {
          return;
        }

        setAnalysis(data.price_model_results);
      } catch (error) {
        // Keep this error log as it's important for debugging issues
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [scanId]);

  if (!scanId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid Scan</Text>
        <Text style={styles.errorSubtext}>
          Unable to find the scan. Please try again.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading AI analysis...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No analysis available</Text>
        <Text style={styles.errorSubtext}>
          The AI analysis is not yet available for this scan. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={textColor.primary}
          onPress={() => router.back()}
        />
        <Text style={styles.title}>{itemName || "AI Analysis"}</Text>
      </View>

      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image} 
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated Price Range</Text>
        <Text style={styles.sectionContent}>{analysis.estimated_price_range}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Factors</Text>
        {analysis.key_factors.map((factor, index) => (
          <Text key={index} style={styles.bulletPoint}>
            • {factor}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reasoning</Text>
        {analysis.reasoning.map((reason, index) => (
          <Text key={index} style={styles.bulletPoint}>
            • {reason}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidence Level</Text>
        <Text style={styles.sectionContent}>{analysis.confidence_level}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral300,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    color: textColor.primary,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral300,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: textColor.primary,
  },
  sectionContent: {
    fontSize: 16,
    color: textColor.secondary,
    lineHeight: 24,
  },
  bulletPoint: {
    fontSize: 16,
    color: textColor.secondary,
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: textColor.secondary,
    textAlign: "center",
    marginTop: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: textColor.secondary,
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: textColor.secondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
}); 