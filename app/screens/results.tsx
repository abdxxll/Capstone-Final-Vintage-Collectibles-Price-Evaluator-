// app/ScanResult.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, textColor } from "../../styles/theme";

export default function ScanResult() {
  const router = useRouter();
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
  } = useLocalSearchParams();




  const DetailItem = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      {/* <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor.primary} />
        </TouchableOpacity>
      </View> */}

      
<ScrollView contentContainerStyle={styles.contentContainer}>
  {/* Image */}
  <View style={styles.imageContainer}>
    <Image source={{ uri: imageUri as string }} style={styles.image} />
  </View>

   {/* Title */}
   <Text style={styles.title} numberOfLines={2}>
          {itemName || "Untitled Item"}
        </Text>

        {/* Price */}
        <TouchableOpacity
          style={styles.priceButton}
          onPress={() =>
            router.push({
                pathname: "/screens/source",
                params: { itemName }
            })
              
          }
        >
          <Text style={styles.priceText}>
            ${rewindPrice ? Number(rewindPrice).toLocaleString() : "N/A"}
          </Text>
        </TouchableOpacity>


  {/* Section: Features */}
  <Text style={styles.sectionHeader}>Features</Text>
  <View style={styles.sectionBox}>
    <DetailItem label="Condition" value={condition as string} />
    <Text style={styles.label}>Condition Notes</Text>
    <Text style={styles.value}>{condition_notes}</Text>
    <View style={styles.dimensionRow}>
      <DetailItem
        label="Height"
        value={
          typeof dimensions === "string"
            ? dimensions.split(",")[0]
            : dimensions?.[0]
        }
      />
      <DetailItem
        label="Width"
        value={
          typeof dimensions === "string"
            ? dimensions.split(",")[1]
            : dimensions?.[1]
        }
      />
      <DetailItem
        label="Depth"
        value={
          Array.isArray(dimensions)
            ? dimensions[2]
            : dimensions?.split(",")[2]
        }
      />
    </View>
  </View>


  {/* Section: Designer */}
  {(designer || manufacturer) && (
    <>
    
      <View style={styles.sectionBox}>
        {designer && <DetailItem label="Designer" value={designer as string} />}
        {manufacturer && <DetailItem label="Manufacturer" value={manufacturer as string} />}
      </View>
    </>
  )}

  {/* Section: Materials & Era */}

  <View style={styles.sectionBox}>
    <DetailItem label="Materials" value={Array.isArray(materials) ? materials.join(", ") : (materials as string)} />
    <DetailItem label="Era" value={era as string} />
    <DetailItem label="Date" value={provenance_date as string} />
  </View>



  {/* Confirm Button */}
  <TouchableOpacity style={styles.confirmBtn} onPress={() => router.back()}>
    <Text style={styles.confirmText}>Confirm</Text>
  </TouchableOpacity>
</ScrollView>


    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.primaryBackground,
    },
    navBar: {
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    contentContainer: {
      paddingBottom: 40,
      paddingHorizontal: 10,
 
    },
    imageContainer: {
      width: "100%",
      height: 275,
      // aspectRatio: 1,
      marginBottom: 10,
      marginTop: 10,
      alignSelf: "center",
      borderRadius: 6,
      elevation: 10,
      overflow: "hidden",
    },
    
    image: {
      width: "100%",
      height: "100%", // <== Fill the container
      resizeMode: "cover",
    },
    
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: textColor.primary,
      textAlign: "center",
      marginBottom: 10,
    },
    priceButton: {
      backgroundColor: COLORS.lightLime,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 20,
      alignSelf: "center",
      paddingHorizontal: 25,
    },
    priceText: {
      fontSize: 20,
      fontWeight: "bold",
      color: textColor.primary,
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    label: {
      fontSize: 14,
      fontWeight: "bold",
      color: textColor.secondary,
    },
    value: {
      fontSize: 16,
      color: textColor.primary,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: textColor.primary,
      marginTop: 2,
      marginBottom: 10,
    },
    confirmBtn: {
      backgroundColor: "#001F2D",
      paddingVertical: 15,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
      marginTop: 10,
    },
    confirmText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    sectionBox: {
      backgroundColor: COLORS.primaryBackground,
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dimensionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    
  });
  