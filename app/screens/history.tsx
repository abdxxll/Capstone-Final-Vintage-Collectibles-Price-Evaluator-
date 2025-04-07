import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo vector icons
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../supabaseClient";

const { width } = Dimensions.get("window");

export default function HistoryScreen() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      console.warn("No user found");
      return;
    }

    const { data, error } = await supabase
      .from("rewind_scans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching scans:", error);
    } else {
      setScans(data);
    }

    setLoading(false);
  };

  const fetchMetadata = async (className: string) => {
    try {
      const { data, error } = await supabase
        .from("rewind_core_items")
        .select("*")
        .ilike("title", `%${className}%`)
        .single();

      if (error) {
        console.warn("No metadata found for:", className);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Metadata fetch failed:", err);
      return null;
    }
  };

  const getTimeSince = (date: string) => {
    const now = new Date();
    const scanDate = new Date(date);
    const seconds = Math.floor((now.getTime() - scanDate.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  const DetailItem = ({ label, value, icon }: { label: string; value?: string; icon?: string }) => (
    <View style={styles.detailItem}>
      {icon && <Ionicons name={icon as any} size={18} color="#555" style={styles.detailIcon} />}
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "Not available"}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const detectedClass =
      item.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class || "Unknown";
    
    // For alternating layouts (big card, then two small ones)
    const isBigCard = index % 3 === 0;
    const cardStyle = isBigCard ? styles.bigCard : styles.smallCard;
    const imageStyle = isBigCard ? styles.bigCardImage : styles.smallCardImage;
    
    return (
      <TouchableOpacity
        onPress={async () => {
          const className =
            item.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class;
          const metadata = await fetchMetadata(className);
          setSelectedScan({ ...item, metadata });
        }}
        style={[styles.card, cardStyle]}
      >
        <Image
          source={{ uri: item.image_url }}
          style={[styles.cardImage, imageStyle]}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{detectedClass}</Text>
          <Text style={styles.cardDate}>
            {getTimeSince(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading your scans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <View style={styles.header}>
    <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Your Scans</Text>
    <TouchableOpacity style={styles.filterButton}>
      <Ionicons name="filter" size={22} color="#333" />
    </TouchableOpacity>
  </View>
  
      
      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="scan-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptySubtitle}>
            Start scanning objects to build your collection
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.scan_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal with Scan Details */}
      <Modal visible={!!selectedScan} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <ScrollView>
        {/* Back Button in Modal */}
        <TouchableOpacity
          style={{ padding: 16 }}
          onPress={() => setSelectedScan(null)}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Image */}
        <Image
          source={{ uri: selectedScan?.image_url }}
          style={{ width: "100%", height: 240, resizeMode: "cover" }}
        />

        {/* Price Tag */}
        {selectedScan?.metadata?.rewind_price && (
          <View
            style={{
              position: "absolute",
              top: 210,
              right: 20,
              backgroundColor: "#CDE990",
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
              ${Number(selectedScan.metadata.rewind_price).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Description */}
        {selectedScan?.metadata?.description && (
          <Text style={{ padding: 20, fontSize: 15, color: "#666", lineHeight: 22 }}>
            {selectedScan.metadata.description}
          </Text>
        )}

        {/* Two Columns of Details */}
        <View style={{ flexDirection: "row", paddingHorizontal: 20 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <DetailItem label="Style" value={selectedScan?.metadata?.style} />
            <DetailItem label="Period" value={selectedScan?.metadata?.period} />
            <DetailItem label="Manufacturer" value={selectedScan?.metadata?.manufacturer} />
            <DetailItem
              label="Materials"
              value={
                Array.isArray(selectedScan?.metadata?.materials)
                  ? selectedScan?.metadata?.materials.join(", ")
                  : selectedScan?.metadata?.materials
              }
            />
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <DetailItem label="Country of Origin" value={selectedScan?.metadata?.place_of_origin} />
            <DetailItem label="Condition" value={selectedScan?.metadata?.condition} />
            <DetailItem label="Dimensions" value={selectedScan?.metadata?.dimensions} />
            <DetailItem label="Provenance Date" value={selectedScan?.metadata?.provenance_date} />
          </View>
        </View>

        {/* Reference Info */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <DetailItem label="Reference Number" value={selectedScan?.metadata?.reference_number} />
          <DetailItem label="Seller Location" value={selectedScan?.metadata?.seller_location} />
        </View>

        {/* External Link */}
        {selectedScan?.metadata?.link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(selectedScan.metadata.link)}
            style={{
              backgroundColor: "#CDE990",
              margin: 20,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16, color: "#333" }}>
              View Product
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    maxWidth: 250,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bigCard: {
    height: 280,
    marginHorizontal: 10,
  },
  smallCard: {
    height: 180,
    width: (width - 40) / 2,
    marginHorizontal: 5,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  bigCardImage: {
    height: 280,
  },
  smallCardImage: {
    height: 180,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDate: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 250,
  },
  modalBody: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  priceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  detailIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: "#333",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  linkButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
  backButton: {
    marginRight: 10,
  },
  
});