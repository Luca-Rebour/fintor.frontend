import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

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
import { RecurringTransactionApiDTO } from "../../types/api/recurring";
import { Frequency } from "../../types/enums/frequency";
import { TransactionType } from "../../types/enums/transactionType";
import { CreateRecurringTransactionInput, UpdateRecurringTransactionInput } from "../../types/recurring";
import { AccountOption } from "../../types/account";
import { CategoryOption } from "../../types/category";

const DEFAULT_FORM: CreateRecurringTransactionInput = {
  name: "",
  description: "",
  amount: 0,
  accountId: "",
  categoryId: "",
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
  };

  return {
    name: transaction.name || "",
    description: transaction.description || "",
    amount: Math.abs(Number(transaction.amount) || 0),
    accountId: maybeTransactionWithIds.accountId || "",
    categoryId: maybeTransactionWithIds.categoryId || "",
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
    startDate: form.startDate,
    endDate: form.endDate,
    transactionType: form.transactionType,
    frequency: form.frequency,
  };
}

export default function RecurringAdminScreen() {
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
  const [error, setError] = useState("");

  const formMode = useMemo(() => (editingTransactionId ? "edit" : "create"), [editingTransactionId]);

  async function loadRecurringList(showInitialLoader = true) {
    try {
      if (showInitialLoader) {
        setIsLoading(true);
      }

      setError("");
      const [recurringTransactions, accountOptions, categoryOptions] = await Promise.all([
        getRecurringTransactionsList(),
        getAccountsData(),
        getCategoriesData(),
      ]);
      setTransactions(recurringTransactions);
      setAccountOptions(accountOptions);
      setCategoryOptions(categoryOptions);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load recurring transactions";
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
      Alert.alert("Validation", "Please select an account.");
      return;
    }

    if (!form.categoryId) {
      Alert.alert("Validation", "Please select a category.");
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
      const message = submitError instanceof Error ? submitError.message : "Could not save recurring transaction";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(transaction: RecurringTransactionApiDTO) {
    Alert.alert(
      "Delete recurring",
      `Delete ${transaction.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecurringTransaction(transaction.id);
              await loadRecurringList(false);
            } catch (deleteError) {
              const message = deleteError instanceof Error ? deleteError.message : "Could not delete recurring transaction";
              Alert.alert("Error", message);
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
      <View className="flex-1 items-center justify-center bg-[#060F24]">
        <ActivityIndicator size="large" color="#18C8FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#060F24] px-6">
        <Text className="text-center text-base text-app-textPrimary">{error}</Text>
        <Pressable
          onPress={() => loadRecurringList()}
          className="mt-4 rounded-xl border border-[#1E2A47] bg-[#111C33] px-4 py-2"
        >
          <Text className="font-semibold text-app-primary">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#060F24]">
      <RecurringAdminHeader
        title="Manage Recurring"
        onBackPress={() => router.push("/tabs/recurringTransactions")}
        onCreatePress={openCreateModal}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#18C8FF"
            colors={["#18C8FF"]}
          />
        }
      >
        {transactions.length ? (
          transactions.map((transaction) => (
            <RecurringAdminItem
              key={transaction.id}
              transaction={transaction}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <View className="rounded-2xl border border-[#1E2A47] bg-[#111C33] px-4 py-5">
            <Text className="text-center text-sm text-[#94A3B8]">No recurring transactions found.</Text>
          </View>
        )}
      </ScrollView>

      <RecurringAdminFormModal
        visible={isFormVisible}
        mode={formMode}
        form={form}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onChange={setForm}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
