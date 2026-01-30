import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = [
  { value: "fabric", label: "Fabric" },
  { value: "trims", label: "Trims" },
  { value: "accessories", label: "Accessories" },
  { value: "packaging", label: "Packaging" },
  { value: "garments", label: "Garments" },
  { value: "samples", label: "Samples" },
];

const units = [
  { value: "meters", label: "Meters" },
  { value: "yards", label: "Yards" },
  { value: "pieces", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "rolls", label: "Rolls" },
  { value: "boxes", label: "Boxes" },
  { value: "sets", label: "Sets" },
];

export default function InventoryItemForm({ open, onOpenChange, item, onSave, isLoading }) {
  const [form, setForm] = useState({
    sku: '',
    articleNo: '',
    ean: '',
    name: '',
    category: 'fabric',
    sub_category: '',
    unit: 'meters',
    quantity_on_hand: 0,
    reorder_level: 0,
    mrp: 0,
    warehouse_location: '',
    supplier: '',
    color: '',
    size: '',
    gsm: '',
    composition: '',
    notes: ''
  });

  useEffect(() => {
    if (item) {
      setForm(item);
    } else {
      setForm({
        sku: '',
        articleNo: '',
        ean: '',
        name: '',
        category: 'fabric',
        sub_category: '',
        unit: 'meters',
        quantity_on_hand: 0,
        reorder_level: 0,
        mrp: 0,
        warehouse_location: '',
        supplier: '',
        color: '',
        size: '',
        gsm: '',
        composition: '',
        notes: ''
      });
    }
  }, [item, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      total_value: form.quantity_on_hand * form.mrp
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'New Inventory Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g., FAB-COT-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Cotton Twill Fabric"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="articleNo">Article No</Label>
              <Input
                id="articleNo"
                value={form.articleNo || ''}
                onChange={(e) => setForm({ ...form, articleNo: e.target.value })}
                placeholder="Article number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ean">EAN</Label>
              <Input
                id="ean"
                value={form.ean || ''}
                onChange={(e) => setForm({ ...form, ean: e.target.value })}
                placeholder="EAN / Barcode"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub_category">Sub-Category</Label>
              <Input
                id="sub_category"
                value={form.sub_category || ''}
                onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                placeholder="e.g., Cotton"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_on_hand">Quantity on Hand</Label>
              <Input
                id="quantity_on_hand"
                type="number"
                value={form.quantity_on_hand}
                onChange={(e) => setForm({ ...form, quantity_on_hand: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                type="number"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP</Label>
              <Input
                id="mrp"
                type="number"
                step="0.01"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse_location">Warehouse Location</Label>
              <Input
                id="warehouse_location"
                value={form.warehouse_location || ''}
                onChange={(e) => setForm({ ...form, warehouse_location: e.target.value })}
                placeholder="e.g., A-1-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={form.supplier || ''}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
          </div>

          {form.category === 'fabric' && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={form.color || ''}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="e.g., Navy Blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={form.size || ''}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  placeholder='e.g., 58"'
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gsm">GSM</Label>
                <Input
                  id="gsm"
                  value={form.gsm || ''}
                  onChange={(e) => setForm({ ...form, gsm: e.target.value })}
                  placeholder="e.g., 180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="composition">Composition</Label>
                <Input
                  id="composition"
                  value={form.composition || ''}
                  onChange={(e) => setForm({ ...form, composition: e.target.value })}
                  placeholder="e.g., 100% Cotton"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
              {isLoading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}