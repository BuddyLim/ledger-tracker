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

export interface CategoryFormSelectionProps {
  categoryName: string;
  categoryId: string;
  subCategoryId: string;
  subCategoryName: string;
}

export interface CategoryGroupSelectionProps {
  heading: string;
  id: string;
  selections: SelectionProps[];
}

export function Combobox(props: {
  categoryGroupSelectionList: CategoryGroupSelectionProps[];
  placeholder: string;
  searchText: string;
  noEntryText: string;
  value: string;
  onSelect: (selectObj: CategoryFormSelectionProps) => void;
}) {
  const {
    categoryGroupSelectionList,
    placeholder,
    searchText,
    noEntryText,
    value,
    onSelect,
  } = props;

  const selectionList = categoryGroupSelectionList
    .map((groupSelection) =>
      groupSelection.selections.map((selection) => {
        return {
          ...selection,
        };
      })
    )
    .flat();

  const [open, setOpen] = useState(false);

  const handleOnSelect = (selectObj: CategoryFormSelectionProps) => {
    setOpen(false);
    onSelect(selectObj);
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
            ? selectionList.find((selection) => selection.value === value)
                ?.label
            : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 popover-content-width-same-as-its-trigger">
        <Command>
          <CommandInput placeholder={searchText} className="h-9" />
          <CommandList>
            <CommandEmpty>{noEntryText}</CommandEmpty>
            {categoryGroupSelectionList.map(({ heading, selections, id }) => (
              <CommandGroup heading={heading}>
                {selections.map((selection) => (
                  <CommandItem
                    key={selection.value}
                    value={selection.value}
                    onSelect={(value) =>
                      handleOnSelect({
                        categoryId: id,
                        categoryName: heading,
                        subCategoryName: value,
                        subCategoryId: selection.id,
                      })
                    }
                  >
                    {selection.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === selection.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup></CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
