import { DatePickerFormItem } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Combobox,
  CategoryFormSelectionProps,
} from "@/components/combobox/category-combobox";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Skeleton } from "../ui/skeleton";
import {
  AccountCombobox,
  AccountFormSelectionProps,
} from "../combobox/account-combobox";

interface SubcategoryProps {
  name: string;
  id: string;
}

const categoryData = [
  {
    category: {
      name: "Food",
      id: "category-1",
      subcategory: [
        {
          name: "Lunch",
          id: "subcategory-1",
        },
        {
          name: "Dinner",
          id: "subcategory-2",
        },
        {
          name: "Coffee",
          id: "subcategory-3",
        },
      ],
    },
  },
  {
    category: {
      name: "Living",
      id: "category-2",
      subcategory: [
        {
          name: "Rent",
          id: "subcategory-4",
        },
        {
          name: "Phone Bill",
          id: "subcategory-5",
        },
      ],
    },
  },
];

const accountData = [
  {
    name: "UOB",
    id: "account-1",
  },
  {
    name: "DBS",
    id: "account-2",
  },
  {
    name: "OCBC",
    id: "account-3",
  },
];

const formSchema = z.object({
  name: z
    .string({
      required_error: "Must have at least one character",
    })
    .min(1)
    .max(50),
  amount: z.coerce
    .number({
      required_error: "Please insert an amount!",
    })
    .multipleOf(0.01)
    .min(0)
    .nonnegative("Amount cannot be negative!"),
  category: z.object({
    name: z
      .string()
      .refine((name) =>
        categoryData.map((categoryObj) =>
          categoryObj.category.name.includes(name)
        )
      ),
    id: z
      .string()
      .refine((id) =>
        categoryData.map((categoryObj) => categoryObj.category.id.includes(id))
      ),
  }),
  subCategory: z.object(
    {
      name: z
        .string()
        .refine((name) =>
          categoryData.map((categoryObj) =>
            categoryObj.category.subcategory
              .map((subCategoryObj) => subCategoryObj.name)
              .includes(name)
          )
        ),
      id: z
        .string()
        .refine((id) =>
          categoryData.map((categoryObj) =>
            categoryObj.category.subcategory
              .map((subCategoryObj) => subCategoryObj.id)
              .includes(id)
          )
        ),
    },
    {
      required_error: "Please select a category!",
    }
  ),
  account: z.object(
    {
      id: z
        .string()
        .refine((id) =>
          accountData.map((accountObj) => accountObj.id).includes(id)
        ),
      name: z
        .string()
        .refine((name) =>
          accountData.map((accountObj) => accountObj.name).includes(name)
        ),
    },
    {
      required_error: "Please select an account!",
    }
  ),
  date: z.date({
    required_error: "Please select a date!",
  }),
  description: z.string().max(200).optional(),
  image: z.any().optional(),
});

export function TransactionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: undefined,
      account: undefined,
      date: new Date(),
    },
  });

  const [suggestionList, setSuggestionList] = useState<SubcategoryProps[]>([]);

  const mutation = useMutation({
    mutationFn: () => {
      return fetch("http://127.0.0.1:3000/qwen", {
        method: "POST",
        body: JSON.stringify({
          operation: "category_suggestion",
          transaction: form.getValues("name"),
          cat_list: categoryData
            .map((catObj) =>
              catObj.category.subcategory.map((subObj) => subObj)
            )
            .flat(),
        }),
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: async (data) => {
      const value: SubcategoryProps[] = await data.json();
      setSuggestionList(value);
    },
    onSettled: async () => {
      console.log("I'm second!");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-rows-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      onBlurCapture={() =>
                        form.getValues("category") == null && mutation.mutate()
                      }
                      {...field}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-rows-1 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name={"subCategory"}
              render={({ field }) => {
                return (
                  <FormItem key={field.name} className="w-full">
                    <FormLabel>Category</FormLabel>
                    <div className={`grid gap-4`}>
                      <FormControl>
                        <Combobox
                          placeholder="Select Category"
                          noEntryText="No category found"
                          searchText="Search categories"
                          value={form.getValues("subCategory")?.name}
                          onSelect={(val: CategoryFormSelectionProps) => {
                            field.onChange({
                              name: val.subCategoryName,
                              id: val.subCategoryId,
                            });
                            form.setValue("category", {
                              name: val.categoryName,
                              id: val.categoryId,
                            });
                          }}
                          categoryGroupSelectionList={categoryData.map(
                            (catObj) => {
                              return {
                                heading: catObj.category.name,
                                id: catObj.category.id,
                                selections: catObj.category.subcategory.map(
                                  (subObj) => {
                                    return {
                                      value: subObj.name,
                                      id: subObj.id,
                                      label: subObj.name,
                                    };
                                  }
                                ),
                              };
                            }
                          )}
                        />
                      </FormControl>
                      <div
                        className={cn(`grid-cols-3 gap-2 grid`, {
                          grid: field.value == null,
                          hidden: field.value != null,
                        })}
                      >
                        {mutation.isPending
                          ? [1, 2, 3].map((value) => (
                              <Skeleton key={value} className="h-9" />
                            ))
                          : suggestionList.map(({ id, name }) => (
                              <Button
                                variant={"secondary"}
                                className="cursor-pointer h-fit fade-in-100 fade-out-100"
                                key={id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  field.onChange(name);
                                }}
                              >
                                {name}
                              </Button>
                            ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className="grid grid-rows-1 gap-4">
            <FormField
              control={form.control}
              name={"account"}
              render={({ field }) => {
                return (
                  <FormItem key={field.name} className="w-full">
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <AccountCombobox
                        placeholder="Select Account"
                        noEntryText="No account found"
                        searchText="Search account"
                        value={form.getValues("account")?.name}
                        onSelect={(val: AccountFormSelectionProps) => {
                          field.onChange({
                            name: val.accountName,
                            id: val.accountId,
                          });
                        }}
                        accountSelectionList={accountData.map((account) => {
                          return {
                            accountName: account.name,
                            accountId: account.id,
                          };
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className="grid grid-rows-1 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem key={field.name} className="grid grid-rows-1">
                  {/* <div className="grid grid-rows-1 gap-4"> */}
                  <FormLabel className="h-fit">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <DatePickerFormItem
                          selected={field.value}
                          onSelect={(value: Date) => {
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                    </PopoverTrigger>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-rows-1 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem key={field.name} className="grid grid-rows-1">
                  <FormLabel className="h-fit">
                    Desc.{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-rows-1 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem key={field.name} className="grid grid-rows-1">
                  <FormLabel className="h-fit">
                    Image{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input id="image" type="file" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant={"secondary"} type="submit">
            Add More
          </Button>
          <Button type="submit">Add Transaction</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
