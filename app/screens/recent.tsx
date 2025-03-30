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
  TouchableOpacity,
  View
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";


  

// Icon Components
const IconBack = ({ size = 24, color = textColor.primary }) => (
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

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{label}</Text>
      <Text style={{ color: textColor.primary, fontWeight: '500' }}>{value}</Text>
    </View>
  );

const RecentScreen = () => {
    const router = useRouter();
    const [selectedItem, setSelectedItem] = useState<typeof recentItems[0] | null>(null);
  
  // Sample data
  const recentItems = [
    {
      id: 1,
      title: "Rolex 6239 Daytona Stainless Steel Watch",
      price: "$63,600",
      description: "A classic Rolex timepiece...",
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
      link: "https://example.com/rolex",
      date: "Mar 5, 2025",
      image: require("../assets/images/vintage_watch_test.webp")
    },
    {
      id: 2,
      title: "Hollóháza Porcelain Vase",
      price: "$560",
      description: "Elegant porcelain vase from the renowned Hungarian manufacturer...",
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
      link: "https://example.com/hollohaza-vase",
      date: "Feb 28, 2025",
      image: require("../assets/images/porcelein_vase.webp")
    },
    {
      id: 3,
      title: "Antique Brass Hunting Clock",
      price: "$645.32",
      description: "Intricate brass hunting clock with detailed engravings...",
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
      link: "https://example.com/brass-clock",
      date: "Feb 25, 2025",
      image: require("../assets/images/antique_clock.webp")
    },
    {
      id: 4,
      title: "Modern Penedo Showcase Bar Cabinet Patagonia Stone Handmade Portugal Greenapple",
      price: "$50,823.72",
      description: "Luxurious handcrafted bar cabinet featuring Patagonia stone...",
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
      link: "https://example.com/greenapple-cabinet",
      date: "Feb 20, 2025",
      image: require("../assets/images/display.webp")
    },
    {
      id: 5,
      title: "Sunburst Ceiling Light Fixture in Gilt Wrought Iron, Spain 1950s",
      price: "$3,259.35",
      description: "Elegant sunburst ceiling light fixture with gilt wrought iron design...",
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
      link: "https://example.com/sunburst-light",
      date: "Feb 20, 2025",
      image: require("../assets/images/sunburst_furniture.webp")
    }
  ];

  const filterOptions = ["All", "Watches", "Coins", "Art", "Furniture"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.softIvory }}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.softIvory} />

    {/* Header */}
    <View style={{ paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
        <IconBack />
      </TouchableOpacity>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: "#fff", flex: 1, textAlign: 'center' }}>
        Recent Items
      </Text>
    </View>

    {/* Item List */}
    <FlatList
      data={recentItems}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 15 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => setSelectedItem(item)}
          style={{
            backgroundColor: 'rgba(157, 172, 255, 0.1)',
            borderRadius: 15,
            marginBottom: 15,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', padding: 15 }}>
            <Image source={item.image} style={{ width: 80, height: 80, borderRadius: 10 }} />
            <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: textColor.primary, fontSize: 14, marginTop: 2 }}>{item.period}</Text>
              <Text style={{ color: textColor.primary, fontSize: 14, marginTop: 10 }}>{item.price}</Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginTop: 5 }}>{item.date}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />

    {/* Modal for Item Details */}
    <Modal visible={!!selectedItem} transparent animationType="slide">
  {selectedItem && (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: "90%", backgroundColor: COLORS.softIvory, borderRadius: 20, padding: 0, overflow: 'hidden' }}>
        
        {/* Header with close button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: textColor.primary, flex: 1 }} numberOfLines={2}>
            {selectedItem.title}
          </Text>
          <TouchableOpacity onPress={() => setSelectedItem(null)} style={{ padding: 5 }}>
            <Text style={{ fontSize: 24, color: COLORS.softPurple }}>✖</Text>
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
          backgroundColor: COLORS.softIvory, 
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
          <Text style={{ fontSize: 18, fontWeight: "bold", color: textColor.primary }}>{selectedItem.price}</Text>
        </View>
        
        {/* Product Details */}
        <ScrollView style={{ maxHeight: 350, paddingHorizontal: 20, paddingTop: 15 }}>
          
          {/* Description */}
          <Text style={{ color: COLORS.softPurple, marginBottom: 20, lineHeight: 22 }}>{selectedItem.description}</Text>
          
          {/* Details in two columns */}
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            {/* Left Column */}
            <View style={{ flex: 1, marginRight: 10 }}>
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
          
          {/* Action Button */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: COLORS.softPurple, 
              paddingVertical: 15, 
              borderRadius: 10, 
              alignItems: 'center',
              marginBottom: 25
            }}
          >
            <Text style={{ color: COLORS.lightLime, fontWeight: 'bold', fontSize: 16 }}>View Similar Items</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  )}
</Modal>
  </SafeAreaView>

  );
};

export default RecentScreen;