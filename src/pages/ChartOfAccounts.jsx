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
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, BookOpen, Upload } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function ChartOfAccounts() {
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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
          {(row.current_balance || 0).toLocaleString('en-US', { style: 'currency', currency: row.currency || 'USD' })}
        </span>
      )
    },
    { 
      header: "Status", 
      render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
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
            <DropdownMenuItem onClick={() => { setEditingAccount(row); setShowForm(true); }}>
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
      createMutation.mutate({ ...data, current_balance: data.opening_balance });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Chart of Accounts" 
          subtitle="Manage your accounting structure"
          onAdd={() => { setEditingAccount(null); setShowForm(true); }}
          addLabel="New Account"
          onExport={() => {
            const headers = ['Code', 'Name', 'Brand Name', 'Alias', 'Account Level', 'Parent Account', 'Type', 'Category', 'Currency', 'Opening Balance', 'Current Balance', 'Is Active', 'Description', 'Contact Type', 'Contact Person', 'Phone', 'Email', 'Address', 'Country', 'Region', 'Payment Terms', 'Credit Limit', 'Tax ID', 'Supplier Category'];
            const rows = filteredAccounts.map(a => {
              const parentAccount = a.parent_account_id ? accounts.find(acc => acc.id === a.parent_account_id) : null;
              const accountLevel = a.parent_account_id ? 'Sub-Category' : 'Main';
              return [
                a.code, a.name, a.brand_name || '', a.alias || '', accountLevel, parentAccount?.name || '', a.type, a.category, a.currency || 'USD', 
                a.opening_balance || 0, a.current_balance || 0, a.is_active ? 'Yes' : 'No', a.description || '', 
                a.contact_type || '', a.contact_person || '', a.phone || '', a.email || '', 
                a.account_address || '', a.country || '', a.region || '', a.payment_terms || '', 
                a.credit_limit || 0, a.tax_id || '', a.supplier_category || ''
              ];
            });
            const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chart_of_accounts_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
        >
          <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="border-slate-200">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
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
          />
        )}

        <AccountForm
          open={showForm}
          onOpenChange={setShowForm}
          account={editingAccount}
          accounts={accounts}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
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
                type: { type: "string", enum: ["asset", "liability", "equity", "revenue", "expense"] },
                category: { type: "string" },
                currency: { type: "string" },
                opening_balance: { type: "number" },
                is_active: { type: "boolean" }
              },
              required: ["code", "name", "type", "category"]
            }
          }}
          templateData={[
            'code,name,brand_name,alias,parent_account_id,type,category,currency,opening_balance,is_active,description,contact_type,contact_person,phone,email,account_address,country,region,payment_terms,credit_limit,tax_id,supplier_category',
            '1000,Cash,,,asset,current_asset,USD,50000,true,Cash account,,,,,,,,,,,',
            '2000,Accounts Payable,,,liability,current_liability,USD,0,true,Accounts payable,,,,,,,,,,,'
          ]}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
        />
      </div>
    </div>
  );
}