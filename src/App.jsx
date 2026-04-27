import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminPage from "./pages/AdminPage";
import AddListing from "./pages/AddListing";
import Listings from "./pages/Listings";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Navbar from "./Navbar";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import { CartProvider } from "./CartContext";
import ThemeToggle from "./ThemeToggle";

export default function App() {
  return (
    <CartProvider>
      <div>
        <Navbar />
        <ThemeToggle />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/cart" element={<Cart />} />

          {/* Protected User Routes (Requires Login) */}
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditListing />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
      <footer className="footer">
        <div className="container">
          <a 
            href="https://github.com/slklnarnv/parts-marketplace" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <svg height="20" viewBox="0 0 16 16" width="20" style={{ fill: "currentColor" }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
    </CartProvider>
  );
}
