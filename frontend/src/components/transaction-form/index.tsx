import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePickerFormItem } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "../ui/dialog";
import { Popover, PopoverTrigger } from "../ui/popover";
import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";

const categoryData = [
  {
    category: {
      name: "Food",
      id: "category-1",
      subcategory: [
        {
          name: "Apple",
          id: "subcategory-1",
        },
        {
          name: "Banana",
          id: "subcategory-2",
        },
        {
          name: "Grapes",
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
    .number()
    .int()
    .min(0)
    .nonnegative("Amount cannot be negative!"),
  category: z
    .string()
    .refine((name) =>
      categoryData.map((categoryObj) =>
        categoryObj.category.subcategory
          .map((subCategoryObj) => subCategoryObj.name)
          .includes(name)
      )
    ),
  account: z
    .string()
    .refine((name) =>
      accountData.map((accountObj) => accountObj.name).includes(name)
    ),
  date: z.date(),
});

const CategorySelection = () => {
  return (
    <SelectContent>
      <SelectGroup>
        {categoryData.map((categoryObjData) => {
          return (
            <div key={categoryObjData.category.id}>
              <SelectLabel>{categoryObjData.category.name}</SelectLabel>
              {categoryObjData.category.subcategory.map((subCatObjData) => {
                return (
                  <SelectItem key={subCatObjData.id} value={subCatObjData.name}>
                    {subCatObjData.name}
                  </SelectItem>
                );
              })}
            </div>
          );
        })}
      </SelectGroup>
    </SelectContent>
  );
};

const AccountSelection = () => {
  return (
    <SelectContent>
      <SelectGroup>
        {accountData.map((accountObj) => {
          return (
            <SelectItem key={accountObj.id} value={accountObj.name}>
              {accountObj.name}
            </SelectItem>
          );
        })}
      </SelectGroup>
    </SelectContent>
  );
};

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
      // .then(async (res) => {
      //   const parsedValue = await res.json();
      //   console.log(parsedValue);
      // }),
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: async (data) => {
      const value = await data.json();
      console.log(value);
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

  const ref = useRef<NodeJS.Timeout | null>(null);

  const handleDebounceInput = () => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }

    ref.current = setTimeout(() => {
      mutation.mutate();
      console.log(form.getValues("name"));
    }, 500);
  };

  const suggestionList = ["Apple", "Banana", "Grapes"];

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
                      onBlurCapture={() => mutation.mutate()}
                      {...field}
                      maxLength={50}
                      // onInput={handleDebounceInput}
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
            <div>
              <FormField
                control={form.control}
                name={"category"}
                render={({ field }) => {
                  return (
                    <FormItem key={field.name} className="w-full">
                      <FormLabel>Category</FormLabel>
                      <div
                        className={`grid ${
                          field.value == null ? "grid-cols-2" : "grid-cols-1"
                        } gap-4`}
                      >
                        <div>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                            value={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <CategorySelection />
                          </Select>
                        </div>
                        <div
                          className={`${
                            field.value == null ? "grid" : "hidden"
                          } grid-cols-3 gap-2`}
                        >
                          {suggestionList.map((suggestion) => (
                            <Button
                              variant={"secondary"}
                              className="cursor-pointer h-fit"
                              key={suggestion}
                              onClick={(e) => {
                                e.preventDefault();
                                field.onChange(suggestion);
                              }}
                            >
                              {suggestion}
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
          </div>
          <div className="grid grid-rows-1 gap-4">
            <FormField
              control={form.control}
              name={"account"}
              render={({ field }) => {
                return (
                  <FormItem key={field.name} className="w-full">
                    <FormLabel>Account</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <AccountSelection />
                    </Select>
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
            <Label htmlFor="amount" className="h-fit">
              Desc.{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea />
          </div>
          <div className="grid grid-rows-1 gap-4">
            <Label htmlFor="image" className="h-fit">
              Image{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input id="image" type="file" />
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
