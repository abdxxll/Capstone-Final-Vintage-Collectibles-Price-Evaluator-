import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

interface ScanItem {
  scan_id: string;
  image_url: string;
  created_at: string;
  price_model_results?: {
    estimated_price_range: string;
    key_factors: string[];
    reasoning: string[];
    confidence_level: string;
  };
  roboflow_results?: {
    outputs?: {
      [key: string]: any;
      model_predictions?: {
        predictions?: {
          class?: string;
          confidence?: number;
        }[];
      };
    }[];
  };
}

interface MetadataItem {
  name: string;
  item_id: string;
  materials: string[];
  period: string;
  rewind_price: number;
  style: string;
  culture: string;
  designer: string;
  manufacturer: string;
  model_number: string;
  country_of_origin: string;
  provenance_date: string;
  condition: string;
  dimensions: string;
  location: string;
  source_url: string;
  origin_notes: string;
  condition_notes: string;
  originality: string;
  provenance_notes: string;
  pricing_notes: string;
  owner_notes: string;
}

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - 32 - COLUMN_GAP) / NUM_COLUMNS;

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const router = useRouter();

  const fetchScans = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEmptyState(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("rewind_scans")
        .select(`
          scan_id,
          image_url,
          created_at,
          roboflow_results,
          price_model_results
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setScans(data || []);
      setEmptyState(data?.length === 0);
    } catch (error) {
      console.error("Error loading scans:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScans();
  }, [fetchScans]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const fetchMetadata = async (itemName: string, imageUrl: string, item: ScanItem) => {
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
          scanId: item.scan_id,
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

  const getConfidence = (item: ScanItem): number | undefined => {
    return item.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.confidence;
  };

  const renderItem = ({ item }: { item: ScanItem }) => {
    const detectedClass =
      item.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class ||
      "Unknown Item";
    
    const confidence = getConfidence(item);
    const confidencePercentage = confidence ? `${Math.round(confidence * 100)}%` : null;

    return (
      <TouchableOpacity
        onPress={() => fetchMetadata(detectedClass, item.image_url, item)}
        style={styles.card}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.image} 
            resizeMode="cover"
          />
          {confidencePercentage && (
            <View style={styles.confidenceTag}>
              <Text style={styles.confidenceText}>{confidencePercentage}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
            {detectedClass}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Scan History</Text>
      <Text style={styles.headerSubtitle}>
        {scans.length} {scans.length === 1 ? 'item' : 'items'} in your collection
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="image-search-outline" size={80} color={COLORS.accent1} />
      <Text style={styles.emptyStateTitle}>No Scans Yet</Text>
      <Text style={styles.emptyStateText}>
        Your scanned items will appear here. Start by scanning an item from the camera tab.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor.primary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>My Collection</Text>
          <View style={styles.placeholderButton} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.accent1} />
          <Text style={styles.loadingText}>Loading your collection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Collection</Text>
        <View style={styles.placeholderButton} />
      </View>

      {emptyState ? renderEmptyState() : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.scan_id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent1}
              colors={[COLORS.accent1]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.primaryBackground,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBar: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: textColor.primary,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  placeholderButton: {
    width: 40,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: textColor.primary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: textColor.secondary,
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: textColor.secondary,
    fontSize: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  confidenceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: textColor.primary,
  },
  cardDate: {
    fontSize: 13,
    color: textColor.secondary,
    marginTop: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: textColor.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: textColor.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});