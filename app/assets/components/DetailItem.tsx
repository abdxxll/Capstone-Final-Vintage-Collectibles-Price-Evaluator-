import { StyleSheet, Text, View } from "react-native";
import { textColor } from "../../../styles/theme";

type DetailItemProps = {
  label: string;
  value?: string;
};

const DetailItem = ({ label, value }: DetailItemProps) => {
  if (!value) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export default DetailItem;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
});
