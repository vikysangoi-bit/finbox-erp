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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
};