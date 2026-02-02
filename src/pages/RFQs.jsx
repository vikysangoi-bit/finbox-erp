import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import FilterBar from "../components/shared/FilterBar";
import DataTable from "../components/shared/DataTable";
import EmptyState from "../components/shared/EmptyState";
import StatusBadge from "../components/shared/StatusBadge";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import ColumnSelector from "../components/shared/ColumnSelector";
import RFQForm from "../components/rfq/RFQForm";
import BulkUploadDialog from "../components/shared/BulkUploadDialog";
import BulkDeleteDialog from "../components/shared/BulkDeleteDialog";
import { FileText, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RFQsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState(null);
  const [viewingRFQ, setViewingRFQ] = useState(null);
  const [deletingRFQ, setDeletingRFQ] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    currency: 'all',
    serviceName: 'all'
  });

  const queryClient = useQueryClient();

  const { data: rfqs = [], isLoading } = useQuery({
    queryKey: ['rfqs'],
    queryFn: () => base44.entities.RFQ.filter({ is_deleted: false })
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RFQ.create({ ...data, created_by: user?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ created successfully');
      setShowForm(false);
    },
    onError: () => toast.error('Failed to create RFQ')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RFQ.update(id, { ...data, updated_by: user?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ updated successfully');
      setShowForm(false);
      setEditingRFQ(null);
    },
    onError: () => toast.error('Failed to update RFQ')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RFQ.update(id, { 
      is_deleted: true, 
      deleted_by: user?.email,
      deleted_on: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ deleted successfully');
      setDeletingRFQ(null);
    },
    onError: () => toast.error('Failed to delete RFQ')
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => 
        base44.entities.RFQ.update(id, { 
          is_deleted: true, 
          deleted_by: user?.email,
          deleted_on: new Date().toISOString()
        })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQs deleted successfully');
      setSelectedRows([]);
    },
    onError: () => toast.error('Failed to delete RFQs')
  });

  const handleSave = (data) => {
    if (editingRFQ) {
      updateMutation.mutate({ id: editingRFQ.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const searchLower = searchTerm?.toLowerCase() || '';
    const matchesSearch = !searchTerm || 
      (rfq.legalName && rfq.legalName.toLowerCase().includes(searchLower)) ||
      (rfq.brandName && rfq.brandName.toLowerCase().includes(searchLower)) ||
      (rfq.rfqId && rfq.rfqId.toLowerCase().includes(searchLower)) ||
      (rfq.email && rfq.email.toLowerCase().includes(searchLower));
    
    const matchesStatus = filters.status === 'all' || rfq.status === filters.status;
    const matchesCurrency = filters.currency === 'all' || rfq.currency === filters.currency;
    const matchesService = filters.serviceName === 'all' || rfq.serviceName === filters.serviceName;

    return matchesSearch && matchesStatus && matchesCurrency && matchesService;
  });

  const allColumns = [
    { id: 'rfqId', header: 'RFQ ID', cell: (rfq) => rfq.rfqId || '-' },
    { id: 'legalName', header: 'Legal Name', cell: (rfq) => rfq.legalName },
    { id: 'brandName', header: 'Brand Name', cell: (rfq) => rfq.brandName || '-' },
    { id: 'serviceName', header: 'Service', cell: (rfq) => rfq.serviceName || '-' },
    { id: 'currency', header: 'Currency', cell: (rfq) => rfq.currency },
    { id: 'expectedValue', header: 'Expected Value', cell: (rfq) => rfq.expectedValue?.toLocaleString() || '0' },
    { id: 'contactPerson', header: 'Contact Person', cell: (rfq) => rfq.contactPerson || '-' },
    { id: 'email', header: 'Email', cell: (rfq) => rfq.email },
    { id: 'phone', header: 'Phone', cell: (rfq) => rfq.phone || '-' },
    { id: 'status', header: 'Status', cell: (rfq) => <StatusBadge status={rfq.status} /> },
    {
      id: 'actions',
      header: 'Actions',
      cell: (rfq) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setViewingRFQ(rfq);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingRFQ(rfq);
              setShowForm(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingRFQ(rfq);
            }}
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
          </Button>
        </div>
      )
    }
  ];

  const [visibleColumns, setVisibleColumns] = useState(allColumns.map(c => c.id));

  const filterConfig = [
    {
      name: 'Status',
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'in_review', label: 'In Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'converted', label: 'Converted' }
      ]
    },
    {
      name: 'Currency',
      value: filters.currency,
      onChange: (value) => setFilters({ ...filters, currency: value }),
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'INR', label: 'INR' }
      ]
    },
    {
      name: 'Service',
      value: filters.serviceName,
      onChange: (value) => setFilters({ ...filters, serviceName: value }),
      options: [
        { value: 'DaaS', label: 'DaaS' },
        { value: 'GaaS', label: 'GaaS' },
        { value: 'AI Photoshoot', label: 'AI Photoshoot' }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="RFQs"
        subtitle="Manage Request for Quotations"
        showExport
        showImport
        onExport={() => toast.info('Export functionality coming soon')}
        onImport={() => setShowBulkUpload(true)}
        actionLabel="New RFQ"
        onAction={() => {
          setEditingRFQ(null);
          setShowForm(true);
        }}
      />

      <div className="flex items-center justify-between gap-4">
        <FilterBar
          searchPlaceholder="Search RFQs..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterConfig}
        />
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => bulkDeleteMutation.mutate(selectedRows)}
            >
              Delete Selected ({selectedRows.length})
            </Button>
          )}
          <ColumnSelector
            columns={allColumns}
            visibleColumns={visibleColumns}
            onVisibilityChange={setVisibleColumns}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {filteredRFQs.length === 0 && !isLoading ? (
          <EmptyState
            icon={FileText}
            title="No RFQs found"
            description="Create your first RFQ to get started"
            actionLabel="New RFQ"
            onAction={() => {
              setEditingRFQ(null);
              setShowForm(true);
            }}
          />
        ) : (
          <DataTable
            columns={allColumns}
            data={filteredRFQs}
            visibleColumns={visibleColumns}
            isLoading={isLoading}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onRowClick={(rfq) => setViewingRFQ(rfq)}
          />
        )}
      </div>

      <RFQForm
        open={showForm}
        onOpenChange={setShowForm}
        rfq={editingRFQ}
        onSave={handleSave}
      />

      <BulkUploadDialog
        open={showBulkUpload}
        onOpenChange={setShowBulkUpload}
        entityName="RFQ"
      />

      <BulkDeleteDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        entityName="RFQ"
      />

      <ConfirmDialog
        open={!!deletingRFQ}
        onOpenChange={(open) => !open && setDeletingRFQ(null)}
        title="Delete RFQ"
        description="Are you sure you want to delete this RFQ? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate(deletingRFQ.id)}
      />
    </div>
  );
}