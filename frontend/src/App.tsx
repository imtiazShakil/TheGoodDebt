import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Header from "./Header";
import { BrowserRouter, Route, Routes } from "react-router";
import Customer from "./Customer";
import ContactListComponent from "./ContactListComponent";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex h-screen flex-col">
        <BrowserRouter>
          <Header></Header>
          <main className="mx-2 flex min-h-0 flex-1 flex-col">
            <Routes>
              <Route path="/" element={<ContactListComponent />} />
              <Route path="/customer" element={<Customer />} />
            </Routes>
            <div className="bg-accent text-accent-content/70 mt-auto text-center">
              The Good Debt &copy; 2025
            </div>
          </main>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
