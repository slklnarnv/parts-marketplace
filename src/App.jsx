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

export default function App() {
  return (
    <CartProvider>
      <div>
        <Navbar />
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
    </div>
    </CartProvider>
  );
}
