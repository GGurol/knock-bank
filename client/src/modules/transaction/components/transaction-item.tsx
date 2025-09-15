"use client";

import {
  Transaction,
  TransactionType,
} from "@/modules/transaction/transaction.type";
import { Hiddleble } from "@/components/hiddeble";
import { formatCurrency } from "@/lib/masks";

type TransactionProps = {
  label: string;
  color: string;
};

// This function now correctly uses the string-based Enum
function getTransactionProps(
  transactionType: TransactionType
): TransactionProps | undefined {
  switch (transactionType) {
    case TransactionType.DEPOSIT:
      return {
        label: "Deposit",
        color: "success",
      };
    case TransactionType.WITHDRAW:
      return {
        label: "Withdraw",
        color: "destructive",
      };
    default:
      return undefined;
  }
}

// --- THIS IS THE NEW HELPER FUNCTION ---
// It takes an ISO date string and formats it to 'dd/mm/YYYY HH:MM'.
// This gives us precise control over the output.
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  
  // Get components and pad with zero if needed
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}


export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const props = getTransactionProps(transaction.transactionType);

  if (!props) {
    return null;
  }
  
  const { label, color } = props;

  return (
    <>
      <hr />
      <li className="flex flex-row justify-between items-center h-fit">
        <div className="flex gap-2">
          <div
            className={
              "w-2 rounded-md " +
              (color === "success" ? "bg-success" : "bg-destructive")
            }
          ></div>
          <div>
            <p className="text-lg font-bold"> {label} </p>
            <p>
              <span className="font-normal">
                {/* --- THIS IS THE CHANGE --- */}
                {/* We now call our new helper function to format the date */}
                {formatDateTime(transaction.dateTime)}
              </span>
              <span className="font-semibold">
                {transaction.originAccount &&
                  ` - ${transaction.originAccount.name}`}
              </span>
            </p>
          </div>
        </div>
        <span
          className={
            "text-lg font-semibold " +
            (color === "success" ? "text-success" : "text-destructive")
          }
        >
          <Hiddleble className="w-16 h-8 shadow-md">
            {transaction.money > 0 && "+"}
            {formatCurrency(transaction.money)}
          </Hiddleble>
        </span>
      </li>
    </>
  );
}
