"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/modules/account/contexts/account-context";
// Step 1: Import the AccountType enum to understand the account type number
import { AccountType } from "@/modules/account/account.type";

// Step 2: Create a helper function to convert the number to a readable string
function getAccountTypeName(accountType: AccountType | undefined): string {
  // A small check if accountType is not available yet
  if (accountType === undefined) {
    return "";
  }

  // Use a switch statement to return the correct name for each type
  switch (accountType) {
    case AccountType.CURRENT_ACCOUNT:
      return "Current Account";
    case AccountType.SAVING_ACCOUNT:
      return "Savings Account";
    case AccountType.SALARY_ACCOUNT:
      return "Salary Account";
    case AccountType.PAYMENT_ACCOUNT:
      return "Payment Account";
    default:
      return "Account"; // A fallback just in case
  }
}

export function Header() {
  const { account, isPending } = useAccount();

  return (
    <header className="bg-white h-20 w-full py-3 px-8">
      <small className="text-sm"> Welcome </small>
      <div className="text-sm">
        {!isPending ? (
          <>
            <span className="text-lg font-bold"> {account?.person.name} </span>{" "}
            {/* Step 3: Call the helper function to display the account type */}
            (Nº {account?.id} - {getAccountTypeName(account?.accountType)})
          </>
        ) : (
          <Skeleton className="w-40 h-6" />
        )}
      </div>
    </header>
  );
}
