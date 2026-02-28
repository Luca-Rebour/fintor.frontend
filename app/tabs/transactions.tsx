import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import {
  addNewTransaction,
  getTransactionsData,
  subscribeToTransactions,
} from "../../services/transactions.service";
import { CreateTransactionDTO, TransactionDTO } from "../../types/transaction";
import {
  CreateExpenseModal,
} from "../../components/transactions/CreateExpenseModal";
import { TransactionActionButtons } from "../../components/transactions/TransactionActionButtons";
import { CreateIncomeModal} from "../../components/transactions/CreateIncomeModal";
import { TransactionListItem } from "../../components/transactions/TransactionListItem";
import { TransactionSummaryCards } from "../../components/transactions/TransactionSummaryCards";
import { CATEGORY_COLOR_BY_NAME } from "../../constants/colors";

type TransactionGroup = {
  dateKey: string;
  title: string;
  items: TransactionDTO[];
};

type TransactionListRow =
  | {
      id: string;
      kind: "group";
      title: string;
    }
  | {
      id: string;
      kind: "transaction";
      transaction: TransactionDTO;
    };

function getLocalDateKey(input: string) {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getGroupTitle(dateKey: string) {
  const todayKey = getLocalDateKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterdayDate.toISOString());

  if (dateKey === todayKey) {
    return "Today";
  }

  if (dateKey === yesterdayKey) {
    return "Yesterday";
  }

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function TransactionsScreen() {
  const [transactionsData, setTransactionsData] = useState<TransactionDTO[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);
  const [monthlySummary, setMonthlySummary] = useState({
    totalSpending: 0,
    totalIncome: 0,
  });
  const [isCreateExpenseModalVisible, setIsCreateExpenseModalVisible] =
    useState(false);
  const [isCreateIncomeModalVisible, setIsCreateIncomeModalVisible] =
    useState(false);

  async function loadTransactions(showInitialLoader = true) {
    try {
      if (showInitialLoader) {
        setIsLoading(true);
      }
      setError("");
      await getTransactionsData();
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load transactions";
      setError(message);
    } finally {
      if (showInitialLoader) {
        setIsLoading(false);
      }
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadTransactions(false);
    setIsRefreshing(false);
  }

  useEffect(() => {
    const unsubscribe = subscribeToTransactions((transactions) => {
      setTransactionsData(transactions);
      setMonthlySummary(calculateMonthlySummary(transactions));
    });

    loadTransactions();

    return unsubscribe;
  }, []);

  const groupedTransactions = useMemo<TransactionGroup[]>(() => {
    const map = new Map<string, TransactionDTO[]>();

    for (const txn of transactionsData) {
      const key = getLocalDateKey(txn.date);
      const current = map.get(key) ?? [];
      current.push(txn);
      map.set(key, current);
    }

    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // fecha descendente
      .map(([dateKey, items]) => ({
        dateKey,
        title: getGroupTitle(dateKey),
        items: items.sort((a, b) => +new Date(b.date) - +new Date(a.date)),
      }));
  }, [transactionsData]);

  const transactionRows = useMemo<TransactionListRow[]>(() => {
    return groupedTransactions.flatMap((group) => {
      const groupHeader: TransactionListRow = {
        id: `group-${group.dateKey}`,
        kind: "group",
        title: group.title,
      };

      const groupItems: TransactionListRow[] = group.items.map((txn) => ({
        id: `txn-${txn.id}`,
        kind: "transaction",
        transaction: txn,
      }));

      return [groupHeader, ...groupItems];
    });
  }, [groupedTransactions]);

  const toggleExpanded = (id: string) => {
    setExpandedTransactionId((prev) => (prev === id ? null : id));
  };

  async function handleCreateExpense(payload: CreateTransactionDTO) {
    const toCreate: CreateTransactionDTO = {
      amount: payload.amount,
      description: payload.description,
      categoryId: payload.categoryId,
      transactionType: 1,
      icon: payload.icon,
      accountId: payload.accountId
    };

  await addNewTransaction(toCreate);
  }

  async function handleCreateIncome(payload: CreateTransactionDTO) {
    const toCreate: CreateTransactionDTO = {
      amount: payload.amount,
      description: payload.description,
      categoryId: payload.categoryId,
      transactionType: 0,
      icon: payload.icon,
      accountId: payload.accountId
    };

  await addNewTransaction(toCreate);
  }

  function calculateMonthlySummary(transactions: TransactionDTO[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let totalSpending = 0;
    let totalIncome = 0;

    for (const txn of transactions) {
      const txnDate = new Date(txn.date);
      if (
        txnDate.getMonth() === currentMonth &&
        txnDate.getFullYear() === currentYear
      ) {
        if (txn.transactionType == 1) {
          totalSpending += txn.amount;
        } else if (txn.transactionType == 0) {
          totalIncome += txn.amount;
        }
      }
    }

    return { totalSpending, totalIncome };
  }

  return (
    <View className="flex-1 bg-[#060F24]">
      <FlatList
        data={!isLoading && !error ? transactionRows : []}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <>
            <View className="px-4 py-3 border-b border-[#1E2A47]">
              <Text className="text-lg font-semibold text-app-textPrimary">
                Transactions
              </Text>
            </View>

            <TransactionSummaryCards
              monthlySpending={monthlySummary.totalSpending}
              monthlyIncome={monthlySummary.totalIncome}
            />

            <TransactionActionButtons
              onAddExpense={() => setIsCreateExpenseModalVisible(true)}
              onAddIncome={() => setIsCreateIncomeModalVisible(true)}
            />
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center justify-center mt-10">
              <ActivityIndicator size="large" color="#18C8FF" />
            </View>
          ) : error ? (
            <View className="items-center justify-center px-6 mt-8">
              <Text className="text-center text-base text-app-textPrimary">
                {error}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (item.kind === "group") {
            return (
              <View className="mb-1 px-4">
                <Text className="text-app-textSecondary text-xs uppercase mb-2">
                  {item.title}
                </Text>
              </View>
            );
          }

          return (
            <View className="px-2">
              <TransactionListItem
                transaction={item.transaction}
                isExpanded={expandedTransactionId === item.transaction.id}
                onToggle={toggleExpanded}
              />
            </View>
          );
        }}
      />

      <CreateExpenseModal
        visible={isCreateExpenseModalVisible}
        onClose={() => setIsCreateExpenseModalVisible(false)}
        onCreateExpense={handleCreateExpense}
      />

      <CreateIncomeModal
        visible={isCreateIncomeModalVisible}
        onClose={() => setIsCreateIncomeModalVisible(false)}
        onCreateIncome={handleCreateIncome}
      />
    </View>
  );
}
