import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import SearchFilter from "@/components/shared/SearchFilter";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import InventoryItemForm from "@/components/inventory/InventoryItemForm";
import BulkUploadDialog from "@/components/shared/BulkUploadDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Package, AlertTriangle, Upload } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function Inventory() {
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => base44.entities.InventoryItem.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InventoryItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InventoryItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InventoryItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setDeleteItem(null);
    }
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    { 
      header: "SKU", 
      render: (row) => <span className="font-mono font-medium text-slate-900">{row.sku}</span>
    },
    { header: "Name", accessor: "name", render: (row) => <span className="font-medium">{row.name}</span> },
    { 
      header: "Category", 
      render: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.category?.replace(/_/g, ' ')}
        </Badge>
      )
    },
    { 
      header: "Quantity", 
      render: (row) => {
        const isLowStock = row.quantity_on_hand <= row.reorder_level;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
              {row.quantity_on_hand} {row.unit}
            </span>
            {isLowStock && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          </div>
        );
      }
    },
    { 
      header: "Unit Cost", 
      render: (row) => (
        <span className="text-slate-600">
          {row.currency} {(row.unit_cost || 0).toFixed(2)}
        </span>
      )
    },
    { 
      header: "Total Value", 
      render: (row) => (
        <span className="font-medium text-slate-900">
          {row.currency} {((row.quantity_on_hand || 0) * (row.unit_cost || 0)).toFixed(2)}
        </span>
      )
    },
    { header: "Location", accessor: "warehouse_location", render: (row) => <span className="text-slate-500">{row.warehouse_location || '-'}</span> },
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
            <DropdownMenuItem onClick={() => { setEditingItem(row); setShowForm(true); }}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteItem(row)} className="text-rose-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const handleSave = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Inventory" 
          subtitle="Manage stock and materials"
          onAdd={() => { setEditingItem(null); setShowForm(true); }}
          addLabel="New Item"
          onExport={() => {
            const headers = ['SKU', 'Name', 'Category', 'Sub Category', 'Unit', 'Quantity', 'Reorder Level', 'Unit Cost', 'Currency', 'Total Value', 'Warehouse Location', 'Supplier', 'Color', 'Size', 'GSM', 'Composition', 'Is Active', 'Notes'];
            const rows = filteredItems.map(i => [
              i.sku, i.name, i.category, i.sub_category || '', i.unit, i.quantity_on_hand || 0, 
              i.reorder_level || 0, i.unit_cost || 0, i.currency || 'USD', i.total_value || 0, 
              i.warehouse_location || '', i.supplier || '', i.color || '', i.size || '', i.gsm || '', 
              i.composition || '', i.is_active ? 'Yes' : 'No', i.notes || ''
            ]);
            const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
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
          searchPlaceholder="Search by SKU, name, supplier..."
          filters={[
            {
              key: 'category',
              value: categoryFilter,
              onChange: setCategoryFilter,
              placeholder: 'Category',
              options: [
                { value: 'fabric', label: 'Fabric' },
                { value: 'trims', label: 'Trims' },
                { value: 'accessories', label: 'Accessories' },
                { value: 'packaging', label: 'Packaging' },
                { value: 'finished_goods', label: 'Finished Goods' },
                { value: 'work_in_progress', label: 'Work in Progress' },
              ]
            }
          ]}
        />

        {!isLoading && items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No inventory items"
            description="Add your first inventory item to start tracking stock."
            actionLabel="Add Item"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredItems} 
            isLoading={isLoading}
            emptyMessage="No items match your search"
          />
        )}

        <InventoryItemForm
          open={showForm}
          onOpenChange={setShowForm}
          item={editingItem}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        <ConfirmDialog
          open={!!deleteItem}
          onOpenChange={() => setDeleteItem(null)}
          title="Delete Inventory Item"
          description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteMutation.mutate(deleteItem.id)}
          variant="destructive"
        />

        <BulkUploadDialog
          open={showBulkUpload}
          onOpenChange={setShowBulkUpload}
          entityName="InventoryItem"
          schema={{
            type: "array",
            items: {
              type: "object",
              properties: {
                sku: { type: "string" },
                name: { type: "string" },
                category: { type: "string", enum: ["fabric", "trims", "accessories", "packaging", "finished_goods", "work_in_progress"] },
                sub_category: { type: "string" },
                unit: { type: "string" },
                quantity_on_hand: { type: "number" },
                reorder_level: { type: "number" },
                unit_cost: { type: "number" },
                currency: { type: "string" },
                warehouse_location: { type: "string" },
                is_active: { type: "boolean" }
              },
              required: ["sku", "name", "category", "unit"]
            }
          }}
          templateData={[
            'sku,name,category,sub_category,unit,quantity_on_hand,reorder_level,unit_cost,currency,warehouse_location,supplier,color,size,gsm,composition,is_active,notes',
            'FAB-001,Cotton Fabric,fabric,Cotton,meters,1000,200,5.50,USD,A-1-1,ABC Fabrics,White,150cm,180,100% Cotton,true,',
            'TRM-001,Buttons,trims,Buttons,pieces,5000,1000,0.10,USD,B-1-1,XYZ Trims,Black,1cm,,,true,'
          ]}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['inventory-items'] })}
        />
      </div>
    </div>
  );
}