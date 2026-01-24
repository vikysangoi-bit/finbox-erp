import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Package,
  ArrowRightLeft,
  CheckSquare,
  Coins,
  FolderOpen,
  Users,
  ScrollText,
  Menu,
  LogOut,
  ChevronRight,
  Building2,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { 
    name: 'Order to Cash', 
    icon: ArrowRightLeft, 
    children: [
      { name: 'Sales Orders', page: 'SalesOrders' },
      { name: 'Invoices', page: 'Invoices' },
      { name: 'Credit Notes', page: 'CreditNotes' },
      { name: 'Receipts', page: 'Receipts' },
    ]
  },
  { 
    name: 'Procure to Pay', 
    icon: FileText, 
    children: [
      { name: 'Purchase Orders', page: 'PurchaseOrders' },
      { name: 'Goods Receipts', page: 'GoodsReceipts' },
      { name: 'Vendor Bills', page: 'VendorBills' },
      { name: 'Debit Notes', page: 'DebitNotes' },
      { name: 'Payments', page: 'Payments' },
    ]
  },
  { 
    name: 'Accounting', 
    icon: BookOpen, 
    children: [
      { name: 'Chart of Accounts', page: 'ChartOfAccounts' },
      { name: 'Journal Entries', page: 'JournalEntries' },
    ]
  },
  { 
    name: 'Inventory', 
    icon: Package, 
    children: [
      { name: 'Items', page: 'Inventory' },
      { name: 'Transactions', page: 'InventoryTransactions' },
    ]
  },
  { 
    name: 'Reports', 
    icon: BarChart3, 
    children: [
      { name: 'Reports Hub', page: 'Reports' },
      { name: 'Financial Reports', page: 'FinancialReports' },
      { name: 'Inventory Reports', page: 'InventoryReports' },
      { name: 'Purchase Reports', page: 'PurchaseReports' },
    ]
  },
  { name: 'Approvals', icon: CheckSquare, page: 'Approvals' },
  { name: 'Currencies', icon: Coins, page: 'Currencies' },
  { name: 'Documents', icon: FolderOpen, page: 'Documents' },
  { name: 'Users', icon: Users, page: 'Users' },
  { name: 'Audit Logs', icon: ScrollText, page: 'AuditLogs' },
];

function NavItem({ item, currentPageName, expanded, setExpanded, mobile = false }) {
  const isActive = item.page === currentPageName || item.children?.some(c => c.page === currentPageName);
  const hasChildren = item.children?.length > 0;
  const isExpanded = expanded === item.name;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(isExpanded ? null : item.name)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
        {isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.page}
                to={createPageUrl(child.page)}
                className={`block px-3 py-2 rounded-lg text-sm transition-all
                  ${child.page === currentPageName 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={createPageUrl(item.page)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
        ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.name}</span>
    </Link>
  );
}

function Sidebar({ currentPageName, mobile = false }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">GarmentERP</h1>
            <p className="text-xs text-slate-500">Accounting & Inventory</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            currentPageName={currentPageName}
            expanded={expanded}
            setExpanded={setExpanded}
            mobile={mobile}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">© 2024 GarmentERP</p>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white border-r border-slate-200">
        <Sidebar currentPageName={currentPageName} />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar currentPageName={currentPageName} mobile />
            </SheetContent>
          </Sheet>

          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">GarmentERP</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-72">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-end px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-65px)]">
          {children}
        </div>
      </main>
    </div>
  );
}