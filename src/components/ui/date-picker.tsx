'use client';

import * as React from 'react';

import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

export function DatePicker({
  selected,
  setSelected,
  disabled,
}: {
  selected?: Date | undefined;
  setSelected?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}) {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {setSelected ? (
            selected ? (
              format(selected, 'PPP')
            ) : (
              <span>Pick a date</span>
            )
          ) : date ? (
            format(date, 'PPP')
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={setSelected ? selected : date}
          onSelect={setSelected ? setSelected : setDate}
          disabled={disabled !== undefined ? disabled : () => false}
        />
      </PopoverContent>
    </Popover>
  );
}
