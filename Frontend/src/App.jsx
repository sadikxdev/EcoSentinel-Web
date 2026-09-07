import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Login from "./components/login";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import ImageUpload from "./components/ImageUpload";
import MyImages from "./components/Myimages";

import "./App.css";

function isTokenValid() {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);

    if (!decoded.exp) {
      return false;
    }

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return false;
    }

    return true;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return false;
  }
}

function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function LoginRoute() {
  if (isTokenValid()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRoute />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="upload" element={<ImageUpload />} />
          <Route path="images" element={<MyImages />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;