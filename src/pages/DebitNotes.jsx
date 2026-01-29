import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import FilterBar from "@/components/shared/FilterBar";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import DebitNoteForm from "@/components/debitnotes/DebitNoteForm";
import BulkUploadDialog from "@/components/shared/BulkUploadDialog";
import SyncDropdown from "@/components/shared/SyncDropdown";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Eye, Edit, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function DebitNotes() {
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [deleteNote, setDeleteNote] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: debitNotes = [], isLoading } = useQuery({
    queryKey: ['debit-notes'],
    queryFn: () => base44.entities.DebitNote.list('-created_date')
  });

  const { data: vendorBills = [] } = useQuery({
    queryKey: ['vendor-bills'],
    queryFn: () => base44.entities.VendorBill.list()
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      await base44.entities.DebitNote.create(data);
      
      await base44.functions.invoke('logAuditEntry', {
        action: 'create',
        entity_type: 'DebitNote',
        entity_name: data.debitNoteNo,
        details: 'Created debit note'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const user = await base44.auth.me();
      await base44.entities.DebitNote.update(id, { ...data, updated_by: user.email });
      
      await base44.functions.invoke('logAuditEntry', {
        action: 'update',
        entity_type: 'DebitNote',
        entity_id: id,
        entity_name: data.debitNoteNo,
        details: 'Updated debit note'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
      setShowForm(false);
      setEditingNote(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const user = await base44.auth.me();
      const note = debitNotes.find(n => n.id === id);
      
      await base44.entities.DebitNote.update(id, {
        is_deleted: true,
        deleted_by: user.email,
        deleted_on: new Date().toISOString()
      });
      
      await base44.functions.invoke('logAuditEntry', {
        action: 'delete',
        entity_type: 'DebitNote',
        entity_id: id,
        entity_name: note?.debitNoteNo,
        details: 'Deleted debit note'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
      setDeleteNote(null);
    }
  });

  const filteredNotes = debitNotes.filter(note => {
    if (note.is_deleted) return false;
    
    const matchesSearch = 
      note.debitNoteNo?.toLowerCase().includes(search.toLowerCase()) ||
      note.supplier?.toLowerCase().includes(search.toLowerCase()) ||
      note.billNo?.toLowerCase().includes(search.toLowerCase()) ||
      note.accountCode?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || note.dnStatus === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || note.supplier === supplierFilter;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const columns = [
    { id: 'debitNoteNo', header: "Debit Note No", accessor: "debitNoteNo", render: (row) => <span className="font-mono font-medium">{row.debitNoteNo}</span> },
    { id: 'dnDate', header: "Date", accessor: "dnDate" },
    { id: 'accountCode', header: "Account Code", accessor: "accountCode" },
    { id: 'supplier', header: "Supplier", accessor: "supplier" },
    { id: 'billNo', header: "Bill No", accessor: "billNo" },
    { id: 'dnValue', header: "Value", render: (row) => <span className="font-medium">{(row.dnValue || 0).toLocaleString('en-US', { style: 'currency', currency: row.dnCurrency || 'USD' })}</span> },
    { id: 'status', header: "Status", render: (row) => <StatusBadge status={row.dnStatus?.toLowerCase().replace(/ /g, '_')} /> },
    {
      id: 'actions',
      header: "",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setViewingNote(row); setShowForm(true); }}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditingNote(row); setViewingNote(null); setShowForm(true); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteNote(row)} className="text-rose-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const handleSave = (data) => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Debit Notes" 
          subtitle="Manage debit notes for vendor bills"
          onAdd={() => { setEditingNote(null); setViewingNote(null); setShowForm(true); }}
          addLabel="New Debit Note"
        >
          <SyncDropdown
            onBulkUpload={() => setShowBulkUpload(true)}
            onBulkDelete={() => {}}
            onGoogleSheetsImport={() => {}}
            onGoogleSheetsExport={() => {}}
            onExportToExcel={() => {
              const headers = ['debitNoteNo', 'dnDate', 'accountCode', 'supplier', 'billNo', 'dnValue', 'dnStatus'];
              const rows = filteredNotes.map(n => [n.debitNoteNo, n.dnDate, n.accountCode, n.supplier, n.billNo, n.dnValue, n.dnStatus]);
              const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `debit_notes_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
          />
        </PageHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div><span className="font-semibold text-slate-900">{debitNotes.length}</span> Total</div>
              <div className="h-4 w-px bg-slate-200" />
              <div><span className="font-semibold text-slate-900">{filteredNotes.length}</span> Filtered</div>
            </div>
          </div>

          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by debit note no, supplier, bill no..."
            filters={[
              {
                key: 'supplier',
                value: supplierFilter,
                onChange: setSupplierFilter,
                placeholder: 'Supplier',
                options: [...new Set(debitNotes.map(n => n.supplier).filter(Boolean))].map(name => ({
                  value: name,
                  label: name
                }))
              },
              {
                key: 'status',
                value: statusFilter,
                onChange: setStatusFilter,
                placeholder: 'Status',
                options: [
                  { value: 'Applied', label: 'Applied' },
                  { value: 'Adjustment', label: 'Adjustment' }
                ]
              }
            ]}
          />
        </div>

        {!isLoading && debitNotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No debit notes yet"
            description="Create your first debit note to get started."
            actionLabel="Create Debit Note"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredNotes} 
            isLoading={isLoading}
            emptyMessage="No debit notes match your search"
          />
        )}

        <DebitNoteForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) {
              setViewingNote(null);
              setEditingNote(null);
            }
          }}
          debitNote={viewingNote || editingNote}
          vendorBills={vendorBills}
          accounts={accounts}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
          viewMode={!!viewingNote}
        />

        <ConfirmDialog
          open={!!deleteNote}
          onOpenChange={() => setDeleteNote(null)}
          title="Delete Debit Note"
          description={`Are you sure you want to delete debit note "${deleteNote?.debitNoteNo}"?`}
          confirmLabel="Delete"
          onConfirm={() => deleteMutation.mutate(deleteNote.id)}
          variant="destructive"
        />

        <BulkUploadDialog
          open={showBulkUpload}
          onOpenChange={setShowBulkUpload}
          entityName="DebitNote"
          schema={{
            type: "array",
            items: {
              type: "object",
              properties: {
                accountCode: { type: "string" },
                supplier: { type: "string" },
                billNo: { type: "string" },
                debitNoteNo: { type: "string" },
                dnDate: { type: "string" },
                dnCurrency: { type: "string", enum: ["USD", "INR"] },
                dnNetValue: { type: "number" },
                dnTaxValue: { type: "number" },
                dnValue: { type: "number" },
                dnStatus: { type: "string", enum: ["Applied", "Adjustment"] }
              },
              required: ["debitNoteNo", "dnDate", "supplier"]
            }
          }}
          templateData={[
            'accountCode,supplier,billNo,debitNoteNo,dnDate,dnCurrency,dnNetValue,dnTaxValue,dnValue,dnStatus',
            '2000,Acme Corp,BILL-2024-001,DN-2024-001,2024-01-15,USD,1000,180,1180,Applied'
          ]}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['debit-notes'] })}
        />
      </div>
    </div>
  );
}