import { BrowserRouter, Route, Routes } from "react-router";
import BorrowingContractListComponent from "./BorrowingContractListComponent";
import ContactListComponent from "./ContactListComponent";
import Header from "./Header";
import LendingContractListComponent from "./LendingContractListComponent";
import VaultListComponent from "./VaultListComponent";

function App() {
  return (
    <>
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
