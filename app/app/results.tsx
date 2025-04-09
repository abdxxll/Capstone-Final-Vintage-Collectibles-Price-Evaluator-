// app/ScanResult.tsx
import { Ionicons } from "@expo/vector-icons";
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
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor.primary} />
        </TouchableOpacity>
      </View>

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

        {/* Material & Era */}
        <View style={styles.detailsRow}>
          <View>
            <Text style={styles.label}>Material</Text>
            <Text style={styles.value}>{material || "N/A"}</Text>
          </View>
          <View>
            <Text style={styles.label}>Era</Text>
            <Text style={styles.value}>{era || "Unknown"}</Text>
          </View>
        </View>

        {/* Extended Metadata */}
        <View style={{ width: "100%" }}>
          <Text style={styles.sectionHeader}>Item Details</Text>
          <DetailItem label="Style" value={style as string} />
          <DetailItem label="Culture" value={culture as string} />
          <DetailItem label="Designer" value={designer as string} />
          <DetailItem label="Manufacturer" value={manufacturer as string} />
          <DetailItem label="Model Number" value={model_number as string} />
          <DetailItem label="Country of Origin" value={country_of_origin as string} />
          <DetailItem label="Provenance Date" value={provenance_date as string} />
          <DetailItem label="Condition" value={condition as string} />
          <DetailItem label="Dimensions" value={dimensions as string} />
          <DetailItem label="Materials" value={Array.isArray(materials) ? materials.join(", ") : (materials as string)} />

          <Text style={styles.sectionHeader}>Location & Source</Text>
          <DetailItem label="Location" value={location as string} />
          <DetailItem label="Source URL" value={source_url as string} />

          <Text style={styles.sectionHeader}>Notes</Text>
          <DetailItem label="Origin Notes" value={origin_notes as string} />
          <DetailItem label="Condition Notes" value={condition_notes as string} />
          <DetailItem label="Originality" value={originality as string} />
          <DetailItem label="Provenance Notes" value={provenance_notes as string} />
          <DetailItem label="Pricing Notes" value={pricing_notes as string} />
          <DetailItem label="Owner Notes" value={owner_notes as string} />
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
      backgroundColor: COLORS.softIvory,
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
      paddingHorizontal: 25,
    },
    imageContainer: {
      width: 180,
      height: 250,
      marginBottom: 25,
      alignSelf: "center",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 10,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: textColor.primary,
      textAlign: "center",
      marginBottom: 10,
    },
    priceButton: {
      backgroundColor: "#001F2D",
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 20,
      alignSelf: "center",
      paddingHorizontal: 25,
    },
    priceText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
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
      marginTop: 20,
      marginBottom: 10,
    },
    confirmBtn: {
      backgroundColor: "#001F2D",
      paddingVertical: 15,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
      marginTop: 30,
    },
    confirmText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });
  