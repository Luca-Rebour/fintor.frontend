import { RefObject, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getAccountsData } from "../../services/account.service";
import { getCategoriesData } from "../../services/categories.service";
import { getGoalsData } from "../../services/goals.service";
import { AccountOptionModel as AccountOption } from "../../types/models/account.model";
import { CategoryOptionModel as CategoryOption } from "../../types/models/category.model";
import { CreateTransactionInputModel as CreateTransactionDTO } from "../../types/models/transaction.model";
import { AppIcon } from "../shared/AppIcon";
import { AppBottomSheetModal } from "../shared/AppBottomSheetModal";

type GoalOption = {
  value: string;
  label: string;
};

const NO_GOAL_VALUE = "";
const NO_GOAL_LABEL = "No goal";

type CreateExpenseModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateExpense: (payload: CreateTransactionDTO) => void;
};

const DEFAULT_EXPENSE_ICON = "ShoppingCart";

const DROPDOWN_MAX_HEIGHT = 240;
const DROPDOWN_OFFSET = 6;
const DROPDOWN_ROW_HEIGHT = 48;
const DROPDOWN_HEADER_HEIGHT = 36;

function getEstimatedDropdownHeight(optionsCount: number) {
  const estimatedRowsHeight = optionsCount * DROPDOWN_ROW_HEIGHT;
  return Math.min(DROPDOWN_MAX_HEIGHT, DROPDOWN_HEADER_HEIGHT + estimatedRowsHeight);
}

function getOptionLabel(
  options: Array<{ label: string; value: string }>,
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function formatAccountOptionLabel(option: AccountOption) {
  const currencyCode = option.currencyCode?.trim().toUpperCase();
  return currencyCode ? `${option.label} (${currencyCode})` : option.label;
}

function getSelectedAccountLabel(options: AccountOption[], value: string) {
  const selected = options.find((option) => option.value === value);
  return selected ? formatAccountOptionLabel(selected) : value;
}

function isAccountOption(option: CategoryOption | AccountOption | GoalOption): option is AccountOption {
  return typeof (option as AccountOption).currencyCode === "string";
}

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
        <AppIcon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} color="#94A3B8" />
      </Pressable>
    </View>
  );
}

export function CreateExpenseModal({
  visible,
  onClose,
  onCreateExpense,
}: CreateExpenseModalProps) {
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [goalOptions, setGoalOptions] = useState<GoalOption[]>([{ value: NO_GOAL_VALUE, label: NO_GOAL_LABEL }]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [goal, setGoal] = useState(NO_GOAL_VALUE);
  const [amountError, setAmountError] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const categoryTriggerRef = useRef<View>(null);
  const accountTriggerRef = useRef<View>(null);
  const goalTriggerRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const activeSelectType = isCategoryOpen
    ? "category"
    : isAccountOpen
      ? "account"
      : isGoalOpen
        ? "goal"
      : null;

  const activeSelectOptions =
    activeSelectType === "category"
      ? categoryOptions
      : activeSelectType === "account"
        ? accountOptions
        : goalOptions;

  const activeSelectValue =
    activeSelectType === "category"
      ? category
      : activeSelectType === "account"
        ? account
        : goal;

  const activeSelectLabel =
    activeSelectType === "category"
      ? "Category"
      : activeSelectType === "account"
        ? "Account"
        : "Goal";

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isActive = true;

    async function loadSelectData() {
      const [categoriesData, accountsData, goalsData] = await Promise.all([
        getCategoriesData(),
        getAccountsData(),
        getGoalsData(),
      ]);

      if (!isActive) {
        return;
      }

      setCategoryOptions(categoriesData);
      setCategory((previous) =>
        categoriesData.some((option) => option.value === previous)
          ? previous
          : categoriesData[0]?.value ?? "",
      );

      setAccountOptions(accountsData);
      setAccount((previous) =>
        accountsData.some((option) => option.value === previous)
          ? previous
          : accountsData[0]?.value ?? "",
      );

      const goalSelectOptions: GoalOption[] = [
        { value: NO_GOAL_VALUE, label: NO_GOAL_LABEL },
        ...goalsData.map((goalItem) => ({
          value: goalItem.id,
          label: goalItem.title,
        })),
      ];

      setGoalOptions(goalSelectOptions);
      setGoal((previous) =>
        goalSelectOptions.some((option) => option.value === previous)
          ? previous
          : NO_GOAL_VALUE,
      );
    }

    loadSelectData();

    return () => {
      isActive = false;
    };
  }, [visible]);

  function openCategorySelect() {
    setIsAccountOpen(false);
    setIsGoalOpen(false);
    categoryTriggerRef.current?.measureInWindow((x, y, width, height) => {
      const estimatedHeight = getEstimatedDropdownHeight(categoryOptions.length);
      const top = Math.max(12, y - estimatedHeight - DROPDOWN_OFFSET);
      setDropdownPosition({ top, left: x, width });
      setIsCategoryOpen((prev) => !prev);
    });
  }

  function openAccountSelect() {
    setIsCategoryOpen(false);
    setIsGoalOpen(false);
    accountTriggerRef.current?.measureInWindow((x, y, width, height) => {
      const estimatedHeight = getEstimatedDropdownHeight(accountOptions.length);
      const top = Math.max(12, y - estimatedHeight - DROPDOWN_OFFSET);
      setDropdownPosition({ top, left: x, width });
      setIsAccountOpen((prev) => !prev);
    });
  }

  function openGoalSelect() {
    setIsCategoryOpen(false);
    setIsAccountOpen(false);
    goalTriggerRef.current?.measureInWindow((x, y, width, height) => {
      const estimatedHeight = getEstimatedDropdownHeight(goalOptions.length);
      const top = Math.max(12, y - estimatedHeight - DROPDOWN_OFFSET);
      setDropdownPosition({ top, left: x, width });
      setIsGoalOpen((prev) => !prev);
    });
  }

  function resetForm() {
    setAmount("");
    setDescription("");
    setCategory(categoryOptions[0]?.value ?? "");
    setAccount(accountOptions[0]?.value ?? "");
    setGoal(NO_GOAL_VALUE);
    setAmountError("");
    setIsCategoryOpen(false);
    setIsAccountOpen(false);
    setIsGoalOpen(false);
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
      transactionType: 1,
      categoryId: category,
      icon: DEFAULT_EXPENSE_ICON,
      accountId: account,
      goalId: goal || null,
      exchangeRate: null,
    });

    resetForm();
    onClose();
  }

  return (
    <AppBottomSheetModal visible={visible} onClose={handleClose} snapPoints={["92%"]} debugName="CreateExpenseModal">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
          <View className="h-full max-h-[92%] rounded-t-3xl border-t border-[#1E2A47] bg-[#111C33]">
            <View className="px-5 pt-4 pb-3 border-b border-[#1E2A47] flex-row items-center justify-between">
              <Text className="text-app-textPrimary text-xl font-bold">Add New Expense</Text>
              <Pressable onPress={handleClose} className="p-1">
                <AppIcon name="X" size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView
              className="px-5 py-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
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
              value={getOptionLabel(categoryOptions, category)}
              isOpen={isCategoryOpen}
              onToggle={openCategorySelect}
              triggerRef={categoryTriggerRef}
            />

            <SelectField
              label="Account"
              value={getSelectedAccountLabel(accountOptions, account)}
              isOpen={isAccountOpen}
              onToggle={openAccountSelect}
              triggerRef={accountTriggerRef}
            />

            <SelectField
              label="Goal (optional)"
              value={getOptionLabel(goalOptions, goal)}
              isOpen={isGoalOpen}
              onToggle={openGoalSelect}
              triggerRef={goalTriggerRef}
            />
          </ScrollView>

            <View className="px-5 py-4 border-t border-[#1E2A47]">
              <Pressable
                onPress={handleCreate}
                className="items-center justify-center py-4 rounded-2xl bg-[#EF4444]"
              >
                <Text className="text-white text-base font-bold">Create Expense</Text>
              </Pressable>
            </View>
          </View>

          {activeSelectType ? (
            <>
              <Pressable
                onPress={() => {
                  setIsCategoryOpen(false);
                  setIsAccountOpen(false);
                  setIsGoalOpen(false);
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
                  const optionLabel =
                    activeSelectType === "account" && isAccountOption(option)
                      ? formatAccountOptionLabel(option)
                      : option.label;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        if (activeSelectType === "category") {
                          setCategory(option.value);
                        } else if (activeSelectType === "account") {
                          setAccount(option.value);
                        } else {
                          setGoal(option.value);
                        }
                        setIsCategoryOpen(false);
                        setIsAccountOpen(false);
                        setIsGoalOpen(false);
                      }}
                      className="px-3 py-3 flex-row items-center justify-between border-b border-[#1E2A47]"
                    >
                      <Text
                        className={`text-sm ${
                          isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"
                        }`}
                      >
                        {optionLabel}
                      </Text>
                      {isSelected ? <AppIcon name="Check" size={14} color="#18C8FF" /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
              </View>
            </>
          ) : null}
      </KeyboardAvoidingView>
    </AppBottomSheetModal>
  );
}
