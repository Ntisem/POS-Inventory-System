import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { OverviewVariants } from './pages/OverviewVariants';
import { Products } from './pages/Products';
import { AddProducts } from './pages/AddProducts';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import './components/ui/ui.css';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <InventoryProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="overview/:id" element={<OverviewVariants />} />
                    <Route path="products" element={<Products />} />
                    <Route path="add-products" element={<AddProducts />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="transactions" element={<Transactions />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </InventoryProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
