import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import JournalEntries from './pages/JournalEntries';
import Inventory from './pages/Inventory';
import InventoryTransactions from './pages/InventoryTransactions';
import Approvals from './pages/Approvals';
import Currencies from './pages/Currencies';
import Documents from './pages/Documents';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import GoodsReceipts from './pages/GoodsReceipts';
import Reports from './pages/Reports';
import FinancialReports from './pages/FinancialReports';
import InventoryReports from './pages/InventoryReports';
import PurchaseReports from './pages/PurchaseReports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ChartOfAccounts": ChartOfAccounts,
    "JournalEntries": JournalEntries,
    "Inventory": Inventory,
    "InventoryTransactions": InventoryTransactions,
    "Approvals": Approvals,
    "Currencies": Currencies,
    "Documents": Documents,
    "Users": Users,
    "AuditLogs": AuditLogs,
    "Suppliers": Suppliers,
    "PurchaseOrders": PurchaseOrders,
    "GoodsReceipts": GoodsReceipts,
    "Reports": Reports,
    "FinancialReports": FinancialReports,
    "InventoryReports": InventoryReports,
    "PurchaseReports": PurchaseReports,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};