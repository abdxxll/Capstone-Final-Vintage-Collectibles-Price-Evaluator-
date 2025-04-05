import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../supabaseClient";

export default function HistoryScreen() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      console.warn("No user found");
      return;
    }

    const { data, error } = await supabase
      .from("rewind_scans") // your actual table
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching scans:", error);
    } else {
      setScans(data);
    }

    setLoading(false);
  };
  

  const renderItem = ({ item }: { item: any }) => {
    const detectedClass =
  item.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class || "Unknown";



    return (
      <TouchableOpacity
        onPress={() => setSelectedScan(item)}
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          marginVertical: 10,
          marginHorizontal: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Image
          source={{ uri: item.image_url }}
          style={{
            width: "100%",
            height: 200,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        <View style={{ padding: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{detectedClass}</Text>
          <Text style={{ color: "gray", fontSize: 12 }}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <FlatList
        data={scans}
        keyExtractor={(item) => item.scan_id}
        renderItem={renderItem}
      />

      {/* Modal with Scan Details */}
      <Modal visible={!!selectedScan} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              margin: 20,
              borderRadius: 15,
              padding: 20,
            }}
          >
            <ScrollView>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
             {selectedScan?.roboflow_results?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class || "Unknown"}

              </Text>

              <Image
                source={{ uri: selectedScan?.image_url }}
                style={{
                  width: "100%",
                  height: 200,
                  marginBottom: 10,
                  borderRadius: 10,
                }}
              />

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 5,
                }}
              >
                Metadata:
              </Text>
              <Text
                style={{ fontFamily: "monospace", fontSize: 13 }}
              >
                {JSON.stringify(selectedScan?.metadata_results, null, 2)}
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginVertical: 5,
                }}
              >
                Roboflow Results:
              </Text>
              <Text
                style={{ fontFamily: "monospace", fontSize: 13 }}
              >
                {JSON.stringify(selectedScan?.roboflow_results, null, 2)}
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setSelectedScan(null)}
              style={{
                marginTop: 20,
                alignSelf: "center",
                paddingHorizontal: 30,
                paddingVertical: 12,
                backgroundColor: "#333",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
