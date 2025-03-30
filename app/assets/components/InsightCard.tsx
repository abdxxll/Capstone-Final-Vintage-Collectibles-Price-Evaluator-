// InsightCard.tsx
import React from "react";
import { Text, View } from "react-native";

interface InsightCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, value, icon, color }) => {
  return (
    <View className="flex-row items-center justify-between bg-white/10 p-4 rounded-xl border-l-4 mb-4" style={{ borderLeftColor: color }}>
      <View>
        <Text className="text-sm text-neutral-400">{title}</Text>
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{value}</Text>
      </View>
      <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: color + '20' }}>
        {icon}
      </View>
    </View>
  );
};
