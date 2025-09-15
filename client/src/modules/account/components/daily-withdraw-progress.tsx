import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/masks";
import { Hiddleble } from "@/components/hiddeble";

export function DailyWithdrawProgress({
  todayWithdraw,
  dailyWithdrawLimit,
}: {
  todayWithdraw?: number;
  dailyWithdrawLimit?: number;
}) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-row mb-2 items-center justify-between">
        <label
          htmlFor="daily-withdraw-progress"
          className="text-xl font-semibold"
        >
          Daily Withdraw Limit
        </label>
        <div className="text-lg font-medium flex flex-row gap-2 items-center">
          <Hiddleble className="w-16 h-6 shadow-md">
            <span> {formatCurrency(todayWithdraw!)} </span>
          </Hiddleble>
          <span> / </span>
          <Hiddleble className="w-16 h-6 shadow-md">
            <span> {formatCurrency(dailyWithdrawLimit!)} </span>
          </Hiddleble>
        </div>
      </div>
      <Progress
        id="daily-withdraw-progress"
        className="h-6"
        value={todayWithdraw}
        max={dailyWithdrawLimit}
      />
    </div>
  );
}
