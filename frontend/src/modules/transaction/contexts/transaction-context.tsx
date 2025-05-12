// "use client";

// import { Api, ApiResponse } from "@/lib/api";
// import { createContext, useContext, useState } from "react";
// import { AuthContext } from "@/modules/auth/contexts/auth-context";
// import {
//   BasicTransferencePayload,
//   TransferencePayload,
// } from "@/modules/transaction/schemas/transference";
// import {
//   Transaction,
//   TransactionMonthResume,
//   TransactionQuery,
// } from "@/modules/transaction/schemas/transaction";
// import { TransactionService } from "@/modules/transaction/services/transaction-service";
// import { PaginationResponse } from "@/lib/pagination";

// interface ITransactionContext {
//   transactions: PaginationResponse<Transaction> | undefined;
//   fetchTransactions: (query?: TransactionQuery) => Promise<void>;
//   transactionsResume: TransactionMonthResume[];
//   setTransactionsResume: (transactionsResume: TransactionMonthResume[]) => void;
//   fetchTransactionsResume: () => Promise<void>;
//   deposit: (transference: BasicTransferencePayload) => Promise<ApiResponse>;
//   withdraw: (transference: BasicTransferencePayload) => Promise<ApiResponse>;
//   transfer: (transference: TransferencePayload) => Promise<ApiResponse>;
// }

// export const TransactionContext = createContext({} as ITransactionContext);
// export function TransactionContextProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { getToken } = useContext(AuthContext);
//   const [transactions, setTransactions] =
//     useState<PaginationResponse<Transaction>>();
//   const [transactionsResume, setTransactionsResume] = useState<
//     TransactionMonthResume[]
//   >([]);
//   const transactionService = new TransactionService(
//     new Api(getToken() ?? undefined)
//   );

//   async function fetchTransactions(query: TransactionQuery = {}) {
//     const myTransactions = await transactionService.getMyTransactions(query);
//     setTransactions(myTransactions);
//   }

//   async function fetchTransactionsResume() {
//     const myTransactionsResume = await transactionService.getAccountResume();
//     setTransactionsResume(myTransactionsResume);
//   }

//   async function deposit(transference: BasicTransferencePayload) {
//     const data = transactionService.deposit(transference);
//     return data;
//   }

//   async function withdraw(transference: BasicTransferencePayload) {
//     const data = transactionService.withdraw(transference);
//     return data;
//   }

//   async function transfer(transference: TransferencePayload) {
//     const data = transactionService.transfer(transference);
//     return data;
//   }

//   return (
//     <TransactionContext.Provider
//       value={{
//         transactions,
//         fetchTransactions,
//         transactionsResume,
//         setTransactionsResume,
//         fetchTransactionsResume,
//         deposit,
//         withdraw,
//         transfer,
//       }}
//     >
//       {children}
//     </TransactionContext.Provider>
//   );
// }
