import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { AppIcon } from "./AppIcon";

const LucideIcons = require("lucide-react-native/dist/esm/lucide-react-native.js") as Record<string, unknown>;

const ICON_OPTIONS = Object.keys(LucideIcons)
  .filter((name) => /^[A-Z]/.test(name) && !name.endsWith("Icon"))
  .sort((a, b) => a.localeCompare(b));

export const ICON_COLOR_OPTIONS = [
  "#18C8FF",
  "#B63BFF",
  "#22C55E",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#14B8A6",
  "#8B5CF6",
  "#EC4899",
  "#0EA5E9",
  "#10B981",
  "#EAB308",
  "#6366F1",
  "#84CC16",
  "#06B6D4",
  "#A855F7",
  "#F43F5E",
  "#3B82F6",
  "#64748B",
  "#4ADE80",
] as const;

const INITIAL_ICONS_BATCH = 40;
const ICONS_BATCH_STEP = 40;

type IconColorPickerProps = {
  selectedIcon: string;
  selectedColor: string;
  onChangeIcon: (icon: string) => void;
  onChangeColor: (color: string) => void;
  selectedIconLabel?: string;
  searchPlaceholder?: string;
  iconSectionLabel?: string;
  colorSectionLabel?: string;
  showColorSection?: boolean;
};

export function IconColorPicker({
  selectedIcon,
  selectedColor,
  onChangeIcon,
  onChangeColor,
  selectedIconLabel = "Selected icon",
  searchPlaceholder = "Buscar icono por nombre",
  iconSectionLabel = "Icons",
  colorSectionLabel = "Color",
  showColorSection = true,
}: IconColorPickerProps) {
  const [iconSearch, setIconSearch] = useState("");
  const [visibleIconCount, setVisibleIconCount] = useState(INITIAL_ICONS_BATCH);

  const filteredIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return ICON_OPTIONS;
    }

    return ICON_OPTIONS.filter((iconName) => iconName.toLowerCase().includes(normalizedSearch));
  }, [iconSearch]);

  const visibleIcons = useMemo(() => filteredIcons.slice(0, visibleIconCount), [filteredIcons, visibleIconCount]);

  useEffect(() => {
    setVisibleIconCount(INITIAL_ICONS_BATCH);
  }, [iconSearch]);

  return (
    <>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-app-textSecondary text-xs uppercase">{selectedIconLabel}</Text>
        <View className="flex-row items-center rounded-xl border border-[#1E2A47] bg-[#0C1830] px-3 py-2">
          <AppIcon name={selectedIcon} size={16} color="#18C8FF" />
          <Text className="ml-2 text-xs text-app-textPrimary">{selectedIcon}</Text>
        </View>
      </View>

      <View className="mt-3 rounded-xl border border-[#1E2A47] bg-[#0C1830] px-3 py-2 flex-row items-center">
        <AppIcon name="Search" size={15} color="#94A3B8" />
        <TextInput
          value={iconSearch}
          onChangeText={setIconSearch}
          placeholder={searchPlaceholder}
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          className="ml-2 flex-1 text-sm text-app-textPrimary"
        />
      </View>

      <Text className="text-app-textSecondary text-xs uppercase mt-4 mb-2">{iconSectionLabel}</Text>

      <FlatList
        data={visibleIcons}
        keyExtractor={(item) => item}
        numColumns={4}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        initialNumToRender={24}
        maxToRenderPerBatch={28}
        windowSize={7}
        style={{ maxHeight: 260 }}
        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
        contentContainerStyle={{ paddingBottom: 6 }}
        onEndReachedThreshold={0.35}
        onEndReached={() => {
          setVisibleIconCount((current) => {
            if (current >= filteredIcons.length) {
              return current;
            }

            return Math.min(current + ICONS_BATCH_STEP, filteredIcons.length);
          });
        }}
        renderItem={({ item: iconName }) => {
          const isSelected = iconName === selectedIcon;

          return (
            <Pressable
              onPress={() => onChangeIcon(iconName)}
              style={{ width: "23%", minWidth: 64, height: 64 }}
              className={`rounded-xl border items-center justify-center ${
                isSelected ? "border-[#18C8FF] bg-[#10314A]" : "border-[#1E2A47] bg-[#111C33]"
              }`}
            >
              <AppIcon name={iconName} size={16} color={isSelected ? "#18C8FF" : "#94A3B8"} />
              <Text
                numberOfLines={1}
                className={`mt-1 text-[10px] ${isSelected ? "text-app-primary" : "text-app-textSecondary"}`}
              >
                {iconName}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="py-6">
            <Text className="text-center text-sm text-app-textSecondary">No se encontraron iconos</Text>
          </View>
        }
      />

      {showColorSection ? (
        <>
          <Text className="text-app-textSecondary text-xs uppercase mt-4 mb-2">{colorSectionLabel}</Text>
          <View className="rounded-xl border border-[#1E2A47] bg-[#0C1830] p-3 mb-2">
            <View className="flex-row flex-wrap gap-3">
              {ICON_COLOR_OPTIONS.map((color) => {
                const isSelected = color === selectedColor;
                return (
                  <Pressable
                    key={color}
                    onPress={() => onChangeColor(color)}
                    className={`h-10 w-10 rounded-full border-2 items-center justify-center ${
                      isSelected ? "border-white" : "border-[#1E2A47]"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected ? <AppIcon name="Check" size={14} color="#FFFFFF" /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      ) : null}
    </>
  );
}
