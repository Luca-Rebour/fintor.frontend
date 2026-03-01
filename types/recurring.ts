import { RecurringPendingApprovalApiDTO, RecurringTransactionApiDTO } from "./api/recurring";

export type RecurringTransactionsData = {
  pendingApprovals: RecurringPendingApprovalApiDTO[];
  recurringTransactions: RecurringTransactionApiDTO[];
};
