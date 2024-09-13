import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectionProps {
  value: string;
  label: string;
  id: string;
}

export interface AccountFormSelectionProps {
  accountName: string;
  accountId: string;
}

export function AccountCombobox(props: {
  accountSelectionList: AccountFormSelectionProps[];
  placeholder: string;
  searchText: string;
  noEntryText: string;
  value: string;
  onSelect: (selectObj: AccountFormSelectionProps) => void;
}) {
  const {
    accountSelectionList,
    placeholder,
    searchText,
    noEntryText,
    value,
    onSelect,
  } = props;

  const selectionList = accountSelectionList
    .map((account) => {
      return {
        ...account,
      };
    })
    .flat();

  const [open, setOpen] = useState(false);
  // const [value, setValue] = useState("");

  const handleOnSelect = (selectObj: AccountFormSelectionProps) => {
    setOpen(false);

    if (onSelect) {
      onSelect(selectObj);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? selectionList.find((selection) => selection.accountName === value)
                ?.accountName
            : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 popover-content-width-same-as-its-trigger">
        <Command>
          <CommandInput placeholder={searchText} className="h-9" />
          <CommandList>
            <CommandEmpty>{noEntryText}</CommandEmpty>
            <CommandGroup>
              {accountSelectionList.map(({ accountId, accountName }) => (
                <CommandItem
                  key={accountId}
                  value={accountName}
                  onSelect={(value) =>
                    handleOnSelect({ accountId: accountId, accountName: value })
                  }
                >
                  {accountName}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === accountName ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup></CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
