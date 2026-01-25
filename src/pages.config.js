import Approvals from './pages/Approvals';
import AuditLogs from './pages/AuditLogs';
import ChartOfAccounts from './pages/ChartOfAccounts';
import CreditNotes from './pages/CreditNotes';
import Currencies from './pages/Currencies';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import FinancialReports from './pages/FinancialReports';
import GoodsReceipts from './pages/GoodsReceipts';
import Inventory from './pages/Inventory';
import InventoryReports from './pages/InventoryReports';
import InventoryTransactions from './pages/InventoryTransactions';
import Invoices from './pages/Invoices';
import JournalEntries from './pages/JournalEntries';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseReports from './pages/PurchaseReports';
import Receipts from './pages/Receipts';
import Reports from './pages/Reports';
import SalesOrders from './pages/SalesOrders';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Approvals": Approvals,
    "AuditLogs": AuditLogs,
    "ChartOfAccounts": ChartOfAccounts,
    "CreditNotes": CreditNotes,
    "Currencies": Currencies,
    "Dashboard": Dashboard,
    "Documents": Documents,
    "FinancialReports": FinancialReports,
    "GoodsReceipts": GoodsReceipts,
    "Inventory": Inventory,
    "InventoryReports": InventoryReports,
    "InventoryTransactions": InventoryTransactions,
    "Invoices": Invoices,
    "JournalEntries": JournalEntries,
    "PurchaseOrders": PurchaseOrders,
    "PurchaseReports": PurchaseReports,
    "Receipts": Receipts,
    "Reports": Reports,
    "SalesOrders": SalesOrders,
    "Suppliers": Suppliers,
    "Users": Users,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};