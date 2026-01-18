import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import CurrencySelect from "../shared/CurrencySelect";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PurchaseOrderForm({ open, onOpenChange, po, onSave, isLoading }) {
  const [form, setForm] = useState({
    po_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    supplier_code: '',
    supplier_name: '',
    delivery_date: '',
    delivery_address: '',
    payment_terms: '',
    currency: 'USD',
    exchange_rate: 1,
    items: [{ item_id: '', item_sku: '', item_name: '', description: '', quantity: 0, unit: '', unit_price: 0, total: 0 }],
    subtotal: 0,
    tax_percentage: 0,
    tax_amount: 0,
    shipping_cost: 0,
    total_amount: 0,
    notes: ''
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.filter({ is_active: true })
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => base44.entities.InventoryItem.list()
  });

  useEffect(() => {
    if (po) {
      setForm({
        ...po,
        po_date: po.po_date || new Date().toISOString().split('T')[0],
        items: po.items || [{ item_id: '', item_sku: '', item_name: '', description: '', quantity: 0, unit: '', unit_price: 0, total: 0 }]
      });
    } else {
      setForm({
        po_date: new Date().toISOString().split('T')[0],
        supplier_id: '',
        supplier_code: '',
        supplier_name: '',
        delivery_date: '',
        delivery_address: '',
        payment_terms: '',
        currency: 'USD',
        exchange_rate: 1,
        items: [{ item_id: '', item_sku: '', item_name: '', description: '', quantity: 0, unit: '', unit_price: 0, total: 0 }],
        subtotal: 0,
        tax_percentage: 0,
        tax_amount: 0,
        shipping_cost: 0,
        total_amount: 0,
        notes: ''
      });
    }
  }, [po, open]);

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setForm({
        ...form,
        supplier_id: supplierId,
        supplier_code: supplier.code,
        supplier_name: supplier.name,
        payment_terms: supplier.payment_terms,
        currency: supplier.currency
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    if (field === 'item_id') {
      const item = inventoryItems.find(i => i.id === value);
      if (item) {
        newItems[index] = {
          ...newItems[index],
          item_id: value,
          item_sku: item.sku,
          item_name: item.name,
          unit: item.unit,
          unit_price: item.unit_cost
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }

    const subtotal = newItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax_amount = (subtotal * (form.tax_percentage || 0)) / 100;
    const total_amount = subtotal + tax_amount + (form.shipping_cost || 0);

    setForm({ ...form, items: newItems, subtotal, tax_amount, total_amount });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { item_id: '', item_sku: '', item_name: '', description: '', quantity: 0, unit: '', unit_price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (form.items.length > 1) {
      const newItems = form.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const tax_amount = (subtotal * (form.tax_percentage || 0)) / 100;
      const total_amount = subtotal + tax_amount + (form.shipping_cost || 0);
      setForm({ ...form, items: newItems, subtotal, tax_amount, total_amount });
    }
  };

  const handleTaxShippingChange = (field, value) => {
    const newForm = { ...form, [field]: parseFloat(value) || 0 };
    const tax_amount = (newForm.subtotal * (newForm.tax_percentage || 0)) / 100;
    const total_amount = newForm.subtotal + tax_amount + (newForm.shipping_cost || 0);
    setForm({ ...newForm, tax_amount, total_amount });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{po ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>PO Date *</Label>
              <Input
                type="date"
                value={form.po_date}
                onChange={(e) => setForm({ ...form, po_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Date</Label>
              <Input
                type="date"
                value={form.delivery_date || ''}
                onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <CurrencySelect 
                value={form.currency} 
                onChange={(v) => setForm({ ...form, currency: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Exchange Rate</Label>
              <Input
                type="number"
                step="0.0001"
                value={form.exchange_rate}
                onChange={(e) => setForm({ ...form, exchange_rate: parseFloat(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select value={form.supplier_id} onValueChange={handleSupplierChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.code} - {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Delivery Address</Label>
            <Input
              value={form.delivery_address || ''}
              onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
              placeholder="Warehouse address..."
            />
          </div>

          {/* Items Section */}
          <Card className="p-4 border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-slate-900">Order Items</h4>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-2">
                <div className="col-span-3">Item</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Select value={item.item_id} onValueChange={(v) => handleItemChange(index, 'item_id', v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((invItem) => (
                          <SelectItem key={invItem.id} value={invItem.id}>
                            {invItem.sku} - {invItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      className="h-9"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      className="h-9"
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      className="h-9"
                      type="number"
                      step="0.01"
                      value={item.unit_price || ''}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right font-medium pr-2">
                    {(item.total || 0).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => removeItem(index)}
                      disabled={form.items.length <= 1}
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-9 text-right text-slate-600">Subtotal:</div>
                  <div className="col-span-2 text-right font-semibold">{form.subtotal.toFixed(2)}</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 text-right text-slate-600">Tax %:</div>
                  <div className="col-span-2">
                    <Input
                      className="h-8 text-right"
                      type="number"
                      step="0.01"
                      value={form.tax_percentage}
                      onChange={(e) => handleTaxShippingChange('tax_percentage', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 text-right font-medium">{form.tax_amount.toFixed(2)}</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-9 text-right text-slate-600">Shipping Cost:</div>
                  <div className="col-span-2">
                    <Input
                      className="h-8 text-right"
                      type="number"
                      step="0.01"
                      value={form.shipping_cost}
                      onChange={(e) => handleTaxShippingChange('shipping_cost', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1"></div>
                </div>

                <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                  <div className="col-span-9 text-right font-bold text-slate-900">Total Amount:</div>
                  <div className="col-span-2 text-right font-bold text-lg text-slate-900">
                    {form.currency} {form.total_amount.toFixed(2)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes or terms..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !form.supplier_id || form.items.length === 0}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? 'Saving...' : (po ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}