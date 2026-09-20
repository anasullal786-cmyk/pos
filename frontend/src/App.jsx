import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import { TablesProvider } from './context/TablesContext.jsx';
import { OrdersProvider } from './context/OrdersContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import POSPage from './pages/POSPage.jsx';
import TablesPage from './pages/TablesPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SettingsProvider>
          <MenuProvider>
            <TablesProvider>
              <OrdersProvider>
                <CartProvider>
                  <Routes>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/pos" element={<POSPage />} />
                      <Route path="/tables" element={<TablesPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/orders/:id" element={<OrderDetailsPage />} />
                      <Route path="/menu" element={<MenuPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Routes>
                </CartProvider>
              </OrdersProvider>
            </TablesProvider>
          </MenuProvider>
        </SettingsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
