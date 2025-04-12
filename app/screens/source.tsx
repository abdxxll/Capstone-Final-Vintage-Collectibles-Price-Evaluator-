import { EvilIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 100 : 80;

export default function PriceSources() {
  const { itemName } = useLocalSearchParams();
  const router = useRouter();
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values for header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerElevation = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 5],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (itemName) resolveItemAndFetchSources(itemName as string);
  }, [itemName]);

  const resolveItemAndFetchSources = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: item, error: itemError } = await supabase
        .from("rewind_core_items_v2")
        .select("item_id")
        .ilike("name", `%${name}%`)
        .limit(1)
        .single();

      if (itemError || !item) {
        console.warn("No matching item found for name:", name);
        setError("No matching item found. Please try a different search.");
        setLoading(false);
        return;
      }

      const { data: sourcesData, error: metadataError } = await supabase
        .from("rewind_item_metadata")
        .select("id, metadata, source_name") 
        .eq("item_id", item.item_id)
        .order("created_at", { ascending: false });

      if (metadataError) {
        console.error("Failed to fetch sources:", metadataError);
        setError("Failed to fetch price sources. Please try again later.");
      } else {
        setSources(sourcesData || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  type SourceCardProps = {
    metadata: any;
    source_name?: string;
    index: number;
  };
  
  const SourceCard = ({ metadata, source_name, index }: SourceCardProps) => {
    const itemName = metadata?.basic_info?.name || "Unnamed Item";
    const price = metadata?.pricing?.price || null;
    const url = metadata?.source?.url;
    const location = metadata?.location?.located_in || "Unknown";
    const date = metadata?.source?.date_added 
      ? new Date(metadata.source.date_added).toLocaleDateString()
      : "Unknown date";
    
    // Calculate animation delay based on index
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedTranslateY = useRef(new Animated.Value(20)).current;
    
    useEffect(() => {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 0,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);
  
    return (
      <Animated.View
        style={{
          opacity: animatedOpacity,
          transform: [{ translateY: animatedTranslateY }],
        }}
      >
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => setSelectedSource(metadata)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titlePriceContainer}>
              <Text style={styles.itemName} numberOfLines={2}>{itemName}</Text>
              {price && (
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>${Number(price).toLocaleString()}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.sourceInfoContainer}>
              <View style={styles.sourceTagContainer}>
                <Text style={styles.sourceTag}>{source_name || "Unknown Source"}</Text>
              </View>
              
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={textColor.secondary} />
                <Text style={styles.dateText}>{date}</Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <EvilIcons name="location" size={20} color={textColor.primary} />
              <Text style={styles.locationText}>{location?.replace(", United States", "")}</Text>
            </View>
          </View>
          
          {url && (
  <View style={styles.viewSourceContainer}>
    <TouchableOpacity 
      style={styles.viewSourceButton}
      onPress={() => {
        if (url) {
          Linking.openURL(url).catch(err => {
            console.error("Failed to open URL:", err);
            Alert.alert("Error", "Couldn't open the link. Please try again later.");
          });
        }
      }}
    >
      <Ionicons name="open-outline" size={16} color={textColor.primary} />
      <Text style={styles.viewSourceText}>View Original Source</Text>
    </TouchableOpacity>
  </View>
)}
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
 // Component for detailed source view matching the layout of ScanResult
 const SourceDetailView = () => {
  if (!selectedSource) return null;

  const itemName = selectedSource?.basic_info?.name || "Unnamed Item";
  const price = selectedSource?.pricing?.price || null;
  const sourceUrl = selectedSource?.source?.url || null;
  const sourceDate = selectedSource?.source?.date_added 
    ? new Date(selectedSource.source.date_added).toLocaleDateString()
    : null;
  const sourceName = selectedSource?.source?.name || "Unknown Source";
  
  // Image URI - if available
  const imageUri = selectedSource?.basic_info?.image_url || null;
  
  // Helper function for rendering detail items
  const DetailItem = ({ label, value }: { label: string; value?: any }) => {
    if (!value) return null;
    
    const displayValue = typeof value === 'object' && value !== null
      ? (value.url || JSON.stringify(value))
      : Array.isArray(value)
        ? value.join(", ")
        : value.toString();
    
    return (
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{displayValue}</Text>
      </View>
    );
  };
  
  // Create normalized data from the source metadata for more readable display
  const getNormalizedData = () => {
    const data: Record<string, any> = {};
    
    // Basic info
    if (selectedSource.basic_info) {
      data.basicInfo = {
        name: selectedSource.basic_info.name,
        sku: selectedSource.basic_info.sku,
        description: selectedSource.basic_info.description,
      };
    }
    
    // Pricing
    if (selectedSource.pricing) {
      data.pricing = {
        price: selectedSource.pricing.price,
        currency: selectedSource.pricing.currency,
        originalPrice: selectedSource.pricing.original_price,
        priceHistory: selectedSource.pricing.price_history,
      };
    }
    
    // Materials
    if (selectedSource.materials) {
      data.materials = {
        materials: Array.isArray(selectedSource.materials) 
          ? selectedSource.materials 
          : [selectedSource.materials],
      };
    }
    
    // Condition
    if (selectedSource.condition) {
      data.condition = {
        condition: selectedSource.condition.condition,
        conditionNotes: selectedSource.condition.notes,
      };
    }
    
    // Provenance
    if (selectedSource.provenance) {
      data.provenance = {
        date: selectedSource.provenance.date,
        period: selectedSource.provenance.period,
        era: selectedSource.provenance.era,
        culture: selectedSource.provenance.culture,
        notes: selectedSource.provenance.notes,
      };
    }
    
    // Dimensions
    if (selectedSource.dimensions) {
      data.dimensions = {
        height: selectedSource.dimensions.height,
        width: selectedSource.dimensions.width,
        depth: selectedSource.dimensions.depth,
        diameter: selectedSource.dimensions.diameter,
        weight: selectedSource.dimensions.weight,
      };
    }
    
    // Manufacturer
    if (selectedSource.manufacturer) {
      data.manufacturer = {
        name: selectedSource.manufacturer.name,
        designer: selectedSource.manufacturer.designer,
        modelNumber: selectedSource.manufacturer.model_number,
        countryOfOrigin: selectedSource.manufacturer.country_of_origin,
      };
    }
    
    // Source
    if (selectedSource.source) {
      data.source = {
        name: selectedSource.source.name,
        url: selectedSource.source.url,
        dateAdded: selectedSource.source.date_added,
        location: selectedSource.source.location,
      };
    }
    
    // Location
    if (selectedSource.location) {
      data.location = {
        locatedIn: selectedSource.location.located_in,
        city: selectedSource.location.city,
        state: selectedSource.location.state,
        country: selectedSource.location.country,
      };
    }
    
    return data;
  };
  
  const normalizedData = getNormalizedData();
  
  return (
    <Modal visible transparent animationType="slide">
      <StatusBar barStyle="dark-content" />
      <View style={styles.detailContainer}>
        {/* Top Navigation Bar */}
        <View style={styles.detailNavBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedSource(null)}>
            <Ionicons name="arrow-back" size={24} color={textColor.primary} />
          </TouchableOpacity>
          <Text style={styles.detailNavTitle} numberOfLines={1}>Source Details</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView 
          style={styles.detailScrollView}
          contentContainerStyle={styles.detailContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Image (if available) */}
          {imageUri && (
            <View style={styles.detailImageContainer}>
              <Image source={{ uri: imageUri }} style={styles.detailImage} />
            </View>
          )}
          
          {/* Title */}
          <Text style={styles.detailTitle} numberOfLines={2}>
            {itemName}
          </Text>
          
          {/* Price */}
          {price && (
            <View style={styles.detailPriceButton}>
              <Text style={styles.detailPriceText}>
                ${Number(price).toLocaleString()}
              </Text>
            </View>
          )}
          
          {/* Source Info */}
          <View style={styles.detailSourceInfoContainer}>
            <View style={styles.detailSourceBadge}>
              <MaterialCommunityIcons name="store" size={16} color="#2E2E2E" />
              <Text style={styles.detailSourceName}>{sourceName}</Text>
            </View>
            
            {sourceDate && (
              <View style={styles.detailSourceDateContainer}>
                <Ionicons name="calendar-outline" size={16} color={textColor.secondary} />
                <Text style={styles.detailSourceDate}>{sourceDate}</Text>
              </View>
            )}
          </View>
          
          {/* Sections */}
          {/* Basic Info */}
          {normalizedData.basicInfo && (
            <SectionBox title="Description">
              {normalizedData.basicInfo.description && (
                <Text style={styles.descriptionText}>
                  {normalizedData.basicInfo.description}
                </Text>
              )}
              {normalizedData.basicInfo.sku && (
                <DetailItem label="SKU" value={normalizedData.basicInfo.sku} />
              )}
            </SectionBox>
          )}
          
          {/* Condition */}
          {normalizedData.condition && Object.values(normalizedData.condition).some(Boolean) && (
            <SectionBox title="Condition">
              {normalizedData.condition.condition && (
                <DetailItem label="Condition" value={normalizedData.condition.condition} />
              )}
              {normalizedData.condition.conditionNotes && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.descriptionText}>{normalizedData.condition.conditionNotes}</Text>
                </View>
              )}
            </SectionBox>
          )}
          
          {/* Materials */}
          {normalizedData.materials && normalizedData.materials.materials && (
            <SectionBox title="Materials">
              <DetailItem 
                label="Materials" 
                value={normalizedData.materials.materials} 
              />
            </SectionBox>
          )}
          
          {/* Provenance */}
          {normalizedData.provenance && Object.values(normalizedData.provenance).some(Boolean) && (
            <SectionBox title="Provenance">
              {normalizedData.provenance.date && (
                <DetailItem label="Date" value={normalizedData.provenance.date} />
              )}
              {normalizedData.provenance.period && (
                <DetailItem label="Period" value={normalizedData.provenance.period} />
              )}
              {normalizedData.provenance.era && (
                <DetailItem label="Era" value={normalizedData.provenance.era} />
              )}
              {normalizedData.provenance.culture && (
                <DetailItem label="Culture" value={normalizedData.provenance.culture} />
              )}
              {normalizedData.provenance.notes && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.descriptionText}>{normalizedData.provenance.notes}</Text>
                </View>
              )}
            </SectionBox>
          )}
          
          {/* Dimensions */}
          {normalizedData.dimensions && Object.values(normalizedData.dimensions).some(Boolean) && (
            <SectionBox title="Dimensions">
              <View style={styles.dimensionsContainer}>
                {normalizedData.dimensions.height && (
                  <View style={styles.dimensionBox}>
                    <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                    <Text style={styles.dimensionValue}>{normalizedData.dimensions.height}</Text>
                    <Text style={styles.dimensionLabel}>Height</Text>
                  </View>
                )}
                
                {normalizedData.dimensions.width && (
                  <View style={styles.dimensionBox}>
                    <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                    <Text style={styles.dimensionValue}>{normalizedData.dimensions.width}</Text>
                    <Text style={styles.dimensionLabel}>Width</Text>
                  </View>
                )}
                
                {normalizedData.dimensions.depth && (
                  <View style={styles.dimensionBox}>
                    <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                    <Text style={styles.dimensionValue}>{normalizedData.dimensions.depth}</Text>
                    <Text style={styles.dimensionLabel}>Depth</Text>
                  </View>
                )}
                
                {normalizedData.dimensions.diameter && (
                  <View style={styles.dimensionBox}>
                    <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                    <Text style={styles.dimensionValue}>{normalizedData.dimensions.diameter}</Text>
                    <Text style={styles.dimensionLabel}>Diameter</Text>
                  </View>
                )}
              </View>
              
              {normalizedData.dimensions.weight && (
                <DetailItem label="Weight" value={normalizedData.dimensions.weight} />
              )}
            </SectionBox>
          )}
          
          {/* Manufacturer */}
          {normalizedData.manufacturer && Object.values(normalizedData.manufacturer).some(Boolean) && (
            <SectionBox title="Manufacturer & Design">
              {normalizedData.manufacturer.name && (
                <DetailItem label="Manufacturer" value={normalizedData.manufacturer.name} />
              )}
              {normalizedData.manufacturer.designer && (
                <DetailItem label="Designer" value={normalizedData.manufacturer.designer} />
              )}
              {normalizedData.manufacturer.modelNumber && (
                <DetailItem label="Model Number" value={normalizedData.manufacturer.modelNumber} />
              )}
              {normalizedData.manufacturer.countryOfOrigin && (
                <DetailItem label="Country of Origin" value={normalizedData.manufacturer.countryOfOrigin} />
              )}
            </SectionBox>
          )}
          
          {/* Location */}
          {normalizedData.location && Object.values(normalizedData.location).some(Boolean) && (
            <SectionBox title="Location">
              {normalizedData.location.locatedIn && (
                <DetailItem label="Located In" value={normalizedData.location.locatedIn} />
              )}
              {normalizedData.location.city && (
                <DetailItem label="City" value={normalizedData.location.city} />
              )}
              {normalizedData.location.state && (
                <DetailItem label="State" value={normalizedData.location.state} />
              )}
              {normalizedData.location.country && (
                <DetailItem label="Country" value={normalizedData.location.country} />
              )}
            </SectionBox>
          )}
          
          {/* Visit Original Source Button */}
          {sourceUrl && (
            <TouchableOpacity style={styles.visitSourceButton}>
              <Text style={styles.visitSourceText}>Visit Original Source</Text>
              <Ionicons name="open-outline" size={18} color="white" />
            </TouchableOpacity>
          )}
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.backToSourcesButton}
            onPress={() => setSelectedSource(null)}
          >
            <Text style={styles.backToSourcesText}>Back to Sources</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Section Box Component
const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const renderMetadataModal = () => {
  return <SourceDetailView />;
};
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="file-search-outline" size={70} color={textColor.secondary} />
      <Text style={styles.emptyTitle}>No Sources Found</Text>
      <Text style={styles.emptyText}>We couldn't find any price sources for "{itemName}".</Text>
      <TouchableOpacity 
        style={styles.backToScanButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backToScanText}>Back to Item</Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.accent1} />
      <Text style={styles.loadingText}>Finding price sources...</Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="alert-circle-outline" size={70} color={textColor.secondary} />
      <Text style={styles.emptyTitle}>Error</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <TouchableOpacity 
        style={styles.backToScanButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backToScanText}>Back to Item</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Animated Header */}
      <Animated.View style={[
        styles.header, 
        { 
          opacity: headerOpacity,
          elevation: headerElevation,
          shadowOpacity: headerElevation,
        }
      ]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Price Sources</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {itemName || "Item"}
          </Text>
        </View>
      </Animated.View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {sources.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <View style={styles.sourcesHeader}>
                <Text style={styles.sourcesCount}>
                  {sources.length} {sources.length === 1 ? 'Source' : 'Sources'} Found
                </Text>
              </View>
              
              {sources.map((s, index) => (
                <SourceCard 
                  key={s.id} 
                  metadata={s.metadata} 
                  source_name={s.source_name} 
                  index={index}
                />
              ))}
            </>
          )}
        </Animated.ScrollView>
      )}

      {renderMetadataModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: COLORS.primaryBackground,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: textColor.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: textColor.secondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sourcesHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourcesCount: {
    fontSize: 16,
    color: textColor.secondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: textColor.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: textColor.secondary,
    marginBottom: 30,
  },
  backToScanButton: {
    backgroundColor: COLORS.accent1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backToScanText: {
    fontSize: 16,
    color: textColor.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: textColor.secondary,
    marginTop: 20,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titlePriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: textColor.primary,
  },
  priceContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sourceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sourceTagContainer: {
    backgroundColor: COLORS.accent1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sourceTag: {
    fontSize: 13,
    color: "#2E2E2E",
    fontWeight: "600",
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 13,
    color: textColor.secondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: textColor.primary,
    fontWeight: '500',
  },
  viewSourceContainer: {
    marginTop: 8, 
  },
  viewSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 8,
  },
  viewSourceText: {
    fontSize: 14,
    color: textColor.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "90%",
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: textColor.primary,
    flex: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: Platform.OS === 'ios' ? '75%' : '70%',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: textColor.primary,
    textTransform: "capitalize",
  },
  detailRow: {
    marginBottom: 12,
  },
  key: {
    fontSize: 14,
    color: textColor.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: textColor.primary,
    fontWeight: '500',
  },
  closeBtn: {
    backgroundColor: COLORS.accent1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    margin: 16,
  },
  closeBtnText: {
    fontWeight: "700",
    fontSize: 16,
    color: textColor.primary,
  },
  // Detail View Styles
detailContainer: {
  flex: 1,
  backgroundColor: COLORS.primaryBackground,
},
detailNavBar: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: Platform.OS === "ios" ? 50 : 30,
  paddingBottom: 10,
  paddingHorizontal: 16,
  backgroundColor: COLORS.primaryBackground,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(0,0,0,0.05)',
},
detailNavTitle: {
  fontSize: 18,
  fontWeight: "600",
  color: textColor.primary,
  textAlign: "center",
},
detailScrollView: {
  flex: 1,
  backgroundColor: COLORS.primaryBackground,
},
detailContentContainer: {
  paddingBottom: 40,
  paddingHorizontal: 16,
},
detailImageContainer: {
  width: "100%",
  height: 275,
  marginVertical: 16,
  borderRadius: 12,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
},
detailImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},
detailTitle: {
  fontSize: 24,
  fontWeight: "700",
  color: textColor.primary,
  textAlign: "center",
  marginTop: 8,
  marginBottom: 16,
  paddingHorizontal: 10,
},
detailPriceButton: {
  backgroundColor: COLORS.accent1,
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 12,
  marginBottom: 20,
  alignSelf: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
detailPriceText: {
  fontSize: 22,
  fontWeight: "700",
  color: textColor.primary,
},
detailSourceInfoContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 24,
  gap: 16,
  flexWrap: "wrap",
},
detailSourceBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: COLORS.accent1,
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 8,
  gap: 8,
},
detailSourceName: {
  fontSize: 14,
  fontWeight: "600",
  color: "#2E2E2E",
},
detailSourceDateContainer: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},
detailSourceDate: {
  fontSize: 14,
  color: textColor.secondary,
},
detailItem: {
  marginBottom: 14,
},
detailLabel: {
  fontSize: 13,
  fontWeight: "500",
  color: textColor.secondary,
  marginBottom: 4,
},
detailValue: {
  fontSize: 16,
  color: textColor.primary,
  lineHeight: 22,
},
descriptionText: {
  fontSize: 15,
  color: textColor.primary,
  lineHeight: 22,
},
dimensionsContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-around",
  marginVertical: 6,
},
dimensionBox: {
  alignItems: "center",
  margin: 10,
  minWidth: 80,
},
dimensionValue: {
  fontSize: 16,
  fontWeight: "600",
  color: textColor.primary,
  marginVertical: 6,
},
dimensionLabel: {
  fontSize: 12,
  color: textColor.secondary,
},
visitSourceButton: {
  backgroundColor: "#001F2D",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 14,
  borderRadius: 12,
  marginBottom: 16,
  gap: 8,
},
visitSourceText: {
  fontSize: 16,
  fontWeight: "600",
  color: "white",
},
backToSourcesButton: {
  backgroundColor: COLORS.accent1,
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
},
backToSourcesText: {
  fontSize: 16,
  fontWeight: "700",
  color: textColor.primary,
},
});