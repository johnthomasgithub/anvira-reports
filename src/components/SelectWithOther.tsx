import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SelectWithOtherProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SelectWithOther = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}: SelectWithOtherProps) => {
  const [isOther, setIsOther] = useState(
    !!value && !options.includes(value) && value !== ""
  );

  const handleSelectChange = (val: string) => {
    if (val === "__other__") {
      setIsOther(true);
      onChange("");
    } else {
      setIsOther(false);
      onChange(val);
    }
  };

  if (isOther) {
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type here..."
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => {
            setIsOther(false);
            onChange("");
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <Select value={value || undefined} onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
        <SelectItem value="__other__">Other (type manually)</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectWithOther;
