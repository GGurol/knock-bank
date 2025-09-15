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

// This function correctly uses the string-based Enum
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

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  // Pass the correct camelCase property to the function
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
                {/* Use the correct camelCase property for the date */}
                {new Date(transaction.dateTime).toLocaleDateString("en-US", {
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