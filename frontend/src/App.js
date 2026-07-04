import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReaderProvider } from "@/context/ReaderContext";
import ReaderPage from "@/pages/ReaderPage";
import SharedReaderPage from "@/pages/SharedReaderPage";

function App() {
  return (
    <div className="App">
      <ReaderProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ReaderPage />} />
            <Route path="/r/:shareId" element={<SharedReaderPage />} />
          </Routes>
        </BrowserRouter>
      </ReaderProvider>
    </div>
  );
}

export default App;
