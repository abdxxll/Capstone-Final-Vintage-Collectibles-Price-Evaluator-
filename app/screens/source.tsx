import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

export default function PriceSources() {
  const { itemName } = useLocalSearchParams();
  const router = useRouter();
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  useEffect(() => {
    if (itemName) resolveItemAndFetchSources(itemName as string);
  }, [itemName]);

  const resolveItemAndFetchSources = async (name: string) => {
    const { data: item, error: itemError } = await supabase
      .from("rewind_core_items_v2")
      .select("item_id")
      .ilike("name", `%${name}%`)
      .limit(1)
      .single();

    if (itemError || !item) {
      console.warn("No matching item found for name:", name);
      return;
    }

    const { data: sourcesData, error: metadataError } = await supabase
      .from("rewind_item_metadata")
      .select("*")
      .eq("item_id", item.item_id)
      .order("created_at", { ascending: false });

    if (metadataError) {
      console.error("Failed to fetch sources:", metadataError);
    } else {
      setSources(sourcesData);
    }
  };

  const SourceCard = ({ metadata }: { metadata: any }) => {
    const name = metadata?.basic_info?.name || "Unnamed Item";
    const price = metadata?.pricing?.price || null;
    const url = metadata?.source?.url;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedSource(metadata)}
      >
        <Text style={styles.cardTitle} numberOfLines={2}>{name}</Text>
        {price && <Text style={styles.cardPrice}>${Number(price).toLocaleString()}</Text>}
        {url && (
          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Text style={styles.cardLink}>View Source ↗</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderMetadataModal = () => {
    if (!selectedSource) return null;

    return (
      <Modal visible transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {selectedSource?.basic_info?.name || "Source Details"}
              </Text>

              {Object.entries(selectedSource || {}).map(([section, sectionData]) => {
                if (typeof sectionData !== "object" || sectionData === null) return null;
                return (
                  <View key={section} style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {section.replace(/_/g, " ").toUpperCase()}
                    </Text>
                    {Object.entries(sectionData).map(([key, value]) => (
                      <View key={key} style={styles.detailRow}>
                        <Text style={styles.key}>{key}</Text>
                        <Text style={styles.value}>
                          {Array.isArray(value)
                            ? value.join(", ")
                            : value?.toString() || "N/A"}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setSelectedSource(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor.primary} />
        </TouchableOpacity>
        <Text style={styles.header}>Price Sources</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {sources.length === 0 ? (
          <Text style={styles.emptyText}>No sources found for this item.</Text>
        ) : (
          sources.map((s) => (
            <SourceCard key={s.id} metadata={s.metadata} />
          ))
        )}
      </ScrollView>

      {renderMetadataModal()}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.softIvory,
      paddingHorizontal: 20,
    },
    navBar: {
      paddingTop: 60,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      color: textColor.primary,
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
      color: textColor.secondary,
      marginTop: 40,
    },
    card: {
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 14,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: textColor.primary,
      marginBottom: 5,
    },
    cardPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.lightLime,
    },
    cardLink: {
      marginTop: 8,
      color: "#007AFF",
      textDecorationLine: "underline",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "center",
      alignItems: "center",
      padding: 15,
    },
    modalContent: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 20,
      width: "100%",
      maxHeight: "90%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: textColor.primary,
      marginBottom: 15,
      textAlign: "center",
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 8,
      textTransform: "capitalize",
      color: textColor.secondary,
    },
    detailRow: {
      marginBottom: 6,
    },
    key: {
      fontSize: 13,
      color: "#666",
    },
    value: {
      fontSize: 14,
      fontWeight: "500",
      color: textColor.primary,
    },
    closeBtn: {
      marginTop: 15,
      backgroundColor: COLORS.lightLime,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    closeBtnText: {
      fontWeight: "bold",
      fontSize: 16,
      color: textColor.primary,
    },
  });
  