"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { enUS } from "date-fns/locale";
import { Matcher, SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DatePickerProps = {
  date: string | Date | undefined;
  disableDays?: Matcher | Matcher[];
  onChange: SelectSingleEventHandler;
  disabled?: boolean;
};

function getLastHundredYears() {
  const lastHundredYears = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 100; year--) {
    lastHundredYears.push(year);
  }
  return lastHundredYears;
}

function parseSafeDate(dateValue: string | Date | undefined): Date | undefined {
  if (!dateValue) {
    return undefined;
  }
  if (dateValue instanceof Date) {
    return dateValue;
  }
  const parts = dateValue.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const parsedDate = new Date(dateValue);
  return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

export function DatePicker({
  date,
  disableDays,
  onChange,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dateToDisplay = parseSafeDate(date);
  const [displayedMonth, setDisplayedMonth] = useState<Date>(
    dateToDisplay || new Date()
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal w-full", // Added w-full for better layout
            !dateToDisplay && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateToDisplay ? (
            format(dateToDisplay, "dd/MM/yyyy")
          ) : (
            <span>Choose a Date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <Select
          value={`${displayedMonth.getFullYear()}`}
          onValueChange={(value: string) => {
            const newMonth = new Date(displayedMonth);
            newMonth.setFullYear(parseInt(value, 10));
            setDisplayedMonth(newMonth);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {getLastHundredYears().map((year) => (
                <SelectItem key={year} value={`${year}`}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            locale={enUS}
            selected={dateToDisplay}
            // --- THIS IS THE FINAL FIX ---
            // When a date is selected, we adjust it for the browser's timezone offset.
            // This prevents the date from shifting to the previous day when it's
            // converted to a string (like toISOString) by the form library.
            onSelect={(selectedDate, ...rest) => {
              if (selectedDate) {
                const timezoneOffset = selectedDate.getTimezoneOffset();
                const adjustedDate = new Date(selectedDate.getTime() - (timezoneOffset * 60000));
                onChange(adjustedDate, ...rest);
                setIsOpen(false);
              } else {
                onChange(undefined, ...rest);
              }
            }}
            disabled={disableDays}
            initialFocus
            month={displayedMonth}
            onMonthChange={setDisplayedMonth}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}