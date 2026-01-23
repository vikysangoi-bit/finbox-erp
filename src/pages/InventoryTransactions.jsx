import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import SearchFilter from "@/components/shared/SearchFilter";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import TransactionForm from "@/components/inventory/TransactionForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ArrowRightLeft, Send, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { format } from "date-fns";

const typeConfig = {
  receipt: { label: "Receipt", color: "bg-emerald-100 text-emerald-700", icon: ArrowDownLeft },
  issue: { label: "Issue", color: "bg-rose-100 text-rose-700", icon: ArrowUpRight },
  adjustment: { label: "Adjustment", color: "bg-amber-100 text-amber-700", icon: RefreshCw },
  transfer: { label: "Transfer", color: "bg-blue-100 text-blue-700", icon: ArrowRightLeft },
  return: { label: "Return", color: "bg-purple-100 text-purple-700", icon: ArrowDownLeft },
};

export default function InventoryTransactions() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTransaction, setDeleteTransaction] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['inventory-transactions'],
    queryFn: () => base44.entities.InventoryTransaction.list('-created_date')
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InventoryTransaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InventoryTransaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      setShowForm(false);
      setEditingTransaction(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InventoryTransaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      setDeleteTransaction(null);
    }
  });

  const submitForApproval = async (transaction) => {
    await base44.entities.InventoryTransaction.update(transaction.id, {
      status: 'pending_approval',
      submitted_by: user?.email
    });
    
    await base44.entities.ApprovalRequest.create({
      entity_type: 'inventory_transaction',
      entity_id: transaction.id,
      title: `${typeConfig[transaction.type]?.label || transaction.type}: ${transaction.item_name}`,
      description: `${transaction.quantity} units @ ${transaction.currency} ${transaction.unit_cost}`,
      amount: transaction.total_cost,
      currency: transaction.currency,
      status: 'pending',
      submitted_by: user?.email,
      submitted_by_name: user?.full_name,
      submitted_at: new Date().toISOString()
    });
    
    queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.transaction_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.reference?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const generateTxNumber = () => {
    const count = transactions.length + 1;
    return `TXN-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`;
  };

  const columns = [
    { 
      header: "Transaction #", 
      render: (row) => <span className="font-mono font-medium text-slate-900">{row.transaction_number || '-'}</span>
    },
    { 
      header: "Date", 
      render: (row) => row.transaction_date ? format(new Date(row.transaction_date), 'MMM d, yyyy') : '-'
    },
    { 
      header: "Type", 
      render: (row) => {
        const config = typeConfig[row.type] || { label: row.type, color: "bg-slate-100 text-slate-700" };
        return (
          <Badge className={`${config.color} border-0`}>
            {config.label}
          </Badge>
        );
      }
    },
    { 
      header: "Item", 
      render: (row) => (
        <div>
          <span className="font-medium">{row.item_name}</span>
          <p className="text-xs text-slate-500">{row.item_sku}</p>
        </div>
      )
    },
    { 
      header: "Quantity", 
      render: (row) => <span className="font-medium">{row.quantity}</span>
    },
    { 
      header: "Total Cost", 
      render: (row) => (
        <span className="font-medium">
          {row.currency} {(row.total_cost || 0).toFixed(2)}
        </span>
      )
    },
    { header: "Reference", accessor: "reference", render: (row) => <span className="text-slate-500">{row.reference || '-'}</span> },
    { 
      header: "Status", 
      render: (row) => <StatusBadge status={row.status || 'draft'} />
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
            {row.status === 'draft' && (
              <>
                <DropdownMenuItem onClick={() => { setEditingTransaction(row); setShowForm(true); }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => submitForApproval(row)}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Approval
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteTransaction(row)} className="text-rose-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const handleSave = (data) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate({ ...data, transaction_number: generateTxNumber(), status: 'draft' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Inventory Transactions" 
          subtitle="Track stock movements and adjustments"
          onAdd={() => { setEditingTransaction(null); setShowForm(true); }}
          addLabel="New Transaction"
          onExport={() => {
            const headers = ['Transaction Number', 'Transaction Date', 'Type', 'Item SKU', 'Item Name', 'Quantity', 'Unit Cost', 'Total Cost', 'Currency', 'Reference', 'From Location', 'To Location', 'Reason', 'Status'];
            const rows = filteredTransactions.map(t => [
              t.transaction_number || '', t.transaction_date || '', t.type || '', t.item_sku || '', 
              t.item_name || '', t.quantity || 0, t.unit_cost || 0, t.total_cost || 0, t.currency || 'USD', 
              t.reference || '', t.from_location || '', t.to_location || '', t.reason || '', t.status || 'draft'
            ]);
            const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_transactions_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
        />

        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by transaction #, item, reference..."
          filters={[
            {
              key: 'type',
              value: typeFilter,
              onChange: setTypeFilter,
              placeholder: 'Type',
              options: Object.entries(typeConfig).map(([value, { label }]) => ({ value, label }))
            }
          ]}
        />

        {!isLoading && transactions.length === 0 ? (
          <EmptyState
            icon={ArrowRightLeft}
            title="No transactions"
            description="Record your first inventory transaction."
            actionLabel="New Transaction"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredTransactions} 
            isLoading={isLoading}
            emptyMessage="No transactions match your search"
          />
        )}

        <TransactionForm
          open={showForm}
          onOpenChange={setShowForm}
          transaction={editingTransaction}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        <ConfirmDialog
          open={!!deleteTransaction}
          onOpenChange={() => setDeleteTransaction(null)}
          title="Delete Transaction"
          description={`Are you sure you want to delete this transaction? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteMutation.mutate(deleteTransaction.id)}
          variant="destructive"
        />
      </div>
    </div>
  );
}