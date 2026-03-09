import { APP_COLORS } from "../../constants/colors";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { RecurringAdminFormModal } from "../../components/recurringAdmin/RecurringAdminFormModal";
import { RecurringAdminHeader } from "../../components/recurringAdmin/RecurringAdminHeader";
import { RecurringAdminItem } from "../../components/recurringAdmin/RecurringAdminItem";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactionsList,
  updateRecurringTransaction,
} from "../../services/recurringTransactions.service";
import { getAccountsData } from "../../services/account.service";
import { getCategoriesData } from "../../services/categories.service";
import { getGoalsData } from "../../services/goals.service";
import { Frequency } from "../../types/enums/frequency";
import { TransactionType } from "../../types/enums/transactionType";
import { CreateRecurringTransactionInput, RecurringTransactionApiDTO, UpdateRecurringTransactionInput } from "../../types/recurring";
import { AccountOptionModel as AccountOption } from "../../types/models/account.model";
import { CategoryOptionModel as CategoryOption } from "../../types/models/category.model";
import { AppIcon } from "../../components/shared/AppIcon";
import { resolveApiErrorMessage } from "../../i18n/resolve-api-error-message";

type GoalOption = {
  value: string;
  label: string;
};

const NO_GOAL_VALUE = "";
const NO_GOAL_LABEL = "No goal";

const DEFAULT_FORM: CreateRecurringTransactionInput = {
  name: "",
  description: "",
  amount: 0,
  accountId: "",
  categoryId: "",
  goalId: NO_GOAL_VALUE,
  startDate: "",
  endDate: "",
  transactionType: TransactionType.Expense,
  frequency: Frequency.Monthly,
};

function toDateInputValue(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function toFormState(transaction: RecurringTransactionApiDTO): CreateRecurringTransactionInput {
  const maybeTransactionWithIds = transaction as RecurringTransactionApiDTO & {
    accountId?: string;
    categoryId?: string;
    goalId?: string | null;
  };

  return {
    name: transaction.name || "",
    description: transaction.description || "",
    amount: Math.abs(Number(transaction.amount) || 0),
    accountId: maybeTransactionWithIds.accountId || "",
    categoryId: maybeTransactionWithIds.categoryId || "",
    goalId: maybeTransactionWithIds.goalId || NO_GOAL_VALUE,
    startDate: toDateInputValue(transaction.startDate),
    endDate: toDateInputValue(transaction.endDate),
    transactionType: Number(transaction.transactionType) as TransactionType,
    frequency: Number(transaction.frequency) as Frequency,
  };
}

function toUpsertPayload(form: CreateRecurringTransactionInput): CreateRecurringTransactionInput {
  return {
    name: form.name,
    description: form.description,
    amount: form.amount,
    accountId: form.accountId,
    categoryId: form.categoryId,
    goalId: form.goalId || null,
    startDate: form.startDate,
    endDate: form.endDate,
    transactionType: form.transactionType,
    frequency: form.frequency,
  };
}

function sanitizeForm(next: CreateRecurringTransactionInput): CreateRecurringTransactionInput {
  const safeAmount = Number.isFinite(next.amount) ? next.amount : 0;

  return {
    ...next,
    amount: safeAmount,
  };
}

export default function RecurringAdminScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ openCreate?: string }>();
  const [transactions, setTransactions] = useState<RecurringTransactionApiDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateRecurringTransactionInput>(DEFAULT_FORM);
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [goalOptions, setGoalOptions] = useState<GoalOption[]>([{ value: NO_GOAL_VALUE, label: NO_GOAL_LABEL }]);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.Expense);

  const formMode = useMemo(() => (editingTransactionId ? "edit" : "create"), [editingTransactionId]);

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => Number(transaction.transactionType) === selectedType),
    [transactions, selectedType],
  );

  async function loadRecurringList(showInitialLoader = true) {
    try {
      if (showInitialLoader) {
        setIsLoading(true);
      }

      setError("");
      const [recurringTransactions, accountOptions, categoryOptions, goals] = await Promise.all([
        getRecurringTransactionsList(),
        getAccountsData(),
        getCategoriesData(),
        getGoalsData(),
      ]);
      setTransactions(recurringTransactions);
      setAccountOptions(accountOptions);
      setCategoryOptions(categoryOptions);
      setGoalOptions([
        { value: NO_GOAL_VALUE, label: NO_GOAL_LABEL },
        ...goals.map((goal) => ({ value: goal.id, label: goal.title })),
      ]);
    } catch (loadError) {
      const message = resolveApiErrorMessage(loadError, t, "recurringAdmin.errors.failedToLoad");
      setError(message);
    } finally {
      if (showInitialLoader) {
        setIsLoading(false);
      }
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadRecurringList(false);
    setIsRefreshing(false);
  }

  function openCreateModal() {
    setEditingTransactionId(null);
    setForm({
      ...DEFAULT_FORM,
      accountId: accountOptions[0]?.value || "",
      categoryId: categoryOptions[0]?.value || "",
      goalId: NO_GOAL_VALUE,
    });
    setIsFormVisible(true);
  }

  function openEditModal(transaction: RecurringTransactionApiDTO) {
    setEditingTransactionId(transaction.id);
    setForm(toFormState(transaction));
    setIsFormVisible(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsFormVisible(false);
    setEditingTransactionId(null);
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (!form.accountId) {
      Alert.alert(t("recurringAdmin.validation.title"), t("recurringAdmin.validation.selectAccount"));
      return;
    }

    if (!form.categoryId) {
      Alert.alert(t("recurringAdmin.validation.title"), t("recurringAdmin.validation.selectCategory"));
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = toUpsertPayload(form);

      if (editingTransactionId) {
        const updatePayload: UpdateRecurringTransactionInput = {
          ...payload,
          lastGeneratedAt: new Date().toISOString(),
        };
        await updateRecurringTransaction(editingTransactionId, updatePayload);
      } else {
        await createRecurringTransaction(payload);
      }

      await loadRecurringList(false);
      setIsFormVisible(false);
      setEditingTransactionId(null);
    } catch (submitError) {
      const message = resolveApiErrorMessage(submitError, t, "recurringAdmin.errors.couldNotSave");
      Alert.alert(t("recurringAdmin.errors.genericTitle"), message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(transaction: RecurringTransactionApiDTO) {
    Alert.alert(
      t("recurringAdmin.delete.title"),
      t("recurringAdmin.delete.message", { name: transaction.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("recurringAdmin.delete.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecurringTransaction(transaction.id);
              await loadRecurringList(false);
            } catch (deleteError) {
              const message = resolveApiErrorMessage(deleteError, t, "recurringAdmin.errors.couldNotDelete");
              Alert.alert(t("recurringAdmin.errors.genericTitle"), message);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }

  useEffect(() => {
    loadRecurringList();
  }, []);

  useEffect(() => {
    if (params.openCreate === "1") {
      openCreateModal();
    }
  }, [params.openCreate]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bgPrimary">
        <ActivityIndicator size="large" color={APP_COLORS.actionPrimary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bgPrimary px-6">
        <Text className="text-center text-base text-app-textPrimary">{error}</Text>
        <Pressable
          onPress={() => loadRecurringList()}
          className="mt-4 rounded-xl border border-app-border bg-app-bgSecondary px-4 py-2"
        >
          <Text className="font-semibold text-app-primary">{t("common.retry")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bgPrimary">
      <RecurringAdminHeader
        title={t("recurringAdmin.title")}
        onBackPress={() => router.push("/tabs/recurringTransactions")}
        onActionPress={() => {}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={APP_COLORS.actionPrimary}
            colors={[APP_COLORS.actionPrimary]}
          />
        }
      >
        <View className="mb-4 mt-1 flex-row border-b border-app-border">
          <Pressable onPress={() => setSelectedType(TransactionType.Expense)} className="mr-6 pb-2">
            <Text className={`text-sm font-semibold ${selectedType === TransactionType.Expense ? "text-white" : "text-app-textMuted"}`}>
              {t("recurring.type.expense")}
            </Text>
            <View className={`mt-2 h-0.5 rounded-full ${selectedType === TransactionType.Expense ? "bg-app-accentBlue" : "bg-transparent"}`} />
          </Pressable>

          <Pressable onPress={() => setSelectedType(TransactionType.Income)} className="pb-2">
            <Text className={`text-sm font-semibold ${selectedType === TransactionType.Income ? "text-white" : "text-app-textMuted"}`}>
              {t("recurring.type.income")}
            </Text>
            <View className={`mt-2 h-0.5 rounded-full ${selectedType === TransactionType.Income ? "bg-app-accentBlue" : "bg-transparent"}`} />
          </Pressable>
        </View>

        <Text className="mb-3 text-xs font-semibold tracking-widest text-app-textMuted">{t("recurringAdmin.labels.upcomingThisMonth")}</Text>

        {filteredTransactions.length ? (
          filteredTransactions.map((transaction) => (
            <RecurringAdminItem
              key={transaction.id}
              transaction={transaction}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <View className="rounded-2xl border border-app-border bg-app-bgSecondary px-4 py-5">
            <Text className="text-center text-sm text-app-textSecondary">{t("recurring.empty.filtered")}</Text>
          </View>
        )}

        <Pressable
          onPress={openCreateModal}
          className="mb-20 mt-3 flex-row items-center justify-center rounded-2xl bg-app-accentBlue px-4 py-4"
        >
          <View className="mr-2 h-5 w-5 items-center justify-center rounded-full border border-[#BFDBFE]">
            <AppIcon name="Plus" color="#DBEAFE" size={12} />
          </View>
          <Text className="text-base font-semibold text-white">{t("recurringAdmin.actions.addNewRecurring")}</Text>
        </Pressable>
      </ScrollView>

      <RecurringAdminFormModal
        visible={isFormVisible}
        mode={formMode}
        form={form}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        goalOptions={goalOptions}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onChange={(next) => setForm(sanitizeForm(next))}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

