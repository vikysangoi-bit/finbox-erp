import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import SearchFilter from "@/components/shared/SearchFilter";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import AccountForm from "@/components/accounts/AccountForm";
import BulkUploadDialog from "@/components/shared/BulkUploadDialog";
import BulkDeleteDialog from "@/components/shared/BulkDeleteDialog";
import GoogleSheetsDialog from "@/components/accounts/GoogleSheetsDialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, BookOpen, Upload, Sheet, RefreshCw, Download, Eye } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function ChartOfAccounts() {
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showGoogleSheetsImport, setShowGoogleSheetsImport] = useState(false);
  const [showGoogleSheetsExport, setShowGoogleSheetsExport] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Account.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Account.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowForm(false);
      setEditingAccount(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Account.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setDeleteAccount(null);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.Account.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setSelectedRows([]);
      setShowBulkDeleteConfirm(false);
    }
  });

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.code?.toLowerCase().includes(search.toLowerCase()) ||
      account.name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns = [
    { 
      header: "Code", 
      accessor: "code",
      render: (row) => <span className="font-mono font-medium text-slate-900">{row.code}</span>
    },
    { header: "Name", accessor: "name", render: (row) => <span className="font-medium">{row.name}</span> },
    { 
      header: "Type", 
      render: (row) => (
        <span className="capitalize text-slate-600">{row.type}</span>
      )
    },
    { 
      header: "Category", 
      render: (row) => (
        <span className="text-sm text-slate-500 capitalize">{row.category?.replace(/_/g, ' ')}</span>
      )
    },
    { 
      header: "Currency", 
      accessor: "currency",
      render: (row) => <span className="text-slate-600">{row.currency || 'USD'}</span>
    },
    { 
      header: "Balance", 
      render: (row) => (
        <span className="font-medium text-slate-900">
          {(row.currentBalance || 0).toLocaleString('en-US', { style: 'currency', currency: row.currency || 'USD' })}
        </span>
      )
    },
    { 
      header: "Status", 
      render: (row) => <StatusBadge status={row.active ? 'active' : 'inactive'} />
    },
    {
      header: "",
      cellClassName: "text-right",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setViewingAccount(row); setShowForm(true); }}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditingAccount(row); setViewingAccount(null); setShowForm(true); }}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteAccount(row)}
              className="text-rose-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const handleSave = (data) => {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data });
    } else {
      createMutation.mutate({ ...data, currentBalance: data.openingBalance });
    }
  };

  const handleSelectRow = (row) => {
    setSelectedRows(prev => {
      const exists = prev.some(r => r.id === row.id);
      if (exists) {
        return prev.filter(r => r.id !== row.id);
      } else {
        return [...prev, row];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredAccounts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...filteredAccounts]);
    }
  };

  const handleBulkDelete = () => {
    const ids = selectedRows.map(row => row.id);
    bulkDeleteMutation.mutate(ids);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Chart of Accounts" 
          subtitle="Manage your accounting structure"
          onAdd={() => { setEditingAccount(null); setViewingAccount(null); setShowForm(true); }}
          addLabel="New Account"
          onExport={() => {
            const headers = ['code', 'name', 'type', 'category'];
            const rows = filteredAccounts.map(a => [a.code, a.name, a.type, a.category]);
            const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chart_of_accounts_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-200">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowBulkUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload (CSV/Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBulkDelete(true)} className="text-rose-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Bulk Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowGoogleSheetsImport(true)}>
                <Download className="w-4 h-4 mr-2" />
                Import from Google Sheets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowGoogleSheetsExport(true)}>
                <Sheet className="w-4 h-4 mr-2" />
                Export to Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedRows.length > 0 && (
            <Button variant="destructive" onClick={() => setShowBulkDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedRows.length})
            </Button>
          )}
        </PageHeader>

        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by code or name..."
          filters={[
            {
              key: 'type',
              value: typeFilter,
              onChange: setTypeFilter,
              placeholder: 'Type',
              options: [
                { value: 'asset', label: 'Asset' },
                { value: 'liability', label: 'Liability' },
                { value: 'equity', label: 'Equity' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'expense', label: 'Expense' },
              ]
            }
          ]}
        />

        {!isLoading && accounts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No accounts yet"
            description="Create your first account to start building your chart of accounts."
            actionLabel="Create Account"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredAccounts} 
            isLoading={isLoading}
            emptyMessage="No accounts match your search"
            selectable={true}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
          />
        )}

        <AccountForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) {
              setViewingAccount(null);
              setEditingAccount(null);
            }
          }}
          account={viewingAccount || editingAccount}
          accounts={accounts}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
          viewMode={!!viewingAccount}
        />

        <ConfirmDialog
          open={!!deleteAccount}
          onOpenChange={() => setDeleteAccount(null)}
          title="Delete Account"
          description={`Are you sure you want to delete "${deleteAccount?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteMutation.mutate(deleteAccount.id)}
          variant="destructive"
        />

        <ConfirmDialog
          open={showBulkDeleteConfirm}
          onOpenChange={setShowBulkDeleteConfirm}
          title="Delete Selected Accounts"
          description={`Are you sure you want to delete ${selectedRows.length} selected account(s)? This action cannot be undone.`}
          confirmLabel="Delete All"
          onConfirm={handleBulkDelete}
          variant="destructive"
        />

        <BulkDeleteDialog
          open={showBulkDelete}
          onOpenChange={setShowBulkDelete}
          entityName="Account"
          identifierField="code"
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
        />

        <GoogleSheetsDialog
          open={showGoogleSheetsImport}
          onOpenChange={setShowGoogleSheetsImport}
          mode="import"
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
        />

        <GoogleSheetsDialog
          open={showGoogleSheetsExport}
          onOpenChange={setShowGoogleSheetsExport}
          mode="export"
          onSuccess={() => {}}
        />

        <BulkUploadDialog
          open={showBulkUpload}
          onOpenChange={setShowBulkUpload}
          entityName="Account"
          schema={{
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                name: { type: "string" },
                brand: { type: "string" },
                alias: { type: "string" },
                type: { type: "string", enum: ["asset", "liability", "equity", "revenue", "expense"] },
                category: { type: "string", enum: ["current_asset", "fixed_asset", "current_liability", "long_term_liability", "equity", "operating_revenue", "other_revenue", "cost_of_goods", "operating_expense", "other_expense"] },
                parentAccount: { type: "string" },
                supplierCategory: { type: "string", enum: ["fabric", "trims", "accessories", "packaging", "services", "other"] },
                currency: { type: "string" },
                openingBalance: { type: "number" },
                currentBalance: { type: "number" },
                description: { type: "string" },
                contactType: { type: "string", enum: ["business", "finance", "operations"] },
                contactPerson: { type: "string" },
                phone: { type: "string" },
                email: { type: "string", format: "email" },
                address: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                country: { type: "string" },
                region: { type: "string" },
                pincode: { type: "string" },
                placeOfSupply: { type: "string" },
                taxId: { type: "string" },
                gstId: { type: "string" },
                panId: { type: "string" },
                tanId: { type: "string" },
                vatId: { type: "string" },
                paymentTerms: { type: "string", enum: ["net_7", "net_15", "net_30", "net_45", "net_60", "net_90", "cod", "advance"] },
                creditLimit: { type: "number" },
                active: { type: "boolean" }
              },
              required: ["code", "name", "type", "category"]
            }
          }}
          templateData={[
            'code,name,type,category,brand,alias,parentAccount,supplierCategory,currency,openingBalance,description,contactType,contactPerson,phone,email,address,city,state,country,region,pincode,placeOfSupply,gstId,panId,tanId,vatId,paymentTerms,creditLimit,active',
            '1000,Cash,asset,current_asset,ABC Corp,Cash Account,,,USD,10000,Main cash account,business,John Doe,+919876543210,john@example.com,123 Business St,Mumbai,Maharashtra,India,Western India,400001,Maharashtra,22AAAAA0000A1Z5,ABCDE1234F,ABCD12345E,GB123456789,net_30,50000,true',
            '2000,Accounts Payable,liability,current_liability,XYZ Ltd,AP Account,,,USD,0,Supplier payables,finance,Jane Smith,+919876543211,jane@example.com,456 Finance Ave,Delhi,Delhi,India,Northern India,110001,Delhi,,,,,net_30,0,true',
            '3000,Sales Revenue,revenue,operating_revenue,,,,,USD,0,Sales income,,,,,,,,India,,,,,,,,true',
            '4000,Cost of Goods Sold,expense,cost_of_goods,,,fabric,,USD,0,Material costs,,,,,,,,India,,,,,,,,true',
            '5000,Operating Expenses,expense,operating_expense,,,,,USD,0,Daily operations,,,,,,,,India,,,,,,,,true'
          ]}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
        />
      </div>
    </div>
  );
}