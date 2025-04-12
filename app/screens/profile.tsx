import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

const { width } = Dimensions.get("window");

const UserProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileStats, setProfileStats] = useState({
    scans: 0,
    collections: 0,
    likes: 0,
    saved: 0,
  });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("scans"); // scans, collections, likes

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get the current user from Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      
      if (!user) {
        // If no user is logged in, redirect to login
        router.push("../auth/LoginScreen");
        return;
      }
      
      setUser(user);
      
      // Fetch user profile data from your database
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      }
      
      // If the profile doesn't exist yet, create one
      if (!profileData) {
        const { error: createError } = await supabase
          .from("user_profiles")
          .insert([
            {
              user_id: user.id,
              username: user.email?.split('@')[0] || `user${Math.floor(Math.random() * 10000)}`,
              display_name: user.email?.split('@')[0] || "New User",
              avatar_url: null,
              bio: "I love collecting and discovering vintage items!",
            },
          ]);
          
        if (createError) {
          console.error("Error creating profile:", createError);
        }
      }
      
      // Fetch recent scans (assuming you have a table for this)
      const { data: scansData, error: scansError } = await supabase
        .from("user_scans")
        .select("*, item:item_id(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
        
      if (scansError) {
        console.error("Error fetching scans:", scansError);
      } else {
        setRecentScans(scansData || []);
        
        // Update stats
        setProfileStats(prev => ({
          ...prev,
          scans: scansData?.length || 0,
        }));
      }
      
      // Fetch collections count
      const { count: collectionsCount, error: collectionsError } = await supabase
        .from("user_collections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
        
      if (!collectionsError) {
        setProfileStats(prev => ({
          ...prev,
          collections: collectionsCount || 0,
        }));
      }
      
      // Fetch likes count
      const { count: likesCount, error: likesError } = await supabase
        .from("user_likes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
        
      if (!likesError) {
        setProfileStats(prev => ({
          ...prev,
          likes: likesCount || 0,
        }));
      }
      
      // Fetch saved items count
      const { count: savedCount, error: savedError } = await supabase
        .from("user_saved_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
        
      if (!savedError) {
        setProfileStats(prev => ({
          ...prev,
          saved: savedCount || 0,
        }));
      }
      
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: async () => {
            await supabase.auth.signOut();
            router.push("../auth/LoginScreen");
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "scans":
        return (
          <View style={styles.tabContent}>
            {recentScans.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons
                  name="image-filter-center-focus-weak"
                  size={60}
                  color={textColor.secondary}
                />
                <Text style={styles.emptyStateTitle}>No Scans Yet</Text>
                <Text style={styles.emptyStateText}>
                  Scan your first item to get started!
                </Text>
                <TouchableOpacity
                  style={styles.scanNowButton}
                  onPress={() => router.push("/screens/camera")}
                >
                  <Text style={styles.scanNowButtonText}>Scan Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scansGrid}>
                {recentScans.map((scan, index) => (
                  <TouchableOpacity
                    key={scan.id || index}
                    style={styles.scanItem}
                    onPress={() => 
                      router.push({
                        pathname: "/screens/results",
                        params: {
                          imageUri: scan.image_url,
                          itemName: scan.item?.name || "Unknown Item",
                          itemId: scan.item_id,
                          rewindPrice: scan.item?.price || "0",
                          // Add other necessary params here
                        }
                      })
                    }
                  >
                    <View style={styles.scanImageContainer}>
                      <Image
                        source={{ 
                          uri: scan.image_url || 
                               scan.item?.image_url || 
                               "https://via.placeholder.com/150" 
                        }}
                        style={styles.scanImage}
                      />
                    </View>
                    <Text 
                      numberOfLines={2} 
                      style={styles.scanItemName}
                    >
                      {scan.item?.name || "Unknown Item"}
                    </Text>
                    {scan.item?.price && (
                      <Text style={styles.scanItemPrice}>
                        ${Number(scan.item.price).toLocaleString()}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      
      case "collections":
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons
                name="bookmark-multiple-outline"
                size={60}
                color={textColor.secondary}
              />
              <Text style={styles.emptyStateTitle}>No Collections Yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first collection to organize your items!
              </Text>
              <TouchableOpacity
                style={styles.createCollectionButton}
                onPress={() => {
                  // Navigate to create collection
                  Alert.alert("Coming Soon", "Collections feature is coming soon!");
                }}
              >
                <Text style={styles.createCollectionButtonText}>Create Collection</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case "likes":
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={60}
                color={textColor.secondary}
              />
              <Text style={styles.emptyStateTitle}>No Liked Items</Text>
              <Text style={styles.emptyStateText}>
                Like items to save them to your favorites!
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            Alert.alert("Coming Soon", "Settings will be available soon!");
          }}
        >
          <Ionicons name="settings-outline" size={24} color={textColor.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              {user?.user_metadata?.avatar_url ? (
                <Image
                  source={{ uri: user.user_metadata.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {(user?.email?.charAt(0) || "U").toUpperCase()}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => {
                Alert.alert("Coming Soon", "Profile editing will be available soon!");
              }}
            >
              <Ionicons name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.displayName}>
            {user?.user_metadata?.name || user?.email?.split('@')[0] || "User"}
          </Text>
          
          <Text style={styles.email}>{user?.email}</Text>
          
          <Text style={styles.bio}>
            I love collecting and discovering vintage items!
          </Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileStats.scans}</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileStats.collections}</Text>
              <Text style={styles.statLabel}>Collections</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileStats.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "scans" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("scans")}
          >
            <Ionicons
              name="scan-outline"
              size={20}
              color={activeTab === "scans" ? COLORS.primary : textColor.secondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "scans" && styles.activeTabText,
              ]}
            >
              Scans
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "collections" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("collections")}
          >
            <Ionicons
              name="folder-outline"
              size={20}
              color={activeTab === "collections" ? COLORS.primary : textColor.secondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "collections" && styles.activeTabText,
              ]}
            >
              Collections
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "likes" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("likes")}
          >
            <Ionicons
              name="heart-outline"
              size={20}
              color={activeTab === "likes" ? COLORS.primary : textColor.secondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "likes" && styles.activeTabText,
              ]}
            >
              Likes
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {renderTabContent()}
        
        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryBackground,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: textColor.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 0 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: textColor.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
  },
  editProfileButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryBackground,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: textColor.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: textColor.secondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: textColor.primary,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: textColor.primary,
  },
  statLabel: {
    fontSize: 12,
    color: textColor.secondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: textColor.secondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  tabContent: {
    minHeight: 300,
    marginHorizontal: 16,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: textColor.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: textColor.secondary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  scanNowButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  scanNowButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  createCollectionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  createCollectionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  scansGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  scanItem: {
    width: (width - 40) / 2,
    marginBottom: 16,
  },
  scanImageContainer: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 8,
  },
  scanImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scanItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: textColor.primary,
    marginBottom: 4,
  },
  scanItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  signOutButton: {
    marginTop: 30,
    marginHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E53935",
  },
});

export default UserProfileScreen;