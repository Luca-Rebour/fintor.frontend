import { APP_COLORS } from "../../constants/colors";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AppBottomSheetModal } from "./AppBottomSheetModal";
import { AppIcon } from "./AppIcon";

// Lazy load de iconos - solo se ejecuta cuando se necesita
let _iconOptionsCache: string[] | null = null;
function getIconOptions(): string[] {
  if (!_iconOptionsCache) {
    const LucideIcons = require("lucide-react-native/dist/esm/lucide-react-native.js") as Record<string, unknown>;
    _iconOptionsCache = Object.keys(LucideIcons)
      .filter((name) => /^[A-Z]/.test(name) && !name.endsWith("Icon"))
      .sort((a, b) => a.localeCompare(b));
  }
  return _iconOptionsCache;
}

export const ICON_COLOR_OPTIONS = [
  APP_COLORS.actionPrimary,
  APP_COLORS.actionSecondary,
  APP_COLORS.success,
  APP_COLORS.danger,
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
  APP_COLORS.danger,
  "#3B82F6",
  APP_COLORS.textMuted,
  "#4ADE80",
] as const;

const INITIAL_ICONS_BATCH = 40;
const ICONS_BATCH_STEP = 40;

// Componente memoizado para cada icono - evita re-renders innecesarios
const IconItem = memo(function IconItem({
  iconName,
  isSelected,
  onPress,
}: {
  iconName: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ width: "23%", minWidth: 64, height: 64 }}
      className={`rounded-xl border items-center justify-center ${
        isSelected ? "border-app-accentBlue bg-app-accentBlue/20" : "border-app-border bg-app-bgSecondary"
      }`}
    >
      <AppIcon name={iconName} size={16} color={isSelected ? APP_COLORS.actionPrimary : APP_COLORS.textSecondary} />
      <Text
        numberOfLines={1}
        className={`mt-1 text-[10px] ${isSelected ? "text-app-primary" : "text-app-textSecondary"}`}
      >
        {iconName}
      </Text>
    </Pressable>
  );
});

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
  iconListMaxHeight?: number;
  onIconListTouchStart?: () => void;
  onIconListTouchEnd?: () => void;
  useBottomSheetSelector?: boolean;
  bottomSheetSnapPoints?: Array<string | number>;
  bottomSheetTitle?: string;
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
  iconListMaxHeight = 260,
  onIconListTouchStart,
  onIconListTouchEnd,
  useBottomSheetSelector = false,
  bottomSheetSnapPoints = ["72%"],
  bottomSheetTitle = "Select icon",
}: IconColorPickerProps) {
  const [iconSearch, setIconSearch] = useState("");
  const [visibleIconCount, setVisibleIconCount] = useState(INITIAL_ICONS_BATCH);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  // Lazy load de iconos
  const iconOptions = useMemo(() => getIconOptions(), []);

  const filteredIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return iconOptions;
    }

    return iconOptions.filter((iconName) => iconName.toLowerCase().includes(normalizedSearch));
  }, [iconSearch, iconOptions]);

  // Callback estable para evitar re-renders
  const handleIconPress = useCallback(
    (iconName: string) => {
      onChangeIcon(iconName);
    },
    [onChangeIcon]
  );

  const visibleIcons = useMemo(() => filteredIcons.slice(0, visibleIconCount), [filteredIcons, visibleIconCount]);

  useEffect(() => {
    setVisibleIconCount(INITIAL_ICONS_BATCH);
  }, [iconSearch]);

  function renderIconSelectorContent() {
    const iconListContainerStyle = useBottomSheetSelector
      ? { flex: 1, minHeight: 0 }
      : { maxHeight: iconListMaxHeight };

    return (
      <>
        <View className="mt-3 rounded-xl border border-app-border bg-app-surface px-3 py-2 flex-row items-center">
          <AppIcon name="Search" size={15} color={APP_COLORS.textSecondary} />
          <TextInput
            value={iconSearch}
            onChangeText={setIconSearch}
            placeholder={searchPlaceholder}
            placeholderTextColor={APP_COLORS.textMuted}
            autoCapitalize="none"
            className="ml-2 flex-1 text-sm text-app-textPrimary"
          />
        </View>

        <Text className="text-app-textSecondary text-xs uppercase mt-4 mb-2">{iconSectionLabel}</Text>

        <View style={iconListContainerStyle}>
          <ScrollView
            style={useBottomSheetSelector ? { flex: 1 } : undefined}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            onTouchStart={() => {
              onIconListTouchStart?.();
            }}
            onTouchCancel={() => {
              onIconListTouchEnd?.();
            }}
            onTouchEnd={() => {
              onIconListTouchEnd?.();
            }}
            onScrollBeginDrag={() => {
              onIconListTouchStart?.();
            }}
            onScrollEndDrag={() => {
              onIconListTouchEnd?.();
            }}
            onMomentumScrollBegin={() => {
              onIconListTouchStart?.();
            }}
            onMomentumScrollEnd={() => {
              onIconListTouchEnd?.();
            }}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
              if (isCloseToBottom) {
                setVisibleIconCount((current) => {
                  if (current >= filteredIcons.length) {
                    return current;
                  }
                  return Math.min(current + ICONS_BATCH_STEP, filteredIcons.length);
                });
              }
            }}
            scrollEventThrottle={400}
            contentContainerStyle={{ paddingBottom: 6 }}
          >
            <View className="flex-row flex-wrap gap-2">
              {visibleIcons.length === 0 ? (
                <View className="w-full py-6">
                  <Text className="text-center text-sm text-app-textSecondary">No se encontraron iconos</Text>
                </View>
              ) : (
                visibleIcons.map((iconName) => (
                  <IconItem
                    key={iconName}
                    iconName={iconName}
                    isSelected={iconName === selectedIcon}
                    onPress={() => {
                      handleIconPress(iconName);
                      if (useBottomSheetSelector) {
                        setIsIconSelectorOpen(false);
                      }
                    }}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  return (
    <>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-app-textSecondary text-xs uppercase">{selectedIconLabel}</Text>
        <View className="flex-row items-center rounded-xl border border-app-border bg-app-surface px-3 py-2">
          <AppIcon name={selectedIcon} size={16} color={APP_COLORS.actionPrimary} />
          <Text className="ml-2 text-xs text-app-textPrimary">{selectedIcon}</Text>
        </View>
      </View>

      {useBottomSheetSelector ? (
        <Pressable
          onPress={() => setIsIconSelectorOpen(true)}
          className="mt-3 rounded-xl border border-app-border bg-app-surface px-3 py-3 flex-row items-center justify-between"
        >
          <Text className="text-sm text-app-textPrimary">Open icon selector</Text>
          <AppIcon name="ChevronDown" size={16} color={APP_COLORS.textSecondary} />
        </Pressable>
      ) : (
        renderIconSelectorContent()
      )}

      {showColorSection ? (
        <>
          <Text className="text-app-textSecondary text-xs uppercase mt-4 mb-2">{colorSectionLabel}</Text>
          <View className="rounded-xl border border-app-border bg-app-surface p-3 mb-2">
            <View className="flex-row flex-wrap gap-3">
              {ICON_COLOR_OPTIONS.map((color, index) => {
                const isSelected = color === selectedColor;
                return (
                  <Pressable
                    key={`${color}-${index}`}
                    onPress={() => onChangeColor(color)}
                    className={`h-10 w-10 rounded-full border-2 items-center justify-center ${
                      isSelected ? "border-white" : "border-app-border"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected ? <AppIcon name="Check" size={14} color={APP_COLORS.textPrimary} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      ) : null}

      <AppBottomSheetModal
        visible={useBottomSheetSelector && isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        snapPoints={bottomSheetSnapPoints}
        debugName="IconColorPickerSelect"
        stackBehavior="push"
      >
        <View className="px-5 pt-4 pb-2 border-b border-app-border">
          <Text className="text-app-textPrimary text-lg font-semibold">{bottomSheetTitle}</Text>
        </View>
        <View className="px-5 pb-4 flex-1">{renderIconSelectorContent()}</View>
      </AppBottomSheetModal>
    </>
  );
}

