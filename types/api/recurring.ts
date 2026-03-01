import { Frequency } from "../enums/frequency";
import { PendingTransactionStatus } from "../enums/pendingTransactionStatus";
import { TransactionType } from "../enums/transactionType";

export type RecurringPendingApprovalApiDTO = {
  id: string;
  dueDate: string;
    status: PendingTransactionStatus;
    description: string;
    transactionType: TransactionType;
    amount: number;
    categoryName: string;
    icon: string;
    accountName: string;
    currencyCode: string;    
};

export type RecurringTransactionApiDTO = {
  id: string;
  name: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  lastGeneratedAt: string;
  nextChargeDate: string;
  currencyCode: string;
  accountName: string;
  icon: string;
};
