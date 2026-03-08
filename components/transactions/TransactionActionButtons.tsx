import { APP_COLORS } from "../../constants/colors";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../shared/AppIcon";
import { AppBottomSheetModal } from "../shared/AppBottomSheetModal";

type TransactionActionButtonsProps = {
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onAddCategory?: () => void;
  onMenuOpen?: () => void;
};

export function TransactionActionButtons({
  onAddExpense,
  onAddIncome,
  onAddCategory,
  onMenuOpen,
}: TransactionActionButtonsProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleActionPress(action?: () => void) {
    setIsMenuOpen(false);
    action?.();
  }

  return (
    <>
      <View className="absolute bottom-6 right-4 items-end">
        <Pressable
          onPress={() =>
            setIsMenuOpen((previous) => {
              const nextValue = !previous;
              if (nextValue) {
                onMenuOpen?.();
              }
              return nextValue;
            })
          }
          style={{ backgroundColor: APP_COLORS.actionPrimary }}
          className="h-16 w-16 items-center justify-center rounded-full border border-app-border"
        >
          <AppIcon name="Plus" size={26} color={APP_COLORS.textPrimary} />
        </Pressable>
      </View>

      <AppBottomSheetModal
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        snapPoints={["34%"]}
        debugName="Transactions:ActionsMenu"
      >
        <View className="px-4 py-3 border-b border-app-border">
          <Text className="text-base font-semibold text-app-textPrimary">Transactions</Text>
        </View>
        <View className="px-3 py-2">
          <Pressable
            onPress={() => handleActionPress(onAddIncome)}
            className="px-4 py-3.5 min-h-14 flex-row items-center rounded-xl"
          >
            <AppIcon name="DollarSign" size={18} color={APP_COLORS.success} />
            <Text className="ml-3 text-base font-semibold text-app-textPrimary">{t("transactions.actions.addIncome")}</Text>
          </Pressable>

          <Pressable
            onPress={() => handleActionPress(onAddExpense)}
            className="px-4 py-3.5 min-h-14 flex-row items-center rounded-xl"
          >
            <AppIcon name="CircleMinus" size={18} color={APP_COLORS.danger} />
            <Text className="ml-3 text-base font-semibold text-app-textPrimary">{t("transactions.actions.addExpense")}</Text>
          </Pressable>

          <Pressable
            onPress={() => handleActionPress(onAddCategory)}
            className="px-4 py-3.5 min-h-14 flex-row items-center rounded-xl"
          >
            <AppIcon name="Tag" size={18} color="#C084FC" />
            <Text className="ml-3 text-base font-semibold text-app-textPrimary">{t("transactions.actions.addCategory")}</Text>
          </Pressable>
        </View>
      </AppBottomSheetModal>
    </>
  );
}

