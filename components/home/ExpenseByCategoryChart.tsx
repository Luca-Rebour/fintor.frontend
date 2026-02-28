import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { APP_COLORS } from "../../constants/colors";
import {
  getOverviewDataset,
  mapOverviewSpendingToChartData,
  OverviewCategoryExpense,
  ReportFilterDays,
} from "../../services/reports.service";
import { getAuthUserSnapshot, subscribeToAuthUser } from "../../services/auth.service";
import { subscribeToExpenseCreated } from "../../services/transactions.service";
import { User } from "../../types/api/signUp";

type ExpenseByCategory = OverviewCategoryExpense;

type ChartSegment = ExpenseByCategory & {
  segmentLength: number;
  segmentOffset: number;
};

const FILTER_OPTIONS: { days: ReportFilterDays; label: string }[] = [
  { days: 7, label: "1 semana" },
  { days: 30, label: "1 mes" },
  { days: 182, label: "6 meses" },
  { days: 365, label: "12 meses" },
];

const CHART_SIZE = 190;
const CHART_STROKE_WIDTH = 26;
const CHART_RADIUS = (CHART_SIZE - CHART_STROKE_WIDTH) / 2;
const CHART_CENTER = CHART_SIZE / 2;

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

type NetWorthSectionProps = {
  refreshKey?: number;
};

export function NetWorthSection({ refreshKey = 0 }: NetWorthSectionProps) {
  const [overviewByDays, setOverviewByDays] = useState<Record<ReportFilterDays, ExpenseByCategory[]>>({
    7: [],
    30: [],
    182: [],
    365: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilterDays, setSelectedFilterDays] = useState<ReportFilterDays>(30);
  const [authUser, setAuthUser] = useState<User | null>(getAuthUserSnapshot());

  function getUserBaseCurrencyCode(user: User | null) {
    const rawCode =
      (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.baseCurrencyCode ??
      (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.BaseCurrencyCode;

    if (typeof rawCode === "string" && rawCode.trim()) {
      return rawCode.trim().toUpperCase();
    }

    return "USD";
  }

  const baseCurrencyCode = getUserBaseCurrencyCode(authUser);

  const loadOverviewDataset = useCallback(async () => {
    try {
      setIsLoading(true);
      const dataset = await getOverviewDataset();

      setOverviewByDays({
        7: mapOverviewSpendingToChartData(dataset[7]),
        30: mapOverviewSpendingToChartData(dataset[30]),
        182: mapOverviewSpendingToChartData(dataset[182]),
        365: mapOverviewSpendingToChartData(dataset[365]),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverviewDataset();
  }, [loadOverviewDataset]);

  useEffect(() => {
    const unsubscribe = subscribeToExpenseCreated(() => {
      loadOverviewDataset();
    });

    return unsubscribe;
  }, [loadOverviewDataset]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthUser((user) => {
      setAuthUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      loadOverviewDataset();
    }
  }, [refreshKey, loadOverviewDataset]);

  const expensesByCategory = useMemo(
    () => overviewByDays[selectedFilterDays] ?? [],
    [overviewByDays, selectedFilterDays],
  );

  const totalExpenses = useMemo(
    () => expensesByCategory.reduce((sum, item) => sum + item.amount, 0),
    [expensesByCategory],
  );

  const circumference = 2 * Math.PI * CHART_RADIUS;

  const chartSegments = useMemo<ChartSegment[]>(() => {
    if (totalExpenses <= 0) {
      return [];
    }

    let accumulatedLength = 0;

    return expensesByCategory.map((item) => {
      const ratio = item.amount / totalExpenses;
      const segmentLength = ratio * circumference;
      const segmentOffset = -accumulatedLength;

      accumulatedLength += segmentLength;

      return {
        ...item,
        segmentLength,
        segmentOffset,
      };
    });
  }, [expensesByCategory, totalExpenses, circumference]);

  return (
    <View className="mb-4 rounded-3xl bg-app-card/50 p-4">
      <Text className="text-sm text-app-textSecondary">Gastos por categoría</Text>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isSelected = selectedFilterDays === option.days;
          return (
            <Pressable
              key={option.days}
              onPress={() => setSelectedFilterDays(option.days)}
              className={`rounded-full px-3 py-1.5 ${isSelected ? "bg-app-primary" : "bg-app-cardSoft"}`}
            >
              <Text className={`text-xs font-semibold ${isSelected ? "text-app-surface" : "text-app-textSecondary"}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View className="mt-6 items-center justify-center py-6">
          <ActivityIndicator color={APP_COLORS.actionPrimary} />
        </View>
      ) : expensesByCategory.length === 0 ? (
        <View className="mt-6 items-center justify-center rounded-2xl bg-app-cardSoft px-4 py-8">
          <Text className="text-center text-sm text-app-textSecondary">No hay gastos en este periodo.</Text>
        </View>
      ) : (
        <>
          <View className="mt-6 items-center justify-center">
            <View style={{ width: CHART_SIZE, height: CHART_SIZE }}>
              <Svg width={CHART_SIZE} height={CHART_SIZE}>
                <Circle
                  cx={CHART_CENTER}
                  cy={CHART_CENTER}
                  r={CHART_RADIUS}
                  strokeWidth={CHART_STROKE_WIDTH}
                  stroke="rgba(255,255,255,0.1)"
                  fill="none"
                />

                <G transform={`rotate(-90 ${CHART_CENTER} ${CHART_CENTER})`}>
                  {chartSegments.map((item) => (
                    <Circle
                      key={item.category}
                      cx={CHART_CENTER}
                      cy={CHART_CENTER}
                      r={CHART_RADIUS}
                      stroke={item.color}
                      strokeWidth={CHART_STROKE_WIDTH}
                      strokeLinecap="butt"
                      fill="none"
                      strokeDasharray={[item.segmentLength, circumference]}
                      strokeDashoffset={item.segmentOffset}
                    />
                  ))}
                </G>
              </Svg>

              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-xs text-app-textSecondary">Total</Text>
                <Text className="mt-1 text-base font-bold text-app-textPrimary">{formatMoney(totalExpenses)}</Text>
                <Text className="mt-1 text-[11px] font-semibold text-app-textSecondary">{baseCurrencyCode}</Text>
              </View>
            </View>
          </View>

          <View className="mt-5 gap-2">
            {expensesByCategory.map((item) => {
              const percent = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
              return (
                <View key={item.category} className="flex-row items-center justify-between rounded-xl bg-app-cardSoft px-3 py-2">
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: item.color,
                        marginRight: 8,
                      }}
                    />
                    <Text className="text-sm text-app-textPrimary">{item.category}</Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-sm font-semibold text-app-textPrimary">{formatMoney(item.amount)}</Text>
                    <Text className="text-xs text-app-textSecondary">{percent.toFixed(1)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
