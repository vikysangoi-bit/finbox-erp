import Approvals from './pages/Approvals';
import AuditLogs from './pages/AuditLogs';
import ChartOfAccounts from './pages/ChartOfAccounts';
import Currencies from './pages/Currencies';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import FinancialReports from './pages/FinancialReports';
import GoodsReceipts from './pages/GoodsReceipts';
import Inventory from './pages/Inventory';
import InventoryReports from './pages/InventoryReports';
import InventoryTransactions from './pages/InventoryTransactions';
import JournalEntries from './pages/JournalEntries';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseReports from './pages/PurchaseReports';
import Reports from './pages/Reports';
import SalesOrders from './pages/SalesOrders';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import Invoices from './pages/Invoices';
import Receipts from './pages/Receipts';
import CreditNotes from './pages/CreditNotes';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Approvals": Approvals,
    "AuditLogs": AuditLogs,
    "ChartOfAccounts": ChartOfAccounts,
    "Currencies": Currencies,
    "Dashboard": Dashboard,
    "Documents": Documents,
    "FinancialReports": FinancialReports,
    "GoodsReceipts": GoodsReceipts,
    "Inventory": Inventory,
    "InventoryReports": InventoryReports,
    "InventoryTransactions": InventoryTransactions,
    "JournalEntries": JournalEntries,
    "PurchaseOrders": PurchaseOrders,
    "PurchaseReports": PurchaseReports,
    "Reports": Reports,
    "SalesOrders": SalesOrders,
    "Suppliers": Suppliers,
    "Users": Users,
    "Invoices": Invoices,
    "Receipts": Receipts,
    "CreditNotes": CreditNotes,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};