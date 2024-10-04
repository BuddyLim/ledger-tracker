import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeProvider } from "@/components/theme-provider";
import { TransactionForm } from "@/components/transaction-form";
import CategoriesForm from "@/components/categories-form";
import AccountsForm from "@/components/accounts-form";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Button>Click me</Button>
      {/* <Dialog open aria-modal>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[575px]">
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm />
          <AccountsForm />
          <CategoriesForm />
        </DialogContent>
      </Dialog> */}
      <CategoriesForm />
    </ThemeProvider>
  );
}

export default App;
