import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Air from "./components/Air";
import Water from "./components/Water";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route index element={<Navigate to="air" replace />} />
        <Route path="air" element={<Air />} />
        <Route path="water" element={<Water />} />
      </Route>
    </Routes>
  );
}

export default App;
