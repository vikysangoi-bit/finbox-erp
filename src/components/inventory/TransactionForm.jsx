import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CurrencySelect from "../shared/CurrencySelect";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const transactionTypes = [
  { value: "receipt", label: "Receipt (In)" },
  { value: "issue", label: "Issue (Out)" },
  { value: "adjustment", label: "Adjustment" },
  { value: "transfer", label: "Transfer" },
  { value: "return", label: "Return" },
];

export default function TransactionForm({ open, onOpenChange, transaction, onSave, isLoading }) {
  const [form, setForm] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    type: 'receipt',
    item_id: '',
    item_sku: '',
    item_name: '',
    quantity: 0,
    unit_cost: 0,
    currency: 'USD',
    reference: '',
    from_location: '',
    to_location: '',
    reason: ''
  });

  const { data: items = [] } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => base44.entities.InventoryItem.filter({ is_active: true })
  });

  useEffect(() => {
    if (transaction) {
      setForm(transaction);
    } else {
      setForm({
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'receipt',
        item_id: '',
        item_sku: '',
        item_name: '',
        quantity: 0,
        unit_cost: 0,
        currency: 'USD',
        reference: '',
        from_location: '',
        to_location: '',
        reason: ''
      });
    }
  }, [transaction, open]);

  const handleItemChange = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setForm({
        ...form,
        item_id: itemId,
        item_sku: item.sku,
        item_name: item.name,
        unit_cost: item.unit_cost,
        currency: item.currency
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      total_cost: form.quantity * form.unit_cost
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'New Inventory Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.transaction_date}
                onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Item *</Label>
            <Select value={form.item_id} onValueChange={handleItemChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.sku} - {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Unit Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={form.unit_cost}
                onChange={(e) => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <CurrencySelect 
                value={form.currency} 
                onChange={(v) => setForm({ ...form, currency: v })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reference</Label>
            <Input
              value={form.reference || ''}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="PO number, invoice, etc."
            />
          </div>

          {form.type === 'transfer' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Location</Label>
                <Input
                  value={form.from_location || ''}
                  onChange={(e) => setForm({ ...form, from_location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>To Location</Label>
                <Input
                  value={form.to_location || ''}
                  onChange={(e) => setForm({ ...form, to_location: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason / Notes</Label>
            <Textarea
              value={form.reason || ''}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Cost:</span>
              <span className="font-semibold">{form.currency} {(form.quantity * form.unit_cost).toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
              {isLoading ? 'Saving...' : (transaction ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}