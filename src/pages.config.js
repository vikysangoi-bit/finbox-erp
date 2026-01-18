import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import JournalEntries from './pages/JournalEntries';
import Inventory from './pages/Inventory';
import InventoryTransactions from './pages/InventoryTransactions';


export const PAGES = {
    "Dashboard": Dashboard,
    "ChartOfAccounts": ChartOfAccounts,
    "JournalEntries": JournalEntries,
    "Inventory": Inventory,
    "InventoryTransactions": InventoryTransactions,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
};