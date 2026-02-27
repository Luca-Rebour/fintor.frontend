import { Feather } from "@expo/vector-icons";
import { RefObject, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type SelectOption = {
  label: string;
  value: string;
};

type CreateExpensePayload = {
  amount: number;
  description: string;
  category: string;
  icon: string;
  account: string;
};

type CreateExpenseModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateExpense: (payload: CreateExpensePayload) => void;
};

const CATEGORY_OPTIONS: SelectOption[] = [
  { label: "Food & Dining", value: "Food & Dining" },
  { label: "Transport", value: "Transport" },
  { label: "Shopping", value: "Shopping" },
  { label: "Bills", value: "Bills" },
  { label: "Entertainment", value: "Entertainment" },
];

const ACCOUNT_OPTIONS: SelectOption[] = [
  { label: "Checking Account", value: "Checking Account" },
  { label: "Savings Account", value: "Savings Account" },
  { label: "Credit Card", value: "Credit Card" },
  { label: "Cash", value: "Cash" },
];

const ICON_OPTIONS = [
  "shopping-cart",
  "coffee",
  "navigation",
  "home",
  "film",
  "smartphone",
  "package",
  "shopping-bag",
  "truck",
  "tag",
] as const;

function SelectField({
  label,
  value,
  isOpen,
  onToggle,
  triggerRef,
}: {
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  triggerRef: RefObject<View | null>;
}) {
  return (
    <View className="mt-3">
      <Text className="text-app-textSecondary text-xs uppercase mb-2">{label}</Text>
      <Pressable
        ref={triggerRef}
        onPress={onToggle}
        className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 flex-row items-center justify-between"
      >
        <Text className="text-app-textPrimary text-sm">{value}</Text>
        <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
      </Pressable>
    </View>
  );
}

export function CreateExpenseModal({
  visible,
  onClose,
  onCreateExpense,
}: CreateExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [icon, setIcon] = useState<(typeof ICON_OPTIONS)[number]>(ICON_OPTIONS[0]);
  const [account, setAccount] = useState(ACCOUNT_OPTIONS[0].value);
  const [amountError, setAmountError] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const categoryTriggerRef = useRef<View>(null);
  const accountTriggerRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const activeSelectType = isCategoryOpen
    ? "category"
    : isAccountOpen
      ? "account"
      : null;

  const activeSelectOptions =
    activeSelectType === "category" ? CATEGORY_OPTIONS : ACCOUNT_OPTIONS;

  const activeSelectValue = activeSelectType === "category" ? category : account;

  const activeSelectLabel = activeSelectType === "category" ? "Category" : "Account";

  function openCategorySelect() {
    setIsAccountOpen(false);
    categoryTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({ top: y + height + 6, left: x, width });
      setIsCategoryOpen((prev) => !prev);
    });
  }

  function openAccountSelect() {
    setIsCategoryOpen(false);
    accountTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({ top: y + height + 6, left: x, width });
      setIsAccountOpen((prev) => !prev);
    });
  }

  function resetForm() {
    setAmount("");
    setDescription("");
    setCategory(CATEGORY_OPTIONS[0].value);
    setIcon(ICON_OPTIONS[0]);
    setAccount(ACCOUNT_OPTIONS[0].value);
    setAmountError("");
    setIsCategoryOpen(false);
    setIsAccountOpen(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleCreate() {
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Enter a valid amount greater than 0");
      return;
    }

    onCreateExpense({
      amount: parsedAmount,
      description: description.trim(),
      category,
      icon,
      account,
    });

    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/60 justify-center px-4">
        <View className="bg-[#111C33] border border-[#1E2A47] rounded-2xl max-h-[90%]">
          <View className="px-4 pt-4 pb-3 border-b border-[#1E2A47] flex-row items-center justify-between">
            <Text className="text-app-textPrimary text-base font-semibold">Create Expense</Text>
            <Pressable onPress={handleClose} className="p-1">
              <Feather name="x" size={18} color="#94A3B8" />
            </Pressable>
          </View>

          <ScrollView className="px-4 py-3" showsVerticalScrollIndicator={false}>
            <Text className="text-app-textSecondary text-xs uppercase mb-2">Amount</Text>
            <TextInput
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (amountError) {
                  setAmountError("");
                }
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#64748B"
              className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 text-app-textPrimary"
            />
            {amountError ? <Text className="text-red-400 text-xs mt-2">{amountError}</Text> : null}

            <Text className="text-app-textSecondary text-xs uppercase mt-3 mb-2">Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add details"
              placeholderTextColor="#64748B"
              className="bg-[#0C1830] border border-[#1E2A47] rounded-xl px-3 py-3 text-app-textPrimary"
            />

            <SelectField
              label="Category"
              value={category}
              isOpen={isCategoryOpen}
              onToggle={openCategorySelect}
              triggerRef={categoryTriggerRef}
            />

            <View className="mt-3">
              <Text className="text-app-textSecondary text-xs uppercase mb-2">Icon</Text>
              <View className="flex-row flex-wrap gap-2">
                {ICON_OPTIONS.map((iconName) => {
                  const selected = iconName === icon;
                  return (
                    <Pressable
                      key={iconName}
                      onPress={() => setIcon(iconName)}
                      className={`w-10 h-10 rounded-xl border items-center justify-center ${
                        selected ? "border-[#18C8FF] bg-[#10314A]" : "border-[#1E2A47] bg-[#0C1830]"
                      }`}
                    >
                      <Feather name={iconName} size={16} color={selected ? "#18C8FF" : "#94A3B8"} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <SelectField
              label="Account"
              value={account}
              isOpen={isAccountOpen}
              onToggle={openAccountSelect}
              triggerRef={accountTriggerRef}
            />
          </ScrollView>

          <View className="px-4 py-3 border-t border-[#1E2A47] flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center justify-center py-3 rounded-xl border border-[#1E2A47]"
            >
              <Text className="text-app-textPrimary font-semibold">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleCreate}
              className="flex-1 items-center justify-center py-3 rounded-xl bg-[#EF4444]"
            >
              <Text className="text-white font-semibold">Create Expense</Text>
            </Pressable>
          </View>
        </View>

        {activeSelectType ? (
          <>
            <Pressable
              onPress={() => {
                setIsCategoryOpen(false);
                setIsAccountOpen(false);
              }}
              style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            />

            <View
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 999,
                elevation: 24,
                maxHeight: 240,
              }}
              className="bg-[#0C1830] border border-[#1E2A47] rounded-xl overflow-hidden"
            >
              <View className="px-3 py-2 border-b border-[#1E2A47]">
                <Text className="text-app-textSecondary text-xs uppercase">
                  Select {activeSelectLabel}
                </Text>
              </View>

              <ScrollView nestedScrollEnabled>
                {activeSelectOptions.map((option) => {
                  const isSelected = option.value === activeSelectValue;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        if (activeSelectType === "category") {
                          setCategory(option.value);
                        } else {
                          setAccount(option.value);
                        }
                        setIsCategoryOpen(false);
                        setIsAccountOpen(false);
                      }}
                      className="px-3 py-3 flex-row items-center justify-between border-b border-[#1E2A47]"
                    >
                      <Text
                        className={`text-sm ${
                          isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"
                        }`}
                      >
                        {option.label}
                      </Text>
                      {isSelected ? <Feather name="check" size={14} color="#18C8FF" /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </>
        ) : null}
      </View>
    </Modal>
  );
}

export type { CreateExpensePayload };
