import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../styles/theme";



// Icon components
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

const IconSettings = ({ size = 24, color = COLORS.white }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ 
      width: size * 0.6, 
      height: size * 0.6, 
      borderRadius: size * 0.3, 
      borderWidth: 2, 
      borderColor: color,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <View style={{ 
        width: size * 0.25, 
        height: size * 0.25, 
        borderRadius: size * 0.125, 
        backgroundColor: color 
      }} />
    </View>
    {[0, 45, 90, 135].map((rotation, index) => (
      <View key={index} style={{
        position: 'absolute',
        width: 2,
        height: size * 0.2,
        backgroundColor: color,
        transform: [{ rotate: `${rotation}deg` }],
      }} />
    ))}
  </View>
);

const IconCollection = ({ size = 24, color = COLORS.white }) => (
  <View style={{ width: size, height: size }}>
    <View style={{ 
      width: size * 0.45, 
      height: size * 0.45, 
      borderWidth: 2, 
      borderColor: color,
      position: 'absolute',
      top: size * 0.15,
      left: size * 0.15
    }} />
    <View style={{ 
      width: size * 0.45, 
      height: size * 0.45, 
      borderWidth: 2, 
      borderColor: color,
      position: 'absolute',
      top: size * 0.3,
      left: size * 0.3
    }} />
  </View>
);

const IconNotification = ({ size = 24, color = COLORS.white }) => (
  <View style={{ width: size, height: size, alignItems: 'center' }}>
    <View style={{ 
      width: size * 0.16, 
      height: size * 0.16, 
      borderRadius: size * 0.08,
      backgroundColor: color,
      position: 'absolute',
      top: 0
    }} />
    <View style={{ 
      width: size * 0.6, 
      height: size * 0.6, 
      borderTopLeftRadius: size * 0.3,
      borderTopRightRadius: size * 0.3,
      borderWidth: 2, 
      borderColor: color,
      position: 'absolute',
      bottom: size * 0.2
    }} />
    <View style={{ 
      width: size * 0.8, 
      height: size * 0.15, 
      borderRadius: size * 0.075,
      borderWidth: 2, 
      borderColor: color,
      position: 'absolute',
      bottom: 0
    }} />
  </View>
);

const IconHelp = ({ size = 24, color = COLORS.white }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ 
      width: size * 0.7, 
      height: size * 0.7, 
      borderRadius: size * 0.35, 
      borderWidth: 2, 
      borderColor: color,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{ color, fontSize: size * 0.5, fontWeight: 'bold' }}>?</Text>
    </View>
  </View>
);

const ProfileScreen = () => {
  const router = useRouter();
  
  // User data
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    memberSince: "January 2024",
    collectionItems: 32,
    recentItems: 8,
  };

  const renderSettingItem = (icon, title, description, hasToggle = false, isToggled = false) => (
    <TouchableOpacity
      style={{
        backgroundColor: COLORS.lightBlack,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <View style={{ 
        backgroundColor: COLORS.obsidianBlack, 
        padding: 10, 
        borderRadius: 10, 
        marginRight: 15 
      }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{title}</Text>
        <Text style={{ color: COLORS.white, fontSize: 13, marginTop: 2 }}>{description}</Text>
      </View>
      {hasToggle && (
        <Switch
          trackColor={{ false: '#3e3e3e', true: COLORS.white }}
          thumbColor={isToggled ? COLORS.white : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          value={isToggled}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.obsidianBlack }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.obsidianBlack} />
      
      {/* Header with gradient background */}
      <View
        style={{ paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center' }}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ padding: 8 }}
        >
          <IconBack />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: "#fff", flex: 1, textAlign: 'center' }}>
          Profile
        </Text>
        <TouchableOpacity style={{ padding: 8 }}>
          <IconSettings />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Profile header */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: COLORS.white,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 15
            }}
          >
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: COLORS.obsidianBlack }}>
              {userData.name.charAt(0)}
            </Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{userData.name}</Text>
          <Text style={{ color: COLORS.white, fontSize: 14, marginTop: 5 }}>{userData.email}</Text>
          <Text style={{ color: COLORS.white, fontSize: 14, marginTop: 5 }}>Member since {userData.memberSince}</Text>
        </View>

        {/* Stats */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          marginBottom: 30,
          backgroundColor: COLORS.lightBlack,
          borderRadius: 15,
          padding: 15
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{userData.collectionItems}</Text>
            <Text style={{ color: COLORS.white, fontSize: 14 }}>Collection</Text>
          </View>
          <View style={{ width: 1, backgroundColor: COLORS.white, height: 40 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{userData.recentItems}</Text>
            <Text style={{ color: COLORS.white, fontSize: 14 }}>Recent</Text>
          </View>
        </View>

        {/* Settings */}
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Settings</Text>
        
        {renderSettingItem(
          <IconCollection color={COLORS.white} />,
          "My Collection",
          "View and manage your items",
          false
        )}
        
        {renderSettingItem(
          <IconNotification color={COLORS.white} />,
          "Notifications",
          "Manage your alert preferences",
          true,
          true
        )}
        
        {renderSettingItem(
          <IconHelp color={COLORS.white} />,
          "Help & Support",
          "FAQs, contact support",
          false
        )}

        {/* Sign out button */}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.lightBlack,
            borderRadius: 12,
            padding: 15,
            marginTop: 15,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold' }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;