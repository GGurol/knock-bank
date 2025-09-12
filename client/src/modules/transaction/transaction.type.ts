import { z } from "zod";
import { Person } from "@/modules/account/account.type";
import { PaginationQuery } from "@/lib/pagination";

export enum TransactionType {
  DEPOSIT = 1,
  WITHDRAW = 2,
}

export type Transaction = {
  id: number;
  money: number;
  dateTime: string;
  transactionType: TransactionType;
  account: Person;
  originAccount?: Person;
};

export type TransactionMonthResume = {
  month: string;
  label: string;
  amount: number;
};

export type TransactionQuery = PaginationQuery & {
  transactionDate?: Date;
  transactionType?: TransactionType;
};

export const BasicTransferenceSchema = z.object({
  money: z
    .number({ required_error: "The amount cannot be 0." })
    .refine((value) => value != 0, "The amount cannot be 0.")
    .refine((value) => value > 0, "You can only transfer positive amounts."),
});

export type BasicTransferencePayload = z.infer<typeof BasicTransferenceSchema>;

export const TransferenceSchema = BasicTransferenceSchema.extend({
  accountId: z
    .number({ required_error: "Selecting an account is required." })
    .positive(),
});

export type TransferencePayload = z.infer<typeof TransferenceSchema>;