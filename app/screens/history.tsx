import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
const COLUMN_GAP = 16;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - 40 - COLUMN_GAP) / NUM_COLUMNS;

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
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

  const getEstimatedPrice = (item: ScanItem): string | undefined => {
    return item.price_model_results?.estimated_price_range;
  };

  // Pre-create animated values outside of render item
  const itemAnimations = scans.map((_, index) => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
    animationStarted: false
  }));
  
  // Function to start animation for a specific item
  const startItemAnimation = (index: number) => {
    if (itemAnimations[index] && !itemAnimations[index].animationStarted) {
      const animationDelay = index * 100;
      
      Animated.parallel([
        Animated.timing(itemAnimations[index].opacity, {
          toValue: 1,
          duration: 400,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnimations[index].translateY, {
          toValue: 0,
          duration: 400,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      ]).start();
      
      itemAnimations[index].animationStarted = true;
    }
  };
  
  // Start all animations when component mounts
  useEffect(() => {
    if (scans.length > 0 && !loading && !refreshing) {
      scans.forEach((_, index) => {
        startItemAnimation(index);
      });
    }
  }, [loading, refreshing, scans]);
  
  const renderItem = ({ item, index }: { item: ScanItem, index: number }) => {
    const detectedClass =
      item.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class ||
      "Unknown Item";
    
    const confidence = getConfidence(item);
    const confidencePercentage = confidence ? `${Math.round(confidence * 100)}%` : null;
    const estimatedPrice = getEstimatedPrice(item);

    return (
      <Animated.View
        style={[
          { 
            opacity: itemAnimations[index]?.opacity, 
            transform: [{ translateY: itemAnimations[index]?.translateY }] 
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => fetchMetadata(detectedClass, item.image_url, item)}
          style={styles.card}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.image} 
              resizeMode="cover"
            />
            {confidencePercentage && (
              <BlurView intensity={70} tint="dark" style={styles.confidenceTag}>
                <Text style={styles.confidenceText}>{confidencePercentage}</Text>
              </BlurView>
            )}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              {detectedClass}
            </Text>
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
              {estimatedPrice && (
                <Text style={styles.priceTag}>{estimatedPrice}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Header animation - fade and blur on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const renderAnimatedHeader = () => (
    <Animated.View 
      style={[
        styles.animatedHeaderContainer,
        {
          transform: [{ translateY: headerTranslate }],
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.blurBackground,
          { opacity: headerOpacity }
        ]}
      >
        <BlurView intensity={90} tint="light" style={styles.blurView} />
      </Animated.View>
      
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor.primary} />
        </TouchableOpacity>
        <Animated.Text 
          style={[
            styles.navTitle,
            {
              transform: [{ scale: titleScale }]
            }
          ]}
        >
          My Collection
        </Animated.Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={22} color={textColor.primary} />
        </TouchableOpacity>
      </View>
      
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.header}>

      
      {/* <Text style={styles.headerTitle}>Your Collection</Text> */}
      {/* <Text style={styles.headerSubtitle}>
        {scans.length} {scans.length === 1 ? 'item' : 'items'} in your collection
      </Text> */}
      
      {/* Collection Summary Cards */}
      <View style={styles.summaryCardsContainer}>
          <View style={styles.divider} />
        
        <View style={[styles.summaryCard, { backgroundColor: COLORS.accent1 + '50' }]}>
          <View style={styles.cardContentRow}>
           
            <View>
              <Text style={styles.summaryTitle}>{scans.length}</Text>
              <Text style={styles.summaryText}>Total Items</Text>
            </View>
            
          </View>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: COLORS.primary + '30' }]}>
          <View style={styles.cardContentRow}>
            <View>
              <Text style={styles.summaryTitle}>{scans.filter(scan => formatDate(scan.created_at) === 'Today').length}</Text>
              <Text style={styles.summaryText}>Today</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>All Items</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateImageContainer}>
        <MaterialCommunityIcons name="image-search-outline" size={90} color={COLORS.accent1} />
        <View style={styles.emptyStateDecorativeCircle} />
      </View>
      <Text style={styles.emptyStateTitle}>No Scans Yet</Text>
      <Text style={styles.emptyStateText}>
        Your scanned items will appear here. Start by scanning an item from the camera tab.
      </Text>
      <TouchableOpacity style={styles.emptyStateButton}>
        <Text style={styles.emptyStateButtonText}>Scan Item</Text>
      </TouchableOpacity>
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
      
      {/* Animated Header */}
      {renderAnimatedHeader()}

      {emptyState ? (
        renderEmptyState()
      ) : (
        <Animated.FlatList
          data={scans}
          keyExtractor={(item) => item.scan_id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={renderHeader}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
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
    padding: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.primaryBackground,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  animatedHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurView: {
    flex: 1,
  },
  navBar: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: textColor.primary,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  placeholderButton: {
    width: 40,
  },
  header: {
    paddingVertical: 10,
    paddingTop: 30, 
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: textColor.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: textColor.secondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: textColor.primary,
    marginTop: 8,
    marginBottom: 8,
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent1 + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: textColor.primary,
  },
  summaryText: {
    fontSize: 14,
    color: textColor.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 10,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  confidenceTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardFooter: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: textColor.primary,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  cardDate: {
    fontSize: 13,
    color: textColor.secondary,
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '600',
    color: "fff",
    backgroundColor: COLORS.accent1 + '50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 60, // Extra padding to account for fixed header
  },
  emptyStateImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  emptyStateDecorativeCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.accent1 + '10',
    zIndex: -1,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: textColor.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: textColor.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: COLORS.accent1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.accent1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});