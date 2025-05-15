import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageType, PresentationConfig } from "../type";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Types
interface ConfigurationSelectsProps {
  config: PresentationConfig;
  onConfigChange: (key: keyof PresentationConfig, value: string) => void;
}

type SlideOption = "5" | "8" | "10" | "12" | "15" | "18" | "20";

// Constants
const SLIDE_OPTIONS: SlideOption[] = ["5", "8", "10", "12", "15", "18", "20"];

/**
 * Renders a select component for slide count
 */
const SlideCountSelect: React.FC<{
  value: string | null;
  onValueChange: (value: string) => void;
}> = ({ value, onValueChange }) => (
  <Select value={value || ""} onValueChange={onValueChange} name="slides">
    <SelectTrigger
      className="w-[180px] font-instrument_sans font-medium bg-blue-100 border-blue-200 focus-visible:ring-blue-300"
      data-testid="slides-select"
    >
      <SelectValue placeholder="Select Slides" />
    </SelectTrigger>
    <SelectContent className="font-instrument_sans">
      {SLIDE_OPTIONS.map((option) => (
        <SelectItem
          key={option}
          value={option}
          className="font-instrument_sans text-sm font-medium"
          role="option"
        >
          {option} slides
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/**
 * Renders a language selection component with search functionality
 */
const LanguageSelect: React.FC<{
  value: string | null;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ value, onValueChange, open, onOpenChange }) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        name="language"
        data-testid="language-select"
        aria-expanded={open}
        className="w-[200px] justify-between font-instrument_sans font-semibold overflow-hidden bg-blue-100 hover:bg-blue-100 border-blue-200 focus-visible:ring-blue-300 border-none"
      >
        <p className="text-sm font-medium truncate">
          {value || "Select language"}
        </p>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[300px] p-0" align="end">
      <Command>
        <CommandInput
          placeholder="Search language..."
          className="font-instrument_sans"
        />
        <CommandList>
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {Object.values(LanguageType).map((language) => (
              <CommandItem
                key={language}
                value={language}
                role="option"
                onSelect={(currentValue) => {
                  onValueChange(currentValue);
                  onOpenChange(false);
                }}
                className="font-instrument_sans"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === language ? "opacity-100" : "opacity-0"
                  )}
                />
                {language}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

export function ConfigurationSelects({
  config,
  onConfigChange,
}: ConfigurationSelectsProps) {
  const [openLanguage, setOpenLanguage] = useState(false);

  return (
    <div className="flex flex-wrap order-1 gap-4">
      <SlideCountSelect
        value={config.slides}
        onValueChange={(value) => onConfigChange("slides", value)}
      />
      <LanguageSelect
        value={config.language}
        onValueChange={(value) => onConfigChange("language", value)}
        open={openLanguage}
        onOpenChange={setOpenLanguage}
      />
    </div>
  );
}
