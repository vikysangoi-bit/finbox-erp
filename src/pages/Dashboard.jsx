import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Card } from "@/components/ui/card";
import { DollarSign, Package, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.InventoryItem.list()
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 100)
  });

  const { data: approvalRequests = [] } = useQuery({
    queryKey: ['approval-requests'],
    queryFn: () => base44.entities.ApprovalRequest.list('-created_date', 20)
  });

  // Calculate stats
  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + (a.current_balance || 0), 0);
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.total_value || i.quantity_on_hand * i.unit_cost || 0), 0);
  const lowStockItems = inventory.filter(i => i.quantity_on_hand <= i.reorder_level).length;
  const pendingApprovals = approvalRequests.filter(r => r.status === 'pending').length;

  // Chart data - entries by month
  const monthlyData = React.useMemo(() => {
    const months = {};
    journalEntries.forEach(entry => {
      if (entry.entry_date) {
        const month = entry.entry_date.substring(0, 7);
        if (!months[month]) months[month] = { month, debit: 0, credit: 0 };
        months[month].debit += entry.total_debit || 0;
        months[month].credit += entry.total_credit || 0;
      }
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [journalEntries]);

  // Inventory by category
  const inventoryByCategory = React.useMemo(() => {
    const categories = {};
    inventory.forEach(item => {
      const cat = item.category || 'other';
      if (!categories[cat]) categories[cat] = { name: cat, value: 0 };
      categories[cat].value += item.total_value || item.quantity_on_hand * item.unit_cost || 0;
    });
    return Object.values(categories);
  }, [inventory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Garment ERP Overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assets"
            value={`$${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="Inventory Value"
            value={`$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={Package}
            subtitle={`${inventory.length} items`}
          />
          <StatCard
            title="Low Stock Alert"
            value={lowStockItems}
            icon={AlertTriangle}
            className={lowStockItems > 0 ? "border-l-4 border-amber-500" : ""}
          />
          <StatCard
            title="Pending Approvals"
            value={pendingApprovals}
            icon={FileText}
            className={pendingApprovals > 0 ? "border-l-4 border-blue-500" : ""}
          />
        </div>

        {/* Charts & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Transactions Chart */}
          <Card className="lg:col-span-2 p-6 border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Transaction Trends</h3>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Area type="monotone" dataKey="debit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDebit)" strokeWidth={2} />
                  <Area type="monotone" dataKey="credit" stroke="#10b981" fillOpacity={1} fill="url(#colorCredit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <QuickActions />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory by Category */}
          <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Inventory by Category</h3>
            <div className="h-64 flex items-center">
              {inventoryByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {inventoryByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center w-full">No inventory data</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {inventoryByCategory.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-slate-600 capitalize">{cat.name.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <RecentActivity items={approvalRequests} />
        </div>
      </div>
    </div>
  );
}