import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

export default function HistoryScreen() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchScans = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("rewind_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setScans(data);
      if (error) console.error("Error loading scans:", error);

      setLoading(false);
    };

    fetchScans();
  }, []);

  const fetchMetadata = async (itemName: any, imageUrl: any) => {
    try {
      const { data, error } = await supabase
        .from("rewind_core_items_v2")
        .select(`
          name, item_id, materials, period,
          rewind_price, style, culture, designer,
          manufacturer, model_number, country_of_origin,
          provenance_date, condition, dimensions, location,
          source_url, origin_notes, condition_notes,
          originality, provenance_notes, pricing_notes, owner_notes
        `)
        .ilike("name", `%${itemName}%`)
        .limit(1)
        .single();

      if (error || !data) {
        console.warn("No metadata found for:", itemName);
        return;
      }

      const filteredMetadata = Object.entries(data).reduce((acc: Record<string, any>, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      router.push({
        pathname: "/screens/results",
        params: {
          imageUri: imageUrl,
          itemId: filteredMetadata.item_id,
          itemName: filteredMetadata.name,
          material: filteredMetadata.materials?.[0],
          era: filteredMetadata.period,
          rewindPrice: filteredMetadata.rewind_price,
          style: filteredMetadata.style,
          culture: filteredMetadata.culture,
          designer: filteredMetadata.designer,
          manufacturer: filteredMetadata.manufacturer,
          model_number: filteredMetadata.model_number,
          country_of_origin: filteredMetadata.country_of_origin,
          provenance_date: filteredMetadata.provenance_date,
          condition: filteredMetadata.condition,
          dimensions: filteredMetadata.dimensions,
          location: filteredMetadata.location,
          source_url: filteredMetadata.source_url,
          origin_notes: filteredMetadata.origin_notes,
          condition_notes: filteredMetadata.condition_notes,
          originality: filteredMetadata.originality,
          provenance_notes: filteredMetadata.provenance_notes,
          pricing_notes: filteredMetadata.pricing_notes,
          owner_notes: filteredMetadata.owner_notes,
          materials: JSON.stringify(filteredMetadata.materials || []),
        },
      });
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };

  interface ScanItem {
    scan_id: string;
    image_url: string;
    created_at: string;
    roboflow_results?: {
      outputs?: {
        [key: string]: any;
        model_predictions?: {
          predictions?: {
            class?: string;
          }[];
        };
      }[];
    };
  }

  const renderItem = ({ item }: { item: ScanItem }) => {
    const detectedClass =
      item.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class ||
      "Unknown";

    return (
      <TouchableOpacity
        onPress={() => fetchMetadata(detectedClass, item.image_url)}
        style={styles.card}
      >
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View style={styles.cardFooter}>
          <Text style={styles.cardTitle}>{detectedClass}</Text>
          <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.lightLime} />
      </View>
    );
  }

  return (
    <FlatList
      data={scans}
      keyExtractor={(item) => item.scan_id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.softIvory,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardFooter: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: textColor.primary,
  },
  cardDate: {
    fontSize: 14,
    color: textColor.secondary,
    marginTop: 4,
  },
});