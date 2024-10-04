import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../ui/textarea";

const accountFormSchema = z.object({
  name: z
    .string({
      required_error: "Please name this account!",
    })
    .min(1)
    .max(50),
  currency: z
    .string({
      required_error: "Please select a currency!",
    })
    .min(1)
    .max(50),
  description: z.string().optional(),
  tempID: z.string(),
});

export default function AccountsForm() {
  const [accountList, setAccountList] = useState<
    z.infer<typeof accountFormSchema>[]
  >([]);

  const [currentAccountInfo, setCurrentAccountInfo] = useState<{
    tempID: string;
    index: number | null;
  }>({
    tempID: "",
    index: null,
  });

  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      currency: "",
      description: "",
      tempID: crypto.randomUUID().toString(),
    },
  });

  function onSubmit(values: z.infer<typeof accountFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    setAccountList((prev) => [...prev, values]);
    form.reset();
    form.setValue("tempID", crypto.randomUUID().toString());
  }

  const handleRemoveAccount = ({ tempID }: { tempID: string }) => {
    setAccountList((prev) =>
      prev.filter((account) => account.tempID !== tempID)
    );

    setCurrentAccountInfo({
      tempID: "",
      index: null,
    });
    form.reset();
  };

  const handleCurrentAccountSelection = (tempID?: string, index?: number) => {
    setCurrentAccountInfo(
      tempID
        ? {
            tempID: tempID,
            index: index!,
          }
        : {
            tempID: "",
            index: null,
          }
    );

    if (tempID) {
      form.setValue("name", accountList[index!].name);
      form.setValue("description", accountList[index!].description);
      form.setValue("currency", accountList[index!].currency);
      form.setValue("tempID", accountList[index!].tempID);
      return;
    }

    form.reset();
  };

  return (
    <div className="grid grid-flow-col h-full gap-5">
      <div className="grid grid-flow-row h-fit ">
        <ScrollArea className="h-[300px] px-1 w-[150px]">
          <Button
            variant="ghost"
            className={cn(
              currentAccountInfo.tempID === ""
                ? "bg-accent text-accent-foreground"
                : ""
            )}
            onClick={() => {
              handleCurrentAccountSelection();
            }}
          >
            <span
              className={`justify-start font-normal text-ellipsis w-[100px] overflow-hidden`}
            >
              Add New
            </span>
          </Button>
          {accountList.map((account, index) => (
            <Button
              key={`${account.tempID}`}
              variant="ghost"
              className={cn(
                "mt-2",
                currentAccountInfo.tempID === account.tempID
                  ? "bg-accent text-accent-foreground"
                  : ""
              )}
              onClick={() => {
                handleCurrentAccountSelection(account.tempID, index);
              }}
            >
              <span className="justify-start font-normal text-ellipsis w-[100px] overflow-hidden">
                {account.name} ({account.currency})
              </span>
            </Button>
          ))}
        </ScrollArea>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className={cn(
              "flex",
              currentAccountInfo.tempID ? "justify-between" : "justify-end"
            )}
          >
            {currentAccountInfo?.tempID ? (
              <Button
                variant={"destructive"}
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveAccount(currentAccountInfo);
                }}
              >
                Delete
              </Button>
            ) : null}
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
