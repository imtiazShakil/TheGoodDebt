import { CheckFat, Info, Warning, XCircle } from "@phosphor-icons/react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import BorrowingContractListComponent from "./BorrowingContractListComponent";
import ContactListComponent from "./ContactListComponent";
import Header from "./Header";
import LendingContractListComponent from "./LendingContractListComponent";
import TransactionListComponent from "./TransactionListComponent";
import VaultListComponent from "./VaultListComponent";

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        visibleToasts={9}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "alert shadow-lg min-w-72",
            success: "alert-success",
            error: "alert-error",
            info: "alert-info",
            warning: "alert-warning",
            title: "font-semibold",
            description: "text-sm opacity-75",
          },
        }}
        icons={{
          success: <CheckFat size={20} weight="fill" />,
          error: <XCircle size={20} weight="fill" />,
          info: <Info size={20} weight="fill" />,
          warning: <Warning size={20} weight="fill" />,
        }}
        offset={{ bottom: "48px" }}
      />
      <div className="flex h-screen flex-col">
        <BrowserRouter>
          <Header></Header>
          <main className="mx-2 flex min-h-0 flex-1 flex-col">
            <Routes>
              <Route path="/" element={<ContactListComponent />} />
              <Route path="/vaults" element={<VaultListComponent />} />
              <Route
                path="/lending-contracts"
                element={<LendingContractListComponent />}
              />
              <Route
                path="/borrowing-contracts"
                element={<BorrowingContractListComponent />}
              />
              <Route
                path="/transactions"
                element={<TransactionListComponent />}
              />
            </Routes>
            <div className="bg-accent text-accent-content/70 mt-auto text-center">
              The Good Debt &copy; 2026
            </div>
          </main>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
