import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import SearchFilter from "@/components/shared/SearchFilter";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import InventoryItemForm from "@/components/inventory/InventoryItemForm";
import BulkUploadDialog from "@/components/shared/BulkUploadDialog";
import BulkDeleteDialog from "@/components/shared/BulkDeleteDialog";
import SyncDropdown from "@/components/shared/SyncDropdown";
import ColumnSelector from "@/components/shared/ColumnSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Package, AlertTriangle, Upload } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const STORAGE_KEY = 'inventory_visibleColumns';

export default function Inventory() {
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
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
      item.supplier?.toLowerCase().includes(search.toLowerCase()) ||
      item.articleNo?.toLowerCase().includes(search.toLowerCase()) ||
      item.ean?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const allColumns = [
    { 
      id: "sku",
      header: "SKU", 
      render: (row) => <span className="font-mono font-medium text-slate-900">{row.sku}</span>
    },
    { 
      id: "articleNo",
      header: "Article No", 
      render: (row) => <span className="text-slate-700">{row.articleNo || '-'}</span>
    },
    { 
      id: "ean",
      header: "EAN", 
      render: (row) => <span className="text-slate-700">{row.ean || '-'}</span>
    },
    { 
      id: "hsnCode",
      header: "HSN Code", 
      render: (row) => <span className="text-slate-700">{row.hsnCode || '-'}</span>
    },
    { id: "name", header: "Name", accessor: "name", render: (row) => <span className="font-medium">{row.name}</span> },
    { 
      id: "category",
      header: "Category", 
      render: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.category?.replace(/_/g, ' ')}
        </Badge>
      )
    },
    { 
      id: "quantity",
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
      id: "mrp",
      header: "MRP", 
      render: (row) => (
        <span className="text-slate-600">
          ₹{(row.mrp || 0).toFixed(2)}
        </span>
      )
    },
    { 
      id: "total_value",
      header: "Total Value", 
      render: (row) => (
        <span className="font-medium text-slate-900">
          ₹{((row.quantity_on_hand || 0) * (row.mrp || 0)).toFixed(2)}
        </span>
      )
    },
    { id: "location", header: "Location", accessor: "warehouse_location", render: (row) => <span className="text-slate-500">{row.warehouse_location || '-'}</span> },
    {
      id: "actions",
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

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedColumns = saved ? JSON.parse(saved) : allColumns.map(c => c.id);
    if (!savedColumns.includes('actions')) savedColumns.push('actions');
    return savedColumns;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const totalQty = filteredItems.reduce((sum, item) => sum + (item.quantity_on_hand || 0), 0);
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.total_value || 0), 0);

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
        >
          <ColumnSelector
            columns={allColumns.filter(c => c.id !== 'actions')}
            visibleColumns={visibleColumns}
            onVisibilityChange={setVisibleColumns}
          />
          <SyncDropdown
            onBulkUpload={() => setShowBulkUpload(true)}
            onBulkDelete={() => setShowBulkDelete(true)}
            onExportExcel={() => {
              const headers = ['SKU', 'Article No', 'EAN', 'HSN Code', 'Name', 'Category', 'Sub Category', 'Unit', 'Quantity', 'Reorder Level', 'MRP', 'Total Value', 'Warehouse Location', 'Supplier', 'Color', 'Size', 'GSM', 'Composition', 'Notes'];
              const rows = filteredItems.map(i => [
                i.sku, i.articleNo || '', i.ean || '', i.hsnCode || '', i.name, i.category, i.sub_category || '', i.unit, i.quantity_on_hand || 0, 
                i.reorder_level || 0, i.mrp || 0, i.total_value || 0, 
                i.warehouse_location || '', i.supplier || '', i.color || '', i.size || '', i.gsm || '', 
                i.composition || '', i.notes || ''
              ]);
              const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
          />
        </PageHeader>

        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by SKU, name, article no, EAN, supplier..."
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
                { value: 'garments', label: 'Garments' },
                { value: 'samples', label: 'Samples' },
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
            columns={allColumns}
            visibleColumns={visibleColumns} 
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
                articleNo: { type: "string" },
                ean: { type: "string" },
                hsnCode: { type: "string" },
                name: { type: "string" },
                category: { type: "string", enum: ["fabric", "trims", "accessories", "packaging", "garments", "samples"] },
                sub_category: { type: "string" },
                unit: { type: "string" },
                quantity_on_hand: { type: "number" },
                reorder_level: { type: "number" },
                mrp: { type: "number" },
                warehouse_location: { type: "string" }
              },
              required: ["sku", "name", "category", "unit"]
            }
          }}
          templateData={[
            'sku,articleNo,ean,hsnCode,name,category,sub_category,unit,quantity_on_hand,reorder_level,mrp,warehouse_location,supplier,color,size,gsm,composition,notes',
            'FAB-001,ART-001,1234567890123,5208,Cotton Fabric,fabric,Cotton,meters,1000,200,550.00,A-1-1,ABC Fabrics,White,150cm,180,100% Cotton,',
            'GAR-001,ART-002,9876543210987,6109,T-Shirt,garments,,pieces,500,100,499.00,B-1-1,XYZ Garments,Blue,M,,100% Cotton,'
          ]}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['inventory-items'] })}
        />

        <BulkDeleteDialog
          open={showBulkDelete}
          onOpenChange={setShowBulkDelete}
          entityName="InventoryItem"
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['inventory-items'] })}
        />
      </div>
    </div>
  );
}