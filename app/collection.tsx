import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../styles/theme";

// Icon Components
const IconBack = ({ size = 24, color = COLORS.white }) => (
  <View style={{ width: size, height: size, justifyContent: 'center' }}>
    <View style={{
      width: size * 0.3,
      height: size * 0.6,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      borderColor: color,
      transform: [{ rotate: '45deg' }],
      left: size * 0.2
    }} />
  </View>
);

const IconSearch = ({ size = 24, color = COLORS.white }) => (
  <View style={{ width: size, height: size }}>
    <View style={{
      width: size * 0.7,
      height: size * 0.7,
      borderWidth: 2,
      borderColor: color,
      borderRadius: size * 0.5,
    }} />
    <View style={{
      position: 'absolute',
      width: size * 0.3,
      height: 2,
      backgroundColor: color,
      bottom: 0,
      right: 0,
      transform: [{ rotate: '45deg' }, { translateX: -size * 0.1 }]
    }} />
  </View>
);

const DetailItem = ({ label, value }) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{label}</Text>
    <Text style={{ color: COLORS.white, fontWeight: '500' }}>{value}</Text>
  </View>
);

const CollectionScreen = () => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
      image: require("../assets/images/vintage_watch_test.webp")
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
                          item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (searchQuery === "" || matchesSearch);
  });

  // Calculate collection stats
  const totalValue = collectionItems.reduce((sum, item) => sum + parseFloat(item.price.replace(/[$,]/g, '')), 0);
  const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.obsidianBlack }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.obsidianBlack} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <IconBack />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: "#fff", flex: 1, textAlign: 'center' }}>
          My Collection
        </Text>
      </View>

      {/* Collection Summary */}
      <View style={{ marginHorizontal: 20, marginBottom: 15, backgroundColor: 'rgba(157, 172, 255, 0.1)', borderRadius: 15, padding: 15 }}>
        <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 18 }}>Collection Summary</Text>
        <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>Total Items</Text>
            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 20 }}>{collectionItems.length}</Text>
          </View>
          <View>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>Total Value</Text>
            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 20 }}>{formattedValue}</Text>
          </View>
          <View>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>Categories</Text>
            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 20 }}>{categories.length - 1}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={{ marginHorizontal: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, paddingHorizontal: 15 }}>
        <IconSearch size={20} color="rgba(255, 255, 255, 0.6)" />
        <TextInput
          placeholder="Search collection..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          style={{ flex: 1, color: COLORS.white, paddingVertical: 10, paddingHorizontal: 10 }}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginBottom: 15 }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setActiveCategory(category)}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 8,
              marginRight: 10,
              borderRadius: 20,
              backgroundColor: category === activeCategory ? COLORS.royalSapphire : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: category === activeCategory ? 'bold' : 'normal' }}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid View of Collection Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: COLORS.white, fontSize: 16 }}>No items found</Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, marginTop: 5 }}>
              Try a different search or category
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedItem(item)}
            style={{
              flex: 1,
              margin: 5,
              backgroundColor: 'rgba(157, 172, 255, 0.05)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <Image 
              source={item.image} 
              style={{ width: '100%', height: 150, resizeMode: 'cover' }} 
            />
            <View style={{ padding: 12 }}>
              <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                {item.category}
              </Text>
              <Text style={{ color: COLORS.white, fontSize: 14, marginTop: 8, fontWeight: '500' }}>
                {item.price}
              </Text>
              <View style={{ 
                position: 'absolute',
                top: -155,
                right: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '500' }}>
                  {item.period}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Item Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: COLORS.royalSapphire,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text style={{ fontSize: 30, color: COLORS.white, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>

      {/* Modal for Item Details */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        {selectedItem && (
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: "90%", backgroundColor: COLORS.obsidianBlack, borderRadius: 20, padding: 0, overflow: 'hidden' }}>
              
              {/* Header with close button */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: COLORS.white, flex: 1 }} numberOfLines={2}>
                  {selectedItem.title}
                </Text>
                <TouchableOpacity onPress={() => setSelectedItem(null)} style={{ padding: 5 }}>
                  <Text style={{ fontSize: 24, color: COLORS.platinumSilver }}>✖</Text>
                </TouchableOpacity>
              </View>
              
              {/* Product Image */}
              <Image 
                source={selectedItem.image} 
                style={{ width: "100%", height: 240, resizeMode: 'cover' }} 
              />
              
              {/* Price Badge */}
              <View style={{ 
                position: 'absolute', 
                top: 240, 
                right: 20, 
                backgroundColor: COLORS.royalSapphire,  // Changed color from the original
                paddingVertical: 8, 
                paddingHorizontal: 15, 
                borderRadius: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
                transform: [{ translateY: -20 }]
              }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.white }}>{selectedItem.price}</Text>
              </View>
              
              {/* Product Details */}
              <ScrollView style={{ maxHeight: 350, paddingHorizontal: 20, paddingTop: 15 }}>
                
                {/* Description */}
                <Text style={{ color: COLORS.platinumSilver, marginBottom: 20, lineHeight: 22 }}>{selectedItem.description}</Text>
                
                {/* Details in two columns */}
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                  {/* Left Column */}
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <DetailItem label="Category" value={selectedItem.category} />
                    <DetailItem label="Period" value={selectedItem.period} />
                    <DetailItem label="Manufacturer" value={selectedItem.manufacturer} />
                    <DetailItem label="Designer" value={selectedItem.designer} />
                    <DetailItem label="Materials" value={selectedItem.materials} />
                  </View>
                  
                  {/* Right Column */}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <DetailItem label="Origin" value={selectedItem.place_of_origin} />
                    <DetailItem label="Condition" value={selectedItem.condition} />
                    <DetailItem label="Dimensions" value={selectedItem.dimensions} />
                    <DetailItem label="Made in" value={selectedItem.date_of_manufacture} />
                    <DetailItem label="Acquired on" value={selectedItem.acquisition_date} />
                  </View>
                </View>
                
                {/* Horizontal Divider */}
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 }} />
                
                {/* Reference Information */}
                <View style={{ marginBottom: 20 }}>
                  <DetailItem label="Reference Number" value={selectedItem.reference_number} />
                  <DetailItem label="Scanned On" value={selectedItem.date} />
                  <DetailItem label="Seller Location" value={selectedItem.seller_location} />
                </View>
                
                {/* Action Buttons - Modified to have two buttons */}
                <View style={{ flexDirection: 'row', marginBottom: 25, justifyContent: 'space-between' }}>
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      paddingVertical: 15, 
                      borderRadius: 10,
                      alignItems: 'center',
                      flex: 1,
                      marginRight: 10
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>Edit Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: COLORS.royalSapphire, 
                      paddingVertical: 15, 
                      borderRadius: 10, 
                      alignItems: 'center',
                      flex: 1,
                      marginLeft: 10
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>View History</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default CollectionScreen;