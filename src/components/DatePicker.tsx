import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// Values are stored as text so they read the same in the database:
//   date      → "yyyy-MM-dd"
//   date+time → "yyyy-MM-ddTHH:mm"
const DATE_FMT = "yyyy-MM-dd";

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value.slice(0, 10), DATE_FMT, new Date());
  return isValid(d) ? d : undefined;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  withTime?: boolean;
  className?: string;
}

const DatePicker = ({ value, onChange, id, label, placeholder = "Pick a date", withTime, className }: DatePickerProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selected = toDate(value);
  const time = withTime ? value.slice(11, 16) : "";

  const display = selected ? format(selected, "d MMM yyyy") + (time ? `, ${time}` : "") : placeholder;

  const setDay = (day: Date | undefined) => {
    if (!day) return;
    const date = format(day, DATE_FMT);
    if (withTime) {
      onChange(`${date}T${time || format(new Date(), "HH:mm")}`);
    } else {
      onChange(date);
      setOpen(false);
    }
  };

  const setTime = (t: string) => {
    const date = selected ? format(selected, DATE_FMT) : format(new Date(), DATE_FMT);
    onChange(t ? `${date}T${t}` : date);
  };

  const setToday = () => {
    const now = new Date();
    onChange(withTime ? format(now, "yyyy-MM-dd'T'HH:mm") : format(now, DATE_FMT));
    setOpen(false);
  };

  const trigger = (
    <Button
      id={id}
      type="button"
      variant="outline"
      onClick={() => setOpen(true)}
      className={cn("w-full justify-start text-left font-normal h-10", !selected && "text-muted-foreground", className)}
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span className="truncate">{display}</span>
      {selected && (
        <span
          role="button"
          aria-label="Clear date"
          className="ml-auto -mr-1 rounded p-1 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </Button>
  );

  const timeInput = withTime && (
    <div className="flex items-center gap-3 px-4 pb-1">
      <Label htmlFor={`${id}-time`} className="text-sm">
        Time
      </Label>
      <Input id={`${id}-time`} type="time" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1" />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
          <DrawerContent>
            <DrawerHeader className="pb-0">
              <DrawerTitle className="text-center">{label || "Select date"}</DrawerTitle>
            </DrawerHeader>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setDay}
                defaultMonth={selected}
                initialFocus
                classNames={{
                  head_cell: "text-muted-foreground rounded-md w-11 font-normal text-[0.8rem]",
                  cell: "h-11 w-11 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  day: "h-11 w-11 p-0 font-normal rounded-full hover:bg-accent aria-selected:opacity-100",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  day_today: "border border-primary text-primary",
                }}
              />
            </div>
            {timeInput}
            <DrawerFooter className="flex-row gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button type="button" variant="outline" className="flex-1" onClick={setToday}>
                {withTime ? "Now" : "Today"}
              </Button>
              <Button type="button" className="flex-1" onClick={() => setOpen(false)}>
                Done
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={setDay} defaultMonth={selected} initialFocus className="p-3 pointer-events-auto" />
        {timeInput}
        <div className="flex gap-2 p-3 pt-2">
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={setToday}>
            {withTime ? "Now" : "Today"}
          </Button>
          {withTime && (
            <Button type="button" size="sm" className="flex-1" onClick={() => setOpen(false)}>
              Done
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
