
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Button,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { GestureHandlerRootView, ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { COLORS, textColor } from "../../styles/theme";
import { supabase } from "../../supabaseClient";


export default function Camera() {
  const api_key = process.env.ROBOFLOW_API_KEY;
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

  // Add a new state to store just the detected class names
  const [inferenceResults, setInferenceResults] = useState<InferenceResult | null>(null);
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


  const startScan = async (imageUri: string): Promise<{ scanId: string; imageUrl: string } | null> => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
  
    if (!user) {
      console.warn("No user found");
      return null;
    }
  
    // Upload image to storage
    const filename = `${user.id}-${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
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
  
    const imageUrl = supabase
      .storage
      .from("scans")
      .getPublicUrl(filename).data.publicUrl;
  
    // Insert new scan row
    const { data, error } = await supabase
      .from("rewind_scans")
      .insert([{
        user_id: user.id,
        image_filename: filename,
        image_url: imageUrl,
        captured_at: new Date().toISOString()
      }])
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
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const base64Image = base64.split(",")[1];
  
      // Roboflow request
      const result = await fetch("https://detect.roboflow.com/infer/workflows/sultup/detect-and-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.ROBOFLOW_API_KEY,
          inputs: { image: { type: "base64", value: base64Image } }
        })
      }).then(res => res.json());
  
      const detectedItem =
      result?.outputs?.[0]?.predictions?.predictions?.[0]?.class || "Unknown";

    // Show detection modal
    setDetectedLabel(detectedItem);
    setValuationLoading(true);
    setShowValuationModal(true);

    // Save results to scans table
    await supabase
      .from("rewind_scans")
      .update({ roboflow_results: result })
      .eq("scan_id", scanId);

    // 👇 simulate price model / valuation
    setTimeout(() => {
      setValuationLoading(false); // hide loading spinner
      // optionally show metadata/valuation UI
    }, 2500);

  } catch (err) {
    console.error("Roboflow error:", err);
  }
};
  
  
      // // Call Roboflow Hosted Workflow API
      // const apiResponse = await fetch(
      //   'https://detect.roboflow.com/infer/workflows/sultup/detect-and-classify',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({
      //       api_key: ROBOFLOW_API_KEY,
      //       inputs: {
      //         image: {
      //           type: 'base64',
      //           value: base64Image
      //         }
      //       }
      //     })
      //   }
      // )
  
      // if (!apiResponse.ok) {
      //   throw new Error("Failed to process image");
      // }
  
      // const result = await apiResponse.json();
      // setInferenceResults(result);


      // // Extract detected class
      // console.log("API Response:", JSON.stringify(result, null, 2));
  
      // if (
      //   result &&
      //   result.outputs &&
      //   result.outputs[0]?.predictions?.predictions &&
      //   result.outputs[0].predictions.predictions.length > 0
      // ) {
      //   const detectedItem = result.outputs[0].predictions.predictions[0].class;
      //   setDetectedClass(detectedItem);

      


  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri); // For preview display
  
      setLoading(true); // optional loading indicator
  
      const scan = await startScan(photo.uri);
      if (scan) {
        await runRoboflowAndUpdateScan(scan.scanId, photo.uri);
        // later: call OpenAI or price model here
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
      <Text style={{ color: textColor.secondary, fontWeight: "bold", fontSize: 14 }}>
        {label}:
      </Text>
      <Text style={{ color: textColor.primary, fontSize: 16 }}>{value || "N/A"}</Text>
    </View>
  );
  
  const renderResults = () => {
    return (
      
      <Modal visible={!!metadata} transparent animationType="slide">
      <GestureHandlerRootView style={{ flex: 1 }}>
    
        {metadata && (
           <View
           style={{
             flex: 1,
             backgroundColor: "rgba(0,0,0,0.85)",
             justifyContent: "center",
             alignItems: "center",
           }}
         >
           <View
             style={{
               width: "90%",
               backgroundColor: COLORS.softIvory,
               borderRadius: 20,
               padding: 0,
               overflow: "hidden",
             }}
           >
             {/* Header with Close Button */}
             <View
               style={{
                 flexDirection: "row",
                 justifyContent: "space-between",
                 alignItems: "center",
                 paddingHorizontal: 20,
                 paddingTop: 15,
                 paddingBottom: 10,
               }}
             >
               <Text
                 style={{
                   fontSize: 22,
                   fontWeight: "bold",
                   color: textColor.primary,
                   flex: 1,
                 }}
                 numberOfLines={2}
               >
                 {metadata.title}
               </Text>
               <TouchableOpacity
                 onPress={() => setMetadata(null)}
                 style={{ padding: 5 }}
               >
                 <Text style={{ fontSize: 24, color: textColor.primary }}>
                   ✖
                 </Text>
               </TouchableOpacity>
             </View>
 
             {/* Display User's Captured Image */}
             <Image
               source={{ uri: uri || '' }}
               style={{ width: "100%", height: 240, resizeMode: "cover" }}
             />
 
             {/* Price Badge */}
             {metadata.price && (
               <View
                 style={{
                   position: "absolute",
                   top: 240,
                   right: 20,
                   backgroundColor: COLORS.lightLime,
                   paddingVertical: 8,
                   paddingHorizontal: 15,
                   borderRadius: 20,
                   shadowColor: "#000",
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.3,
                   shadowRadius: 4,
                   elevation: 5,
                   transform: [{ translateY: -20 }],
                 }}
               >
                 <Text
                   style={{ fontSize: 18, fontWeight: "bold", color: textColor.primary }}
                 >
                   {metadata.price}
                 </Text>
               </View>
             )}
 
             {/* Product Details */}
             <ScrollView style={{ maxHeight: 350, paddingHorizontal: 20, paddingTop: 15 }}>
               {/* Description */}
               <Text style={{ color: COLORS.softPurple, marginBottom: 20, lineHeight: 22 }}>
                 {metadata.description}
               </Text>
 
               {/* Details in Two Columns */}
               <View style={{ flexDirection: "row", marginBottom: 20 }}>
                 {/* Left Column */}
                 <View style={{ flex: 1, marginRight: 10 }}>
                   <DetailItem label="Style" value={metadata.style} />
                   <DetailItem label="Period" value={metadata.period} />
                   <DetailItem label="Manufacturer" value={metadata.manufacturer} />
                   <DetailItem label="Materials" value={metadata.materials?.join(", ")} />
                 </View>
 
                 {/* Right Column */}
                 <View style={{ flex: 1, marginLeft: 10 }}>
                   <DetailItem label="Place of Origin" value={metadata.place_of_origin} />
                   <DetailItem label="Condition" value={metadata.condition} />
                   <DetailItem label="Dimensions" value={metadata.dimensions} />
                   <DetailItem label="Date of Manufacture" value={metadata.date_of_manufacture} />
                 </View>
               </View>
 
               {/* Horizontal Divider */}
               <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 10 }} />
 
               {/* Reference Information */}
               <View style={{ marginBottom: 20 }}>
                 <DetailItem label="Reference Number" value={metadata.reference_number} />
                 <DetailItem label="Seller Location" value={metadata.seller_location} />
               </View>
 
               {/* View More Button */}
               <TouchableOpacity
                 style={{
                   backgroundColor: COLORS.lightLime,
                   paddingVertical: 15,
                   borderRadius: 10,
                   alignItems: "center",
                   marginBottom: 25,
                 }}
                 onPress={() => metadata.link && Linking.openURL(metadata.link)}
               >
                 <Text style={{ color: textColor.primary, fontWeight: "bold", fontSize: 16 }}>
                   View Product
                 </Text>
               </TouchableOpacity>
             </ScrollView>
           </View>
           <Modal visible={showValuationModal} transparent animationType="fade">
  <View
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.8)",
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
    }}
  >
    <View
      style={{
        backgroundColor: "#fff",
        padding: 30,
        borderRadius: 20,
        alignItems: "center",
        width: "90%",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>
        Detected as: {detectedLabel}
      </Text>

      {valuationLoading ? (
        <>
          <ActivityIndicator size="large" color="#333" />
          <Text style={{ marginTop: 10, fontSize: 16 }}>
            Estimating valuation...
          </Text>
        </>
      ) : (
        <>
          <Text style={{ marginTop: 10, fontSize: 16 }}>
            Valuation complete!
          </Text>
          <Button title="Close" onPress={() => setShowValuationModal(false)} />
        </>
      )}
    </View>
  </View>
</Modal>

         </View>
        )}
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
        <Button onPress={() => {
          setUri(null);
          setInferenceResults(null);
          setDetectedClass(null);
          setError(null);
          slideDown();
        }} title="Take another picture" />
        {renderResults()}
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
        <View style={styles.shutterContainer}>
          <Pressable onPress={toggleMode}>
            {mode === "picture" ? (
              <AntDesign name="picture" size={32} color="charcoalBrown" />
            ) : (
              <Feather name="video" size={32} color="charcoalBrown" />
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
                      backgroundColor: mode === "picture" ? "charcoalBrown" : "red",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="charcoalBrown" />
          </Pressable>
        </View>
      </CameraView>
    );
  };
  const fetchMetadata = async (itemTitle: string) => {
    if (!itemTitle) return;
  
    try {
      const { data, error } = await supabase
        .from("product_metadata_test0")  // Replace with your actual table name
        .select("title, price, details") // Ensure "details" is selected
        .eq("title", itemTitle)
        .single(); // Fetch only one matching record
  
      if (error) throw error;
  
      if (data && data.details) {
        // Parse JSONB "details" column
        const details = data.details; // Supabase returns JSONB as an object in JavaScript
  
        setMetadata({
          title: data.title,
          price: data.price,
          ...details, // Spread the JSONB object into metadata state
        });
      } else {
        setMetadata(null);
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
      setMetadata(null);
    }
  };
  
    

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
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
    borderColor: "charcoalBrown",
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
});