import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { textColor } from "../../../styles/theme";

type ScanCardProps = {
  title: string;
  imageUrl: string;
  date: string;
  onPress: () => void;
};

const ScanCard = ({ title, imageUrl, date, onPress }: ScanCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.footer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ScanCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  footer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: textColor.primary,
  },
  date: {
    fontSize: 13,
    color: textColor.secondary,
    marginTop: 4,
  },
});
