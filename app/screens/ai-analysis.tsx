import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

type GeminiAnalysis = {
  estimated_price_range: string;
  key_factors: string[];
  reasoning: string[];
  confidence_level: string;
};

const { width } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function AIAnalysis() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState("estimate");
  
  const { scanId, itemName, imageUrl } = useLocalSearchParams<{
    scanId: string;
    itemName: string;
    imageUrl: string;
  }>();
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        if (!scanId) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from("rewind_scans")
          .select("price_model_results, created_at")
          .eq("scan_id", scanId)
          .single();

        if (error) {
          throw error;
        }
        
        if (!data?.price_model_results) {
          return;
        }

        setAnalysis(data.price_model_results);
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [scanId]);

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

  const renderConfidenceLevel = () => {
    let confidenceValue = 0;
    let confidenceColor = COLORS.warning;
    
    if (analysis?.confidence_level.includes("High")) {
      confidenceValue = 0.9;
      confidenceColor = '#4CAF50';
    } else if (analysis?.confidence_level.includes("Medium")) {
      confidenceValue = 0.6;
      confidenceColor = '#FFC107';
    } else if (analysis?.confidence_level.includes("Low")) {
      confidenceValue = 0.3;
      confidenceColor = '#F44336';
    }
    
    return (
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceBarBackground}>
          <View 
            style={[
              styles.confidenceBarFill, 
              { width: `${confidenceValue * 100}%`, backgroundColor: confidenceColor }
            ]} 
          />
        </View>
        <Text style={styles.confidenceText}>{analysis?.confidence_level}</Text>
      </View>
    );
  };

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "estimate" && styles.activeTab]} 
          onPress={() => setActiveTab("estimate")}
        >
          <Text style={[styles.tabText, activeTab === "estimate" && styles.activeTabText]}>
            Estimate
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "factors" && styles.activeTab]} 
          onPress={() => setActiveTab("factors")}
        >
          <Text style={[styles.tabText, activeTab === "factors" && styles.activeTabText]}>
            Key Factors
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "reasoning" && styles.activeTab]} 
          onPress={() => setActiveTab("reasoning")}
        >
          <Text style={[styles.tabText, activeTab === "reasoning" && styles.activeTabText]}>
            Reasoning
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabContent = () => {
    if (!analysis) return null;
    
    switch (activeTab) {
      case "estimate":
        return (
          <>
            <SectionCard title="ESTIMATED PRICE RANGE">
              <Text style={styles.priceValue}>{analysis.estimated_price_range}</Text>
            </SectionCard>
            
            <SectionCard title="CONFIDENCE LEVEL">
              {renderConfidenceLevel()}
            </SectionCard>
          </>
        );
      
      case "factors":
        return (
          <SectionCard title="KEY FACTORS">
            {analysis.key_factors.map((factor, index) => (
              <View key={index} style={styles.factorItem}>
                <View style={styles.factorBullet}>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.factorText}>{factor}</Text>
              </View>
            ))}
          </SectionCard>
        );
      
      case "reasoning":
        return (
          <SectionCard title="REASONING">
            {analysis.reasoning.map((reason, index) => (
              <View key={index} style={styles.reasoningItem}>
                <Text style={styles.reasoningText}>
                  <Text style={styles.reasoningNumber}>{index + 1}. </Text>
                  {reason}
                </Text>
              </View>
            ))}
          </SectionCard>
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

  if (!scanId) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Invalid Scan</Text>
        <Text style={styles.errorSubtext}>
          Unable to find the scan. Please try again.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Analyzing your item{'\n'}
            <Text style={styles.loadingTextSmall}>Processing AI insights...</Text>
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialIcons name="analytics" size={64} color={COLORS.warning} />
        <Text style={styles.errorText}>No analysis available</Text>
        <Text style={styles.errorSubtext}>
          The AI analysis is not yet available for this scan. Please try again later.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        {imageUrl && (
          <Animated.Image 
            source={{ uri: imageUrl as string }} 
            style={[styles.headerImage, { opacity: imageOpacity }]} 
          />
        )}
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
            {itemName || "AI Analysis"}
          </Animated.Text>
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
            {itemName || "AI Analysis"}
          </Text>
          
          {/* Tabs Navigation */}
          {renderTabs()}
          
          {/* Tab Content */}
          {renderTabContent()}
        </View>
        
        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Analysis powered by AI
          </Text>
          <Text style={styles.footerSubtext}>
            Prices are estimates and may vary based on market conditions
          </Text>
        </View>
        
        {/* Back Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={() => router.back()}>
          <Text style={styles.confirmText}>Back to Details</Text>
        </TouchableOpacity>
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
    marginRight: 40, // To balance the back button
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '800',
    color: textColor.secondary,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  confidenceContainer: {
    marginTop: 4,
  },
  confidenceBarBackground: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  confidenceText: {
    fontSize: 16,
    color: textColor.primary,
    fontWeight: '500',
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  factorBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  factorText: {
    flex: 1,
    fontSize: 16,
    color: textColor.primary,
    lineHeight: 24,
  },
  reasoningItem: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  reasoningNumber: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reasoningText: {
    fontSize: 16,
    color: textColor.primary,
    lineHeight: 24,
  },
  footer: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: textColor.secondary,
  },
  footerSubtext: {
    fontSize: 12,
    color: textColor.tertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: "#001F2D",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: textColor.primary,
    textAlign: 'center',
  },
  loadingTextSmall: {
    fontSize: 14,
    color: textColor.secondary,
    fontWeight: 'normal',
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: textColor.primary,
    marginTop: 16,
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 16,
    color: textColor.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});