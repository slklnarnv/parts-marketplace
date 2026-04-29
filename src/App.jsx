import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "./Navbar";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "./AuthContext";
import ThemeToggle from "./ThemeToggle";
import ToastContainer from "./ToastContainer";

// Lazy-loaded pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Listings = lazy(() => import("./pages/Listings"));
const Cart = lazy(() => import("./pages/Cart"));
const AddListing = lazy(() => import("./pages/AddListing"));
const MyListings = lazy(() => import("./pages/MyListings"));
const EditListing = lazy(() => import("./pages/EditListing"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-loaded route guards
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const AdminRoute = lazy(() => import("./AdminRoute"));

// Page title map
const pageTitles = {
  "/": "Home",
  "/login": "Login",
  "/signup": "Sign Up",
  "/listings": "All Listings",
  "/cart": "My Cart",
  "/add": "Add Listing",
  "/my-listings": "My Listings",
  "/orders": "Order History",
  "/admin": "Admin Dashboard",
};

function PageTitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const base = "MarineParts";
    const title = pageTitles[location.pathname];
    document.title = title ? `${title} — ${base}` : base;
  }, [location.pathname]);
  return null;
}

function LoadingFallback() {
  return (
    <div className="container" style={{ padding: "100px 20px", textAlign: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading...</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <CartProvider>
      <div>
        <Navbar />
        <ThemeToggle />
        <PageTitleUpdater />
        <ToastContainer />
        <Suspense fallback={<LoadingFallback />}>
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

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
    </AuthProvider>
  );
}
