import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const API_KEY = "vAQ3rXRm1GwuSGX7fI0s";
const MODEL = "test-model-0.1";
const VERSION = 1;

interface InferenceResult {
  predictions: { class: string; confidence: number; x: number; y: number; width: number; height: number }[];
}

interface BoundingBoxProps {
  prediction: { class: string; confidence: number; x: number; y: number; width: number; height: number };
  imageWidth: number;
  imageHeight: number;
  displayWidth: number;
  displayHeight: number;
}

const BoundingBox: React.FC<BoundingBoxProps> = ({ prediction, imageWidth, imageHeight, displayWidth, displayHeight }) => {
  const confidence = (prediction.confidence * 100).toFixed(0);

  // Scale coordinates from original image to displayed size
  const scaleX = displayWidth / imageWidth;
  const scaleY = displayHeight / imageHeight;
  const left = prediction.x * scaleX;
  const top = prediction.y * scaleY;
  const width = prediction.width * scaleX;
  const height = prediction.height * scaleY;

  return (
    <View
      style={{
        position: "absolute",
        left: left,
        top: top,
        width: width,
        height: height,
        borderWidth: 2,
        borderColor: "#FF0000", // Red to match Roboflow CodePen
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -20, // Offset above the box
          left: 0,
          backgroundColor: "white",
          paddingHorizontal: 6,
          paddingVertical: 3,
          borderRadius: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2, // Android shadow
        }}
      >
        <Text style={styles.labelText}>{`${prediction.class} ${confidence}%`}</Text>
      </View>
    </View>
  );
};

const IMAGE_CONTAINER_SIZE = 350; // Slightly larger for a modern feel

const InferenceScreen: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<Image>(null);

  const handleRunInference = async () => {
    if (!imageUrl.trim()) {
      setError("Please enter a valid image URL.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null); // Reset previous results

    try {
      const response = await axios.post<InferenceResult>(
        `https://detect.roboflow.com/${MODEL}/${VERSION}?api_key=${API_KEY}&image=${encodeURIComponent(imageUrl)}`,
        {},
        { timeout: 10000 } // Add timeout for robustness
      );
      setResult(response.data);
      console.log("Inference result:", response.data);
    } catch (err) {
      console.error("Inference Error:", err);
      setError(
        err.response?.data?.error || "Failed to run inference. Check your API key, model, or network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get original image dimensions
  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => setImageDimensions({ width, height }),
        (error) => {
          console.error("Failed to get image size:", error);
          setError("Invalid or inaccessible image URL.");
        }
      );
    }
  }, [imageUrl]);

  // Calculate display dimensions based on container and aspect ratio
  const displayDimensions = imageDimensions
    ? {
        width: Math.min(IMAGE_CONTAINER_SIZE - 20, (IMAGE_CONTAINER_SIZE - 20) * (imageDimensions.width / imageDimensions.height)),
        height: Math.min(IMAGE_CONTAINER_SIZE - 20, (IMAGE_CONTAINER_SIZE - 20) * (imageDimensions.height / imageDimensions.width)),
      }
    : { width: IMAGE_CONTAINER_SIZE - 20, height: IMAGE_CONTAINER_SIZE - 20 };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Plutus AI Inference</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Image URL"
          placeholderTextColor="#A0A0A0"
          value={imageUrl}
          onChangeText={(text) => {
            setImageUrl(text);
            setError(null); // Clear error on input change
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        {imageUrl && (
          <View style={[styles.imageContainer, { width: IMAGE_CONTAINER_SIZE, height: IMAGE_CONTAINER_SIZE }]}>
            <Image
              ref={imageRef}
              source={{ uri: imageUrl }}
              style={{ width: displayDimensions.width, height: displayDimensions.height, resizeMode: "contain", borderRadius: 12 }}
              onError={() => setError("Failed to load image. Check the URL.")}
              onLoad={() => {
                if (!imageDimensions) {
                  Image.getSize(
                    imageUrl,
                    (width, height) => setImageDimensions({ width, height }),
                    (error) => {
                      console.error("Image load error:", error);
                      setError("Invalid image format or URL.");
                    }
                  );
                }
              }}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#8B3DFF" />
              </View>
            )}
            {result?.predictions && imageDimensions && !loading && (
              result.predictions.map((prediction, index) => (
                <BoundingBox
                  key={index}
                  prediction={prediction}
                  imageWidth={imageDimensions.width}
                  imageHeight={imageDimensions.height}
                  displayWidth={displayDimensions.width}
                  displayHeight={displayDimensions.height}
                />
              ))
            )}
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRunInference}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Run Inference</Text>
        </TouchableOpacity>

        {result && !loading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Inference Results</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resultsScroll}>
              {result.predictions.map((pred, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultText}>
                    {`${pred.class}: ${(pred.confidence * 100).toFixed(0)}%`}
                  </Text>
                  <Text style={styles.resultCoords}>
                    Position: ({pred.x.toFixed(2)}, {pred.y.toFixed(2)})
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#DFCEF3", 
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  container: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white", 
    marginBottom: 8,
    fontFamily: "System",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  errorText: {
    color: "#D32F2F", // Red for errors
    fontSize: 14,
    marginTop: 4,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // Android shadow
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#DFCEF3", // White background for button
    borderWidth: 2,
    borderColor: "white", // Purple border
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20, // Rounded corners matching the screenshot
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white", // Purple text matching Plutus
    fontSize: 16,
    fontWeight: "600",
  },
  labelText: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
  },
  resultsContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B3DFF",
    marginBottom: 12,
  },
  resultsScroll: {
    maxHeight: 120,
  },
  resultItem: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    minWidth: 120,
  },
  resultText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  resultCoords: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});

export default InferenceScreen;