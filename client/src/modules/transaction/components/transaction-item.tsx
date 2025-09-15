"use client";

import {
  Transaction,
  TransactionType,
} from "@/modules/transaction/transaction.type";
import { Hiddleble } from "@/components/hiddeble";
import { toBrasilianReal } from "@/lib/masks";

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
    // It's good practice to handle other cases, even if just to ignore them
    default:
      return undefined;
  }
}

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  // CORRECTED: We now safely handle the case where the transaction type is unknown
  const props = getTransactionProps(transaction.transaction_type);

  // If the transaction type is not one we want to display, render nothing.
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
                {new Date(transaction.date_time).toLocaleDateString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
            {toBrasilianReal(transaction.money)}
          </Hiddleble>
        </span>
      </li>
    </>
  );
}