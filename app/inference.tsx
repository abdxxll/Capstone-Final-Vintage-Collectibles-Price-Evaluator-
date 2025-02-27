import axios from "axios";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_KEY = "vAQ3rXRm1GwuSGX7fI0s";
const MODEL = "test-model-0.1";
const VERSION = 1;

// Define types for API response
interface InferenceResult {
  predictions: { class: string; confidence: number; x: number; y: number; width: number; height: number }[];
}

interface BoundingBoxProps {
  prediction: {
    class: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const BoundingBox: React.FC<BoundingBoxProps> = ({ prediction }) => {
  const confidence = (prediction.confidence * 100).toFixed(0);
  
  return (
    <View
      style={{
        position: 'absolute',
        left: prediction.x,
        top: prediction.y,
        width: prediction.width,
        height: prediction.height,
        borderWidth: 2,
        borderColor: '#8B3DFF',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{`${prediction.class} ${confidence}%`}</Text>
      </View>
    </View>
  );
};

const IMAGE_CONTAINER_SIZE = 300;

const InferenceScreen: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunInference = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "Please enter an image URL.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post<InferenceResult>(
        `https://detect.roboflow.com/${MODEL}/${VERSION}?api_key=${API_KEY}&image=${encodeURIComponent(imageUrl)}`
      );
      setResult(response.data);
      console.log("Inference result:", response.data);
    } catch (error) {
      console.error("Inference Error:", error);
      Alert.alert("Error", "Failed to run inference. Check your API key and model settings.");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Plutus Inference</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Image URL"
          placeholderTextColor="#666"
          value={imageUrl}
          onChangeText={setImageUrl}
        />
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
            />
            {result?.predictions?.map((prediction, index) => (
              <BoundingBox
                key={index}
                prediction={prediction}
              />
            ))}
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRunInference}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Running..." : "Run Inference"}
          </Text>
        </TouchableOpacity>
        
        {result && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Results:</Text>
            <Text style={styles.debugText}>Number of predictions: {result.predictions?.length || 0}</Text>
            {result.predictions?.map((pred, index) => (
              <Text key={index} style={styles.debugText}>
                {`${pred.class}: ${(pred.confidence * 100).toFixed(0)}% at (${pred.x.toFixed(0)}, ${pred.y.toFixed(0)})`}
              </Text>
            ))}
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
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#8B3DFF",
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white",
    color: "#333",
  },
  imageContainer: {
    position: 'relative',
    width: IMAGE_CONTAINER_SIZE,
    height: IMAGE_CONTAINER_SIZE,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  image: {
    width: IMAGE_CONTAINER_SIZE - 20,
    height: IMAGE_CONTAINER_SIZE - 20,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: "#8B3DFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  labelContainer: {
    backgroundColor: '#8B3DFF',
    padding: 4,
    borderRadius: 4,
    marginTop: -24,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    borderColor: "#8B3DFF",
    borderWidth: 1,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#8B3DFF",
  },
  debugText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
});

export default InferenceScreen;
