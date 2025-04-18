// app/ScanResult.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";

const { width } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function ScanResult() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState("details");
  
  const {
    imageUri,
    itemName,
    itemId,
    material,
    era,
    rewindPrice,
    style,
    culture,
    designer,
    manufacturer,
    model_number,
    country_of_origin,
    provenance_date,
    condition,
    dimensions,
    location,
    source_url,
    origin_notes,
    condition_notes,
    originality,
    provenance_notes,
    pricing_notes,
    owner_notes,
    materials,
    scanId,
  } = useLocalSearchParams();

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const DetailItem = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View style={styles.detailItem}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  };

 // Modified renderActionButtons function to use a SectionCard format
const renderActionButtons = () => {
  const price = rewindPrice 
    ? `$${Number(rewindPrice).toLocaleString()}` 
    : "Price on request";
  
  return (
    <View style={styles.actionButtonsContainer}>
      <SectionCard title="Estimated Price">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/screens/source",
              params: { itemName }
            })
          }
        >
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>{price}</Text>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.accent1} style={styles.infoIcon} />
          </View>
        </TouchableOpacity>
      </SectionCard>
    </View>
  );
};

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "details" && styles.activeTab]} 
          onPress={() => setActiveTab("details")}
        >
          <Text style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "specifications" && styles.activeTab]} 
          onPress={() => setActiveTab("specifications")}
        >
          <Text style={[styles.tabText, activeTab === "specifications" && styles.activeTabText]}>Specifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "provenance" && styles.activeTab]} 
          onPress={() => setActiveTab("provenance")}
        >
          <Text style={[styles.tabText, activeTab === "provenance" && styles.activeTabText]}>Provenance</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <>
            <SectionCard title="Overview">
              {condition && (
                <View style={styles.overviewItem}>
                  <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.overviewText}>Condition: {condition}</Text>
                </View>
              )}
              {era && (
                <View style={styles.overviewItem}>
                  <Ionicons name="time-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.overviewText}>Era: {era}</Text>
                </View>
              )}
              {Array.isArray(materials) || materials ? (
                <View style={styles.overviewItem}>
                  <Ionicons name="layers-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.overviewText}>
                    Materials: {Array.isArray(materials) ? materials.join(", ") : materials}
                  </Text>
                </View>
              ) : null}
            </SectionCard>

            {condition_notes ? (
              <SectionCard title="Condition Notes">
                <Text style={styles.notesText}>{condition_notes}</Text>
              </SectionCard>
            ) : null}
            
            {(designer || manufacturer) && (
              <SectionCard title="Creator">
                {designer && <DetailItem label="Designer" value={designer as string} />}
                {manufacturer && <DetailItem label="Manufacturer" value={manufacturer as string} />}
              </SectionCard>
            )}
          </>
        );
      
      case "specifications":
        return (
          <>
            <SectionCard title="Dimensions">
              <View style={styles.dimensionsContainer}>
                {typeof dimensions === "string" ? (
                  <View style={styles.dimensionRow}>
                    {dimensions.split(",")[0] && (
                      <View style={styles.dimensionBox}>
                        <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                        <Text style={styles.dimensionValue}>{dimensions.split(",")[0]}</Text>
                        <Text style={styles.dimensionLabel}>Height</Text>
                      </View>
                    )}
                    
                    {dimensions.split(",")[1] && (
                      <View style={styles.dimensionBox}>
                        <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                        <Text style={styles.dimensionValue}>{dimensions.split(",")[1]}</Text>
                        <Text style={styles.dimensionLabel}>Width</Text>
                      </View>
                    )}
                    
                    {dimensions.split(",")[2] && (
                      <View style={styles.dimensionBox}>
                        <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                        <Text style={styles.dimensionValue}>{dimensions.split(",")[2]}</Text>
                        <Text style={styles.dimensionLabel}>Depth</Text>
                      </View>
                    )}
                  </View>
                ) : Array.isArray(dimensions) ? (
                  <View style={styles.dimensionRow}>
                    {dimensions[0] && (
                      <View style={styles.dimensionBox}>
                        <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                        <Text style={styles.dimensionValue}>{dimensions[0]}</Text>
                        <Text style={styles.dimensionLabel}>Height</Text>
                      </View>
                    )}
                    
                    {dimensions[1] && (
                      <View style={styles.dimensionBox}>
                        <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                        <Text style={styles.dimensionValue}>{dimensions[1]}</Text>
                        <Text style={styles.dimensionLabel}>Width</Text>
                      </View>
                    )}
                    
                    {dimensions[2] && (
                      <View style={styles.dimensionBox}>
                        <Ionicons name="resize-outline" size={22} color={COLORS.accent1} />
                        <Text style={styles.dimensionValue}>{dimensions[2]}</Text>
                        <Text style={styles.dimensionLabel}>Depth</Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            </SectionCard>
            
            <SectionCard title="Product Details">
              {model_number && <DetailItem label="Model Number" value={model_number as string} />}
              {country_of_origin && <DetailItem label="Country of Origin" value={country_of_origin as string} />}
              {style && <DetailItem label="Style" value={style as string} />}
              {culture && <DetailItem label="Culture" value={culture as string} />}
              {originality && <DetailItem label="Originality" value={originality as string} />}
            </SectionCard>
          </>
        );
      
      case "provenance":
        return (
          <>
            {provenance_date && (
              <SectionCard title="Date">
                <DetailItem label="Provenance Date" value={provenance_date as string} />
              </SectionCard>
            )}
            
            {provenance_notes && (
              <SectionCard title="Provenance Notes">
                <Text style={styles.notesText}>{provenance_notes}</Text>
              </SectionCard>
            )}
            
            {origin_notes && (
              <SectionCard title="Origin Notes">
                <Text style={styles.notesText}>{origin_notes}</Text>
              </SectionCard>
            )}
            
            {pricing_notes && (
              <SectionCard title="Pricing Notes">
                <Text style={styles.notesText}>{pricing_notes}</Text>
              </SectionCard>
            )}
            
            {owner_notes && (
              <SectionCard title="Owner Notes">
                <Text style={styles.notesText}>{owner_notes}</Text>
              </SectionCard>
            )}
          </>
        );
      
      default:
        return null;
    }
  };
  
  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.sectionBox}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image 
          source={{ uri: imageUri as string }} 
          style={[styles.headerImage, { opacity: imageOpacity }]} 
        />
        <Animated.View style={[styles.headerOverlay, { opacity: imageOpacity }]} />
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Animated.Text 
            style={[styles.headerTitle, { opacity: headerTitleOpacity }]} 
            numberOfLines={1}
          >
            {itemName || "Untitled Item"}
          </Animated.Text>
          <TouchableOpacity 
            style={styles.aiQuickButton}
            onPress={() =>
              router.push({
                pathname: "/screens/analysis",
                params: { 
                  scanId,
                  itemName,
                  imageUrl: imageUri
                }
              })
            }
          >
            <Ionicons name="analytics" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Animated.ScrollView
        contentContainerStyle={styles.contentContainer}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Content starts after the header height */}
        <View style={{ marginTop: 20 }}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {itemName || "Untitled Item"}
          </Text>
          
          {/* Action Buttons */}
          {renderActionButtons()}
          
          {/* Tabs Navigation */}
          {renderTabs()}
          
          {/* Tab Content */}
          {renderTabContent()}
        </View>
        
        {/* Bottom Buttons */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity 
            style={styles.aiFullButton}
            onPress={() =>
              router.push({
                pathname: "/screens/analysis",
                params: { 
                  scanId,
                  itemName,
                  imageUrl: imageUri
                }
              })
            }
          >
            <Ionicons name="analytics" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.aiFullButtonText}>Full AI Analysis</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backToScannerBtn} onPress={() => router.back()}>
            <Ionicons name="scan-outline" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.backToScannerText}>Back to Scanner</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primaryBackground,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: HEADER_MAX_HEIGHT,
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiQuickButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    paddingTop: HEADER_MAX_HEIGHT,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: textColor.primary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  // Additional styles to add
actionButtonsContainer: {
  marginBottom: 20,
},
priceContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
priceValue: {
  fontSize: 24,
  fontWeight: 'bold',
  color: textColor.primary,
  textAlign: 'center',
},

  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14, // Slightly taller
    borderRadius: 10,
    width: '90%', // Wider button
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, // Slightly more visible shadow
    shadowRadius: 4,
    elevation: 4, // More elevation on Android
  },
  priceText: {
    color: textColor.primary,
    fontSize: 20, // Larger font size
    fontWeight: 'bold',
  },
  aiAnalysisButton: {
    backgroundColor: COLORS.accent1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aiAnalysisButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  aiAnalysisText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoIcon: {
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: textColor.secondary,
  },
  activeTabText: {
    color: textColor.primary,
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColor.primary,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailItem: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: textColor.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: textColor.primary,
    lineHeight: 22,
  },
  dimensionsContainer: {
    marginVertical: 6,
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  dimensionBox: {
    alignItems: 'center',
    margin: 10,
    minWidth: 80,
  },
  dimensionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: textColor.primary,
    marginVertical: 6,
  },
  dimensionLabel: {
    fontSize: 12,
    color: textColor.secondary,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewText: {
    fontSize: 15,
    color: textColor.primary,
    marginLeft: 12,
    flex: 1,
  },
  notesText: {
    fontSize: 15,
    color: textColor.primary,
    lineHeight: 22,
  },
  bottomButtonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  aiFullButton: {
    backgroundColor: COLORS.accent1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backToScannerBtn: {
    backgroundColor: "#001F2D",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  aiFullButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backToScannerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});