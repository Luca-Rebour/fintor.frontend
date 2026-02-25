import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { getTransactionsData } from "../../services/transactions.service";
import { TransactionDTO } from "../../types/transaction";
import {
  CreateExpenseModal,
  CreateExpensePayload,
} from "../../components/transactions/CreateExpenseModal";
import { TransactionActionButtons } from "../../components/transactions/TransactionActionButtons";
import {
  CreateIncomeModal,
  CreateIncomePayload,
} from "../../components/transactions/CreateIncomeModal";
import { TransactionListItem } from "../../components/transactions/TransactionListItem";
import { TransactionSummaryCards } from "../../components/transactions/TransactionSummaryCards";

type TransactionGroup = {
  dateKey: string;
  title: string;
  items: TransactionDTO[];
};

function getLocalDateKey(input: string) {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TransactionsScreen() {
  const [transactionsData, setTransactionsData] = useState<TransactionDTO[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [monthlySummary, setMonthlySummary] = useState({ totalSpending: 0, totalIncome: 0 });
  const [isCreateExpenseModalVisible, setIsCreateExpenseModalVisible] =
    useState(false);
  const [isCreateIncomeModalVisible, setIsCreateIncomeModalVisible] =
    useState(false);

  async function loadTransactions() {
    try {
      setIsLoading(true);
      setError("");
      const data = await getTransactionsData();
      setTransactionsData(data);
      setMonthlySummary(calculateMonthlySummary(data));
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load transactions";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
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
        title: new Date(`${dateKey}T00:00:00`).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        items: items.sort((a, b) => +new Date(b.date) - +new Date(a.date)),
      }));
  }, [transactionsData]);

  const toggleExpanded = (id: string) => {
    setExpandedTransactionId((prev) => (prev === id ? null : id));
  };

  const categoryColorByName: Record<string, string> = {
    Salary: "#4ECDC4",
    Freelance: "#18C8FF",
    Investments: "#B63BFF",
    Bonus: "#22C55E",
    Refund: "#F59E0B",
    "Food & Dining": "#FF6B6B",
    Transport: "#F97316",
    Shopping: "#A855F7",
    Bills: "#0EA5E9",
    Entertainment: "#EC4899",
  };

  function handleCreateExpense(payload: CreateExpensePayload) {
    const createdExpense: TransactionDTO = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString(),
      amount: payload.amount,
      description: payload.description,
      category: payload.category,
      type: "expense",
      icon: payload.icon,
      account: payload.account,
      categoryColor: categoryColorByName[payload.category] ?? "#FF6B6B",
    };

    setTransactionsData((prev) => {
      const next = [createdExpense, ...prev];
      setMonthlySummary(calculateMonthlySummary(next));
      return next;
    });
  }

  function handleCreateIncome(payload: CreateIncomePayload) {
    const createdIncome: TransactionDTO = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString(),
      amount: payload.amount,
      description: payload.description,
      category: payload.category,
      type: "income",
      icon: payload.icon,
      account: payload.account,
      categoryColor: categoryColorByName[payload.category] ?? "#18C8FF",
    };

    setTransactionsData((prev) => {
      const next = [createdIncome, ...prev];
      setMonthlySummary(calculateMonthlySummary(next));
      return next;
    });
  }

  function calculateMonthlySummary(transactions: TransactionDTO[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let totalSpending = 0;
    let totalIncome = 0;
  
    for (const txn of transactions) {
        const txnDate = new Date(txn.date);
        if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
            if (txn.type === "expense") {
                totalSpending += txn.amount;
            } else if (txn.type === "income") {
                totalIncome += txn.amount;
            }
        }
    }
  
    return { totalSpending, totalIncome };
  }

  return (
    <View className="flex-1 bg-[#060F24]">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-3 border-b border-[#1E2A47]">
          <Text className="text-lg font-semibold text-app-textPrimary">
            Transactions
          </Text>
        </View>

        <TransactionSummaryCards monthlySpending={monthlySummary.totalSpending} monthlyIncome={monthlySummary.totalIncome} />

        <TransactionActionButtons
          onAddExpense={() => setIsCreateExpenseModalVisible(true)}
          onAddIncome={() => setIsCreateIncomeModalVisible(true)}
        />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#18C8FF" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-base text-app-textPrimary">
              {error}
            </Text>
          </View>
        ) : (
          groupedTransactions.map((group) => (
            <View key={group.dateKey} className="mb-3">
              <Text className="text-app-textSecondary text-xs uppercase mb-2 px-1">
                {group.title}
              </Text>

              {group.items.map((txn) => {
                return (
                  <TransactionListItem
                    key={txn.id}
                    transaction={txn}
                    isExpanded={expandedTransactionId === txn.id}
                    onToggle={toggleExpanded}
                  />
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

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
