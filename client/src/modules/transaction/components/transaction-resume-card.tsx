"use client";

import { Bar, BarChart, XAxis } from "recharts";
import { toBrasilianReal } from "@/lib/masks";

import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useService } from "@/providers/service.provider";
import { TransactionMonthResume } from "@/modules/transaction/transaction.type";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  input: {
    label: "Inflow", // English label
    color: "var(--color-success)",
  },
  output: {
    label: "Outflow", // English label
    color: "var(--color-destructive)",
  },
} satisfies ChartConfig;

function getChartData(dataList: TransactionMonthResume[]) {
  const months = Array.from(new Set(dataList.map((data) => data.month)));

  // CORRECTED: Use the English labels from your backend Enum
  const dataInput = dataList.filter((data) => data.label == "DEPOSIT");
  const dataOutput = dataList.filter((data) => data.label == "WITHDRAW");

  // CORRECTED: This mapping is now safe and handles missing data.
  const resumeChartData = months.map((month) => {
    const monthInput = dataInput.find((input) => input.month === month);
    const monthOutput = dataOutput.find((output) => output.month === month);

    return {
      month,
      // If a matching input is found, use its amount. Otherwise, use 0.
      input: monthInput ? monthInput.amount : 0,
      // If a matching output is found, use its amount. Otherwise, use 0.
      output: monthOutput ? monthOutput.amount : 0,
    };
  });

  return resumeChartData;
}

export function TransactionResumeCard() {
  const { transactionService } = useService();

  const { data: resume, isPending } = useQuery({
    queryKey: ["transactions-resume"],
    queryFn: () => transactionService.getTransactionResume(),
  });

  if (isPending || !resume) {
    return (
      <Skeleton className="w-full shadow-lg row-start-3 lg:row-start-2 lg:col-span-2" />
    );
  }

  const chartData = getChartData(resume);

  return (
    <Card className="w-full flex flex-col gap-0 pb-3 justify-between row-start-3 lg:row-start-2 lg:col-span-2">
      <CardHeader className="text-2xl font-semibold">Summary</CardHeader>
      <CardContent className="relative h-full lg:max-h-80">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  formatter={(value, name) => (
                    <TooltipContent value={value} name={name} />
                  )}
                />
              }
            />
            <Bar dataKey="input" fill="var(--color-success)" radius={4} />
            <Bar dataKey="output" fill="var(--color-destructive)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ... (TooltipContent component remains the same) ...

type TooltipContentProps = {
  name: NameType;
  value: ValueType;
};

function TooltipContent({ name, value }: TooltipContentProps) {
  return (
    <>
      <div
        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
        style={
          {
            background: chartConfig[name as keyof typeof chartConfig]?.color,
          } as React.CSSProperties
        }
      />
      {chartConfig[name as keyof typeof chartConfig]?.label}
      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
        {toBrasilianReal(Number(value.toString()))}
      </div>
    </>
  );
}