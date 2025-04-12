import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Button,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";

export default function Camera() {
  const api_key = process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY;
  const [metadata, setMetadata] = useState<any | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);
  const [valuationLoading, setValuationLoading] = useState<boolean>(false);
  const [showValuationModal, setShowValuationModal] = useState(false);

  interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface Prediction {
    confidence: number;
    class: string;
    bbox: BoundingBox;
  }

  interface InferenceResult {
    predictions: Prediction[];
  }

  const [inferenceResults, setInferenceResults] =
    useState<InferenceResult | null>(null);
  const [detectedClass, setDetectedClass] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slideUp = () => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const slideDown = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const startScan = async (
    imageUri: string
  ): Promise<{ scanId: string; imageUrl: string } | null> => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("No user found");
      return null;
    }

    const filename = `${user.id}-${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("scans")
      .upload(filename, {
        uri: imageUri,
        type: "image/jpeg",
        name: filename,
      } as any);

    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      return null;
    }

    const imageUrl = supabase.storage.from("scans").getPublicUrl(filename)
      .data.publicUrl;

    const { data, error } = await supabase
      .from("rewind_scans")
      .insert([
        {
          user_id: user.id,
          image_filename: filename,
          image_url: imageUrl,
          captured_at: new Date().toISOString(),
        },
      ])
      .select("scan_id")
      .single();

    if (error) {
      console.error("Failed to insert scan row:", error);
      return null;
    }

    return { scanId: data.scan_id, imageUrl };
  };

  const runRoboflowAndUpdateScan = async (scanId: string, imageUri: string) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const base64Image = base64.split(",")[1];

      const result = await fetch(
        "https://detect.roboflow.com/infer/workflows/sultup/detect-and-classify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: api_key,
            inputs: { image: { type: "url", value: base64Image } },
          }),
        }
      ).then((res) => res.json());

      const detectedItem =
        result?.outputs?.[0]?.model_predictions?.predictions?.[0]?.class ||
        "Unknown";

      console.log("Roboflow result:", JSON.stringify(result, null, 2));

      setDetectedLabel(detectedItem);
      setValuationLoading(true);
      setShowValuationModal(true);

      await supabase
        .from("rewind_scans")
        .update({ roboflow_results: result })
        .eq("scan_id", scanId);

      const { data: scanRow, error: scanError } = await supabase
        .from("rewind_scans")
        .select("image_url")
        .eq("scan_id", scanId)
        .single();

      if (scanError || !scanRow?.image_url) {
        console.error(
          "Failed to fetch image URL from rewind_scans:",
          scanError
        );
        return;
      }

      await fetchMetadata(detectedItem, scanRow.image_url);

      setTimeout(() => {
        setValuationLoading(false);
      }, 2500);
    } catch (err) {
      console.error("Roboflow error:", err);
    }
  };

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);

      setLoading(true);

      const scan = await startScan(photo.uri);
      if (scan) {
        await runRoboflowAndUpdateScan(scan.scanId, photo.uri);
      }

      setLoading(false);
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
    console.log({ video });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const saveDetectionToSupabase = async (
    detectedClass: string,
    inference: any,
    imageUrl: string
  ) => {
    const { data, error } = await supabase.from("detections").insert([
      {
        class: detectedClass,
        inference_result: inference,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      console.error("Failed to save detection:", error);
    } else {
      console.log("Detection saved:", data);
    }
  };

  const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    <View style={{ marginBottom: 10 }}>
      <Text
        style={{ color: textColor.secondary, fontWeight: "bold", fontSize: 14 }}
      >
        {label}:
      </Text>
      <Text style={{ color: textColor.primary, fontSize: 16 }}>
        {value || "N/A"}
      </Text>
    </View>
  );

  const renderResults = () => {
    return (
      <Modal visible={!!metadata} transparent animationType="slide">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {metadata && (
              <View
                style={{
                  width: "90%",
                  backgroundColor: COLORS.primaryBackground,
                  borderRadius: 20,
                  paddingVertical: 20,
                  paddingHorizontal: 25,
                  alignItems: "center",
                }}
              >
                {/* Image */}
                <View
                  style={{
                    width: 180,
                    height: 250,
                    marginBottom: 25,
                    borderRadius: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 10,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: uri || "" }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "contain",
                    }}
                  />
                </View>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "600",
                    color: textColor.primary,
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  {metadata.title || "Untitled Item"}
                </Text>

                {/* Price as a clickable button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#001F2D",
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                  onPress={() => {
                    router.push({
                      pathname: "../source",
                      params: { itemId: metadata.item_id },
                    });

                    console.log("Navigate to price sources");
                  }}
                >
                  <Text
                    style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
                  >
                    $
                    {metadata.rewind_price
                      ? Number(metadata.rewind_price).toLocaleString()
                      : "N/A"}
                  </Text>
                </TouchableOpacity>

                {/* Material and Era */}
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 30,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: textColor.secondary,
                      }}
                    >
                      Material
                    </Text>
                    <Text style={{ fontSize: 16, color: textColor.primary }}>
                      {metadata.materials?.[0] || "N/A"}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: textColor.secondary,
                      }}
                    >
                      Era
                    </Text>
                    <Text style={{ fontSize: 16, color: textColor.primary }}>
                      {metadata.period || "Unknown"}
                    </Text>
                  </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  onPress={() => setMetadata(null)}
                  style={{
                    backgroundColor: "#001F2D",
                    paddingVertical: 15,
                    borderRadius: 10,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </GestureHandlerRootView>
      </Modal>
    );
  };

  const renderPicture = () => {
    if (!uri) return null;

    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri }} style={styles.preview} />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <Button
          onPress={() => {
            setUri(null);
            setInferenceResults(null);
            setDetectedClass(null);
            setError(null);
            slideDown();
          }}
          title="Take another picture"
        />
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={mode}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        {/* 🔙 Home button in top-left corner */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.push("/screens/home")}>
            <AntDesign name="arrowleft" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Camera controls */}
        <View style={styles.shutterContainer}>
          <Pressable onPress={toggleMode}>
            {mode === "picture" ? (
              <AntDesign name="picture" size={32} color="neutral900Brown" />
            ) : (
              <Feather name="video" size={32} color="neutral900Brown" />
            )}
          </Pressable>
          <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor:
                        mode === "picture" ? "neutral900Brown" : "red",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="neutral900Brown" />
          </Pressable>
        </View>
      </CameraView>
    );
  };

  const fetchMetadata = async (itemName: string, imageUrl: string) => {
    if (!itemName) return;

    try {
      const { data, error } = await supabase
        .from("rewind_core_items_v2")
        .select(
          `
          name, item_id, materials, period,
          rewind_price, style, culture, designer,
          manufacturer, model_number, country_of_origin,
          provenance_date, condition, dimensions, location,
          source_url, origin_notes, condition_notes,
          originality, provenance_notes, pricing_notes, owner_notes
        `
        )
        .ilike("name", `%${itemName}%`)
        .limit(1)
        .single();

      if (error || !data) {
        console.warn("No metadata found for:", itemName);
        return;
      }

      const filteredMetadata = Object.entries(data).reduce(
        (acc, [key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      router.push({
        pathname: "../results",
        params: {
          imageUri: imageUrl,
          itemId: filteredMetadata.item_id,
          itemName: filteredMetadata.name,
          material: filteredMetadata.materials?.[0],
          era: filteredMetadata.period,
          rewindPrice: filteredMetadata.rewind_price,
          style: filteredMetadata.style,
          culture: filteredMetadata.culture,
          designer: filteredMetadata.designer,
          manufacturer: filteredMetadata.manufacturer,
          model_number: filteredMetadata.model_number,
          country_of_origin: filteredMetadata.country_of_origin,
          provenance_date: filteredMetadata.provenance_date,
          condition: filteredMetadata.condition,
          dimensions: filteredMetadata.dimensions,
          location: filteredMetadata.location,
          source_url: filteredMetadata.source_url,
          origin_notes: filteredMetadata.origin_notes,
          condition_notes: filteredMetadata.condition_notes,
          originality: filteredMetadata.originality,
          provenance_notes: filteredMetadata.provenance_notes,
          pricing_notes: filteredMetadata.pricing_notes,
          owner_notes: filteredMetadata.owner_notes,
          materials: JSON.stringify(filteredMetadata.materials || []),
        },
      });
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {uri ? renderPicture() : renderCamera()}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "neutral900Brown",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  preview: {
    flex: 1,
    width: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,0,0,0.8)",
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: "#ffffff",
    textAlign: "center",
  },
  resultsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resultsContent: {
    flex: 1,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "500",
  },
  navBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 30,
  },
});
