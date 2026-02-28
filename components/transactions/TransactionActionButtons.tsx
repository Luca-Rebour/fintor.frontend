import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

import { APP_COLORS } from "../../constants/colors";

type TransactionActionButtonsProps = {
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onAddAccount?: () => void;
  onAddCategory?: () => void;
  onMenuOpen?: () => void;
};

export function TransactionActionButtons({
  onAddExpense,
  onAddIncome,
  onAddAccount,
  onAddCategory,
  onMenuOpen,
}: TransactionActionButtonsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleActionPress(action?: () => void) {
    setIsMenuOpen(false);
    action?.();
  }

  return (
    <>
      {isMenuOpen ? (
        <Pressable
          onPress={() => setIsMenuOpen(false)}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : null}

      <View className="absolute bottom-6 right-4 items-end">
        {isMenuOpen ? (
          <View className="mb-3 w-56 bg-[#0C1830] border border-[#1E2A47] rounded-2xl p-2">
            <Pressable
              onPress={() => handleActionPress(onAddIncome)}
              className="px-4 py-3.5 min-h-14 flex-row items-center rounded-xl"
            >
              <AppIcon name="DollarSign" size={18} color="#22C55E" />
              <Text className="ml-3 text-base font-semibold text-app-textPrimary">Add Income</Text>
            </Pressable>

            <Pressable
              onPress={() => handleActionPress(onAddExpense)}
              className="px-4 py-3.5 min-h-14 flex-row items-center rounded-xl"
            >
              <AppIcon name="CircleMinus" size={18} color="#EF4444" />
              <Text className="ml-3 text-base font-semibold text-app-textPrimary">Add Expense</Text>
            </Pressable>

            <Pressable
              onPress={() => handleActionPress(onAddAccount)}
              className="px-4 py-3.5 min-h-14 flex-row items-center rounded-xl"
            >
              <AppIcon name="CreditCard" size={18} color={APP_COLORS.actionPrimary} />
              <Text className="ml-3 text-base font-semibold text-app-textPrimary">Add Account</Text>
            </Pressable>

            <Pressable
              onPress={() => handleActionPress(onAddCategory)}
              className="px-4 py-3.5 min-h-14 flex-row items-center rounded-xl"
            >
              <AppIcon name="Tag" size={18} color="#C084FC" />
              <Text className="ml-3 text-base font-semibold text-app-textPrimary">Add Category</Text>
            </Pressable>
          </View>
        ) : null}

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
          className="h-16 w-16 items-center justify-center rounded-full border border-[#1E2A47]"
        >
          <AppIcon name="Plus" size={26} color="#FFFFFF" />
        </Pressable>
      </View>
    </>
  );
}
