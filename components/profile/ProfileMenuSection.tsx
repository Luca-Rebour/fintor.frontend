import { Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

import { ProfileMenuSection as ProfileMenuSectionType } from "../../types/profile";

type ProfileMenuSectionProps = {
  section: ProfileMenuSectionType;
};

export function ProfileMenuSection({ section }: ProfileMenuSectionProps) {
  return (
    <View className="mb-4 rounded-2xl bg-app-cardSoft px-4 py-2">
      {section.items.map((item, index) => (
        <View
          key={item.id}
          className={`flex-row items-center justify-between py-4 ${index < section.items.length - 1 ? "border-b border-app-border" : ""}`}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-app-primary/20">
              <AppIcon name={item.icon} size={17} color="#18C8FF" />
            </View>
            <Text className="text-lg font-semibold text-app-textPrimary">{item.title}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            {item.badgeText ? (
              <Text className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                {item.badgeText}
              </Text>
            ) : null}
            <AppIcon name="ChevronRight" size={16} color="#94A3B8" />
          </View>
        </View>
      ))}
    </View>
  );
}
