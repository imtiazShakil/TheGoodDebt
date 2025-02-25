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
      <div className="min-h-screen overflow-auto">
        <BrowserRouter>
          <Header></Header>
          <main className="mx-2">
            <Routes>
              <Route path="/" element={<ContactListComponent />} />
              <Route path="/customer" element={<Customer />} />
            </Routes>
          </main>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
