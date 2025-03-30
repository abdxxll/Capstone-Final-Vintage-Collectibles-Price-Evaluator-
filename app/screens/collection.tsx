import { InsightCard } from "@/app/assets/components/InsightCard";
import AntDesign from '@expo/vector-icons/AntDesign';
import { BlurView } from "expo-blur"; // You'll need to install this package
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "../../styles/theme";

// Enhanced Icon Components with smoother appearance
const IconBack = ({ size = 24, color = COLORS.charcoalBrown }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{
      width: size * 0.4,
      height: size * 0.4,
      borderLeftWidth: 2.5,
      borderBottomWidth: 2.5,
      borderColor: color,
      transform: [{ rotate: '45deg' }],
    }} />
  </View>
);

const IconSearch = ({ size = 24, color = COLORS.charcoalBrown }) => (
  <View style={{ width: size, height: size }}>
    <View style={{
      width: size * 0.7,
      height: size * 0.7,
      borderWidth: 2.5,
      borderColor: color,
      borderRadius: size * 0.5,
    }} />
    <View style={{
      position: 'absolute',
      width: size * 0.4,
      height: 2.5,
      backgroundColor: color,
      bottom: 0,
      right: 0,
      transform: [{ rotate: '45deg' }, { translateX: -size * 0.1 }]
    }} />
  </View>
);

const IconFilter = ({ size = 24, color = COLORS.charcoalBrown }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.8, height: 2.5, backgroundColor: color, marginBottom: size * 0.2 }} />
    <View style={{ width: size * 0.6, height: 2.5, backgroundColor: color, marginBottom: size * 0.2 }} />
    <View style={{ width: size * 0.4, height: 2.5, backgroundColor: color }} />
  </View>
);

// Enhanced Detail Item component with better spacing and typography
const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const CollectionScreen = () => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<typeof collectionItems[number] | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  
  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });
  
  // Sample collection data
  const collectionItems = [
    {
      id: 1,
      title: "Rolex 6239 Daytona Stainless Steel Watch",
      price: "$63,600",
      description: "A classic Rolex timepiece with chronograph function. Part of the iconic Daytona series, featuring a stainless steel case and bracelet with a black dial.",
      manufacturer: "Rolex",
      designer: "Hans Wilsdorf",
      dimensions: "40mm case",
      style: "Luxury Watch",
      materials: "Stainless Steel",
      place_of_origin: "Switzerland",
      period: "Modern",
      date_of_manufacture: "1969",
      condition: "Excellent",
      seller_location: "New York, USA",
      reference_number: "6239",
      category: "Watches",
      acquisition_date: "Dec 10, 2023",
      link: "https://example.com/rolex",
      date: "Mar 5, 2025",
      image: require("../assets/images/vintage_watch_test.webp"),
      // New fields for price validation and expert documentation
      price_sources: [
        { source: "Christie's Auction House", price: "$64,500", location: "New York, USA", date: "Jan 2025" },
        { source: "Phillips Watches", price: "$63,200", location: "Geneva, Switzerland", date: "Dec 2024" },
        { source: "Sotheby's", price: "$62,800", location: "London, UK", date: "Nov 2024" },
        { source: "WatchBox", price: "$61,500", location: "Hong Kong", date: "Jan 2025" }
      ],
      validation_documents: [
        { 
          type: "Certificate of Authenticity", 
          issuer: "Rolex Official", 
          date: "Nov 18, 2023",
          details: "Original Rolex certificate confirming authenticity and matching serial numbers",
          verified: true
        },
        { 
          type: "Expert Appraisal", 
          issuer: "John Anderson, Vintage Watch Expert",
          date: "Dec 2, 2023",
          details: "Detailed condition report and valuation by certified appraiser",
          verified: true
        },
        { 
          type: "Historical Documentation", 
          issuer: "Daytona Registry Database",
          date: "Nov 30, 2023",
          details: "Provenance and production history verification",
          verified: true
        }
      ]
    },
    {
      id: 2,
      title: "Hollóháza Porcelain Vase",
      price: "$560",
      description: "Elegant porcelain vase from the renowned Hungarian manufacturer featuring hand-painted floral designs and 24k gold trim accents.",
      manufacturer: "Hollóháza",
      designer: "Unknown",
      dimensions: "30cm height",
      style: "Mid-Century Modern",
      materials: "Porcelain",
      place_of_origin: "Hungary",
      period: "Mid-20th Century",
      date_of_manufacture: "1960s",
      condition: "Good",
      seller_location: "Budapest, Hungary",
      reference_number: "HZ-P42",
      category: "Art",
      acquisition_date: "Feb 3, 2024",
      link: "https://example.com/hollohaza-vase",
      date: "Feb 28, 2025",
      image: require("../assets/images/porcelein_vase.webp")
    },
    {
      id: 3,
      title: "Antique Brass Hunting Clock",
      price: "$645.32",
      description: "Intricate brass hunting clock with detailed engravings depicting woodland scenes. Features a manual wind mechanism and enamel face.",
      manufacturer: "Unknown",
      designer: "Unknown",
      dimensions: "15cm diameter",
      style: "Traditional",
      materials: "Brass",
      place_of_origin: "Germany",
      period: "20th Century",
      date_of_manufacture: "1930s",
      condition: "Fair",
      seller_location: "Berlin, Germany",
      reference_number: "ABC-123",
      category: "Clocks",
      acquisition_date: "Nov 15, 2023",
      link: "https://example.com/brass-clock",
      date: "Feb 25, 2025",
      image: require("../assets/images/antique_clock.webp")
    },
    {
      id: 4,
      title: "Modern Penedo Showcase Bar Cabinet",
      price: "$50,823.72",
      description: "Luxurious handcrafted bar cabinet featuring Patagonia stone and premium wood construction. Limited edition piece with custom interior lighting.",
      manufacturer: "Greenapple",
      designer: "Greenapple Design Team",
      dimensions: "180cm x 90cm x 60cm",
      style: "Mid-Century Modern",
      materials: "Patagonia Stone, Wood",
      place_of_origin: "Portugal",
      period: "Mid-Century Modern (In the Style Of)",
      date_of_manufacture: "2020",
      condition: "New",
      seller_location: "Lisbon, Portugal",
      reference_number: "GA-PBS-2020",
      category: "Furniture",
      acquisition_date: "Jan 21, 2024",
      link: "https://example.com/greenapple-cabinet",
      date: "Feb 20, 2025",
      image: require("../assets/images/display.webp")
    },
    {
      id: 5,
      title: "Sunburst Ceiling Light Fixture",
      price: "$3,259.35",
      description: "Elegant sunburst ceiling light fixture with gilt wrought iron design. Features 12 arms radiating from a central sphere with original wiring updated to modern standards.",
      manufacturer: "Unknown Spanish Artisan",
      designer: "Unknown",
      dimensions: "75cm diameter",
      style: "Mid-Century Modern",
      materials: "Gilt Wrought Iron",
      place_of_origin: "Spain",
      period: "Mid-Century Modern (Of the Period)",
      date_of_manufacture: "1950s",
      condition: "Good, restored",
      seller_location: "Barcelona, Spain",
      reference_number: "SLF-1950-ES",
      category: "Lighting",
      acquisition_date: "Mar 2, 2024",
      link: "https://example.com/sunburst-light",
      date: "Feb 20, 2025",
      image: require("../assets/images/sunburst_furniture.webp")
    },
    {
      id: 6,
      title: "Art Deco Silver Tea Set",
      price: "$2,850",
      description: "Complete five-piece silver-plated tea service with geometric patterns characteristic of the Art Deco period. Includes teapot, coffee pot, sugar bowl, creamer, and serving tray.",
      manufacturer: "Mappin & Webb",
      designer: "Unknown",
      dimensions: "Tray: 45cm x 30cm",
      style: "Art Deco",
      materials: "Silver-plate, Bakelite handles",
      place_of_origin: "United Kingdom",
      period: "1920s",
      date_of_manufacture: "1925",
      condition: "Very Good",
      seller_location: "London, UK",
      reference_number: "MW-TS-1925",
      category: "Silver",
      acquisition_date: "Dec 5, 2023",
      link: "https://example.com/art-deco-tea-set",
      date: "Jan 15, 2025",
      image: require("../assets/images/porcelein_vase.webp")
    }
  ];

  const categories = ["All", "Watches", "Art", "Furniture", "Lighting", "Clocks", "Silver"];

  // Filter items based on active category and search query
  const filteredItems = collectionItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (searchQuery === "" || matchesSearch);
  });

  // Calculate collection stats
  const totalValue = collectionItems.reduce((sum, item) => sum + parseFloat(item.price.replace(/[$,]/g, '')), 0);
  const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue);
  const mostValuableCategory = () => {
    const categoryValues: { [key: string]: number } = {};
    collectionItems.forEach(item => {
      const price = parseFloat(item.price.replace(/[$,]/g, ''));
      categoryValues[item.category] = (categoryValues[item.category] || 0) + price;
    });
    
    let maxCategory = '';
    let maxValue = 0;
    Object.entries(categoryValues).forEach(([category, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxCategory = category;
      }
    });
    
    return maxCategory;
  };

  // Function to render grid items
  const renderGridItem = ({ item }: { item: typeof collectionItems[number] }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedItem(item);
        setShowModal(true);
      }}
      style={styles.gridItem}
      activeOpacity={0.7}
    >
      <View style={styles.gridImageContainer}>
        <Image 
          source={item.image} 
          style={styles.gridImage} 
        />
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>{item.period}</Text>
        </View>
      </View>
      <View style={styles.gridItemContent}>
        <Text style={styles.gridItemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.gridItemInfo}>
          <Text style={styles.gridItemCategory}>{item.category}</Text>
          <Text style={styles.gridItemPrice}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Function to render list items
  const renderListItem = ({ item }: { item: typeof collectionItems[number] }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedItem(item);
        setShowModal(true);
      }}
      style={styles.listItem}
      activeOpacity={0.7}
    >
      <Image 
        source={item.image} 
        style={styles.listItemImage} 
      />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listItemCategory}>{item.category} • {item.period}</Text>
        <View style={styles.listItemFooter}>
          <Text style={styles.listItemPrice}>{item.price}</Text>
          <Text style={styles.listItemOrigin}>{item.place_of_origin}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.softIvory} />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconBack />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Collection</Text>
        <TouchableOpacity 
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          {viewMode === "grid" ? (
            <IconFilter size={22} color={COLORS.charcoalBrown} />
          ) : (
            <View style={styles.gridIcon}>
              <View style={styles.gridDot} />
              <View style={styles.gridDot} />
              <View style={styles.gridDot} />
              <View style={styles.gridDot} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Collection Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.scrollContainer}
      >
        {/* Collection Summary Cards */}
        <View className="flex-row flex-wrap justify-between px-5 mt-4">
      <View className="w-[48%]">
        <InsightCard 
          title="Total Items" 
          value={collectionItems.length}
          icon={<AntDesign name="inbox" size={20} color={COLORS.charcoalBrown} />}
          color={COLORS.burnishedGold}
        />
      </View>
      <View className="w-[48%]">
        <InsightCard 
          title="Total Value" 
          value={formattedValue}
          icon={<AntDesign name="wallet" size={20} color={COLORS.charcoalBrown} />}
          color={COLORS.burnishedGold}
        />
      </View>
      <View className="w-[48%]">
        <InsightCard 
          title="Categories" 
          value={categories.length - 1}
          icon={<AntDesign name="appstore1" size={20} color={COLORS.charcoalBrown} />}
          color={COLORS.burnishedGold}
        />
      </View>
      <View className="w-[48%]">
        <InsightCard 
          title="Top Category" 
          value={mostValuableCategory()}
          icon={<AntDesign name="star" size={20} color={COLORS.charcoalBrown} />}
          color={COLORS.burnishedGold}
        />
      </View>
    </View>
   
 

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSearch size={20} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              placeholder="Search collection..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setActiveCategory(category)}
              style={[
                styles.categoryButton,
                category === activeCategory && styles.activeCategoryButton
              ]}
            >
              <Text style={[
                styles.categoryButtonText,
                category === activeCategory && styles.activeCategoryButtonText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Collection Items */}
        {viewMode === "grid" ? (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No items found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different search or category
                </Text>
              </View>
            }
            renderItem={renderGridItem}
          />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No items found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different search or category
                </Text>
              </View>
            }
            renderItem={renderListItem}
          />
        )}
        
        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Add Item Button - Enhanced with gradient and shadow */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modal for Item Details - Enhanced with animations and better layout */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowModal(false);
          setTimeout(() => setSelectedItem(null), 300);
        }}
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            <BlurView intensity={Platform.OS === 'ios' ? 50 : 100} style={styles.blurBackground} tint="dark" />
            
            <View style={styles.modalContent}>
              {/* Header Image with Back Button */}
              <View style={styles.modalImageContainer}>
                <Image 
                  source={selectedItem.image} 
                  style={styles.modalImage} 
                />
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setShowModal(false);
                    setTimeout(() => setSelectedItem(null), 300);
                  }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                
                {/* Period badge */}
                <View style={styles.modalPeriodBadge}>
                  <Text style={styles.modalPeriodText}>{selectedItem.period}</Text>
                </View>
                
                {/* Price badge */}
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>{selectedItem.price}</Text>
                </View>
              </View>
              
              {/* Content */}
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                <Text style={styles.modalManufacturer}>{selectedItem.manufacturer}</Text>
                
                {/* Description */}
                <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                
                {/* Details Section */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  <View style={styles.detailsGrid}>
                    <DetailItem label="Category" value={selectedItem.category} />
                    <DetailItem label="Style" value={selectedItem.style} />
                    <DetailItem label="Materials" value={selectedItem.materials} />
                    <DetailItem label="Origin" value={selectedItem.place_of_origin} />
                    <DetailItem label="Made In" value={selectedItem.date_of_manufacture} />
                    <DetailItem label="Condition" value={selectedItem.condition} />
                    <DetailItem label="Dimensions" value={selectedItem.dimensions} />
                    <DetailItem label="Designer" value={selectedItem.designer} />
                  </View>
                </View>
                
                {/* Acquisition Section */}
                <View style={styles.acquisitionSection}>
                  <Text style={styles.sectionTitle}>Acquisition Info</Text>
                  <View style={styles.detailsGrid}>
                    <DetailItem label="Acquired On" value={selectedItem.acquisition_date} />
                    <DetailItem label="Seller Location" value={selectedItem.seller_location} />
                    <DetailItem label="Reference Number" value={selectedItem.reference_number} />
                    <DetailItem label="Scanned On" value={selectedItem.date} />
                  </View>
                </View>
                
                {/* Action Buttons - Added validation button */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => setShowValidationModal(true)}
                  >
                    <Text style={styles.secondaryButtonText}>View Authentication</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Edit Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Price Sources Modal */}
      <Modal
        visible={showPriceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriceModal(false)}
      >
        {selectedItem && (
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} 
              activeOpacity={1} 
              onPress={() => setShowPriceModal(false)} 
            />
            <View style={styles.priceSourcesModal}>
              <View style={styles.priceModalHeader}>
                <Text style={styles.priceModalTitle}>Price Valuation Sources</Text>
                <TouchableOpacity 
                  style={styles.priceModalCloseButton}
                  onPress={() => setShowPriceModal(false)}
                >
                  <Text style={{ fontSize: 22, color: 'rgba(255, 255, 255, 0.6)' }}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* Location filter */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by location:</Text>
                <TouchableOpacity 
                  style={styles.locationPicker}
                  onPress={() => {
                    // This would typically toggle a dropdown in a real app
                    // For simplicity, we'll just cycle through available locations
                    const locations = ['All Locations', ...new Set((selectedItem.price_sources ?? []).map(source => source.location))];
                    const currentIndex = locations.indexOf(selectedLocation);
                    const nextIndex = (currentIndex + 1) % locations.length;
                    setSelectedLocation(locations[nextIndex]);
                  }}
                >
                  <Text style={styles.locationText}>{selectedLocation}</Text>
                </TouchableOpacity>
              </View>
              
              {/* Price sources list */}
              <ScrollView style={{ maxHeight: 400 }}>
                {(selectedItem.price_sources ?? [])
                  .filter(source => selectedLocation === 'All Locations' || source.location === selectedLocation)
                  .map((source, index) => (
                    <View key={index} style={styles.priceSourceItem}>
                      <View style={styles.priceSourceInfo}>
                        <Text style={styles.priceSourceName}>{source.source}</Text>
                        <Text style={styles.priceSourceMeta}>
                          {source.location} • {source.date}
                        </Text>
                      </View>
                      <Text style={styles.priceSourceValue}>{source.price}</Text>
                    </View>
                  ))
                }
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Validation Documents Modal */}
      <Modal
        visible={showValidationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowValidationModal(false)}
      >
        {selectedItem && (
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} 
              activeOpacity={1} 
              onPress={() => setShowValidationModal(false)} 
            />
            <View style={styles.validationModal}>
              <View style={styles.validationHeader}>
                <Text style={styles.validationTitle}>Authentication Documents</Text>
                <TouchableOpacity 
                  onPress={() => setShowValidationModal(false)}
                >
                  <Text style={{ fontSize: 22, color: 'rgba(255, 255, 255, 0.6)' }}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={{ maxHeight: 500, paddingTop: 15 }}>
                {selectedItem.validation_documents?.map((doc, index) => (
                  <View key={index} style={styles.validationItem}>
                    <View style={styles.validationItemHeader}>
                      <Text style={styles.validationType}>{doc.type}</Text>
                      {doc.verified && (
                        <View style={styles.validationStatus}>
                          <View style={styles.verificationBadge}>
                            <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                          </View>
                          <Text style={styles.validationStatusText}>Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.validationIssuer}>{doc.issuer}</Text>
                    <Text style={styles.validationDate}>Issued: {doc.date}</Text>
                    <Text style={styles.validationDetails}>{doc.details}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.softIvory,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.softIvory,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.charcoalBrown,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  viewModeButton: {
    padding: 8,
  },
  gridIcon: {
    width: 22,
    height: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridDot: {
    width: 9,
    height: 9,
    backgroundColor: COLORS.charcoalBrown,
    margin: 1,
    borderRadius: 1,
  },
  
  // Summary section styles
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  

  
  // Search bar styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: COLORS.charcoalBrown,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  
  // Category filter styles
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeCategoryButton: {
    backgroundColor: COLORS.antiqueMaroon,
  },
  categoryButtonText: {
    color: COLORS.charcoalBrown,
    fontWeight: '500',
    fontSize: 15,
  },
  activeCategoryButtonText: {
    color: COLORS.softIvory,
    fontWeight: 'bold',
  },
  
  // Grid view styles
  gridContainer: {
    paddingHorizontal: 15,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  periodBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.burnishedGold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  periodText: {
    color: COLORS.charcoalBrown,
    fontSize: 12,
    fontWeight: '600',
  },
  gridItemContent: {
    padding: 12,
  },
  gridItemTitle: {
    color: COLORS.charcoalBrown,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5,
  },
  gridItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridItemCategory: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  gridItemPrice: {
    color: COLORS.charcoalBrown,
    fontSize: 15,
    fontWeight: '600',
  },
  
  // List view styles
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  listItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  listItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  listItemTitle: {
    color: COLORS.charcoalBrown,
    fontWeight: 'bold',
    fontSize: 16,
  },
  listItemCategory: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemPrice: {
    color: COLORS.charcoalBrown,
    fontSize: 16,
    fontWeight: '600',
  },
  listItemOrigin: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  
  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyTitle: {
    color: COLORS.charcoalBrown,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    textAlign: 'center',
  },
  
  // FAB styles
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.antiqueMaroon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: COLORS.softIvory,
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "92%",
    maxHeight: "90%",
    backgroundColor: COLORS.softIvory,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  modalImageContainer: {
    position: 'relative',
  },
  modalImage: {
    width: "100%",
    height: 250,
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.charcoalBrown,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalPeriodBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: COLORS.burnishedGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalPeriodText: {
    color: COLORS.charcoalBrown,
    fontSize: 13,
    fontWeight: '600',
  },
  priceBadge: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    backgroundColor: COLORS.antiqueMaroon,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.softIvory,
  },
  priceBadgeIcon: {
    marginLeft: 8,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
    paddingTop: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.charcoalBrown,
    marginBottom: 5,
  },
  modalManufacturer: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
  },
  modalDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 25,
    lineHeight: 22,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.charcoalBrown,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.antiqueMaroon,
    paddingLeft: 10,
  },
  detailsSection: {
    marginBottom: 25,
  },
  acquisitionSection: {
    marginBottom: 25,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 15,
    paddingRight: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.charcoalBrown,
    fontWeight: '500',
    fontSize: 15,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: COLORS.antiqueMaroon,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    shadowColor: COLORS.antiqueMaroon,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.charcoalBrown,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: COLORS.charcoalBrown,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Price Sources Modal styles
  priceSourcesModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.softIvory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '70%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  priceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  priceModalTitle: {
    color: COLORS.charcoalBrown,
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceModalCloseButton: {
    padding: 5,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
    fontSize: 14,
  },
  locationPicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  locationText: {
    color: COLORS.charcoalBrown,
    fontSize: 16,
  },
  locationOptionsContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 12,
    marginTop: 5,
    padding: 5,
    maxHeight: 200,
  },
  locationOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  locationOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationOptionText: {
    color: COLORS.charcoalBrown,
    fontSize: 15,
  },
  priceSourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceSourceInfo: {
    flex: 1,
  },
  priceSourceName: {
    color: COLORS.charcoalBrown,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceSourceMeta: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  priceSourceValue: {
    color: COLORS.charcoalBrown,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Validation Documents Modal styles
  validationModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.softIvory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  validationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  validationTitle: {
    color: COLORS.charcoalBrown,
    fontSize: 18,
    fontWeight: 'bold',
  },
  validationItem: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 15,
  },
  validationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  validationType: {
    color: COLORS.charcoalBrown,
    fontSize: 16,
    fontWeight: 'bold',
  },
  validationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationStatusText: {
    color: '#4CAF50',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  validationIssuer: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    marginBottom: 5,
  },
  validationDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 10,
  },
  validationDetails: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  verificationBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CollectionScreen;