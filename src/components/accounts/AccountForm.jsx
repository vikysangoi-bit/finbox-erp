import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import CurrencySelect from "../shared/CurrencySelect";

const accountTypes = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "revenue", label: "Revenue" },
  { value: "expense", label: "Expense" },
];

const categoryOptions = {
  asset: [
    { value: "current_asset", label: "Current Asset" },
    { value: "fixed_asset", label: "Fixed Asset" },
  ],
  liability: [
    { value: "current_liability", label: "Current Liability" },
    { value: "long_term_liability", label: "Long-term Liability" },
  ],
  equity: [{ value: "equity", label: "Equity" }],
  revenue: [
    { value: "operating_revenue", label: "Operating Revenue" },
    { value: "other_revenue", label: "Other Revenue" },
  ],
  expense: [
    { value: "cost_of_goods", label: "Cost of Goods Sold" },
    { value: "operating_expense", label: "Operating Expense" },
    { value: "other_expense", label: "Other Expense" },
  ],
};

export default function AccountForm({ open, onOpenChange, account, accounts = [], onSave, isLoading }) {
  const [form, setForm] = useState({
    code: '',
    name: '',
    brand_name: '',
    alias: '',
    type: 'asset',
    category: 'current_asset',
    parent_account_id: '',
    currency: 'USD',
    opening_balance: 0,
    is_active: true,
    description: '',
    contact_type: '',
    contact_person: '',
    phone: '',
    email: '',
    account_address: '',
    country: '',
    region: '',
    payment_terms: '',
    credit_limit: 0,
    tax_id: '',
    supplier_category: ''
  });

  useEffect(() => {
    if (account) {
      setForm(account);
    } else {
      setForm({
        code: '',
        name: '',
        brand_name: '',
        alias: '',
        type: 'asset',
        category: 'current_asset',
        parent_account_id: '',
        currency: 'USD',
        opening_balance: 0,
        is_active: true,
        description: '',
        contact_type: '',
        contact_person: '',
        phone: '',
        email: '',
        account_address: '',
        country: '',
        region: '',
        payment_terms: '',
        credit_limit: 0,
        tax_id: '',
        supplier_category: ''
      });
    }
  }, [account, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const parentAccounts = accounts.filter(a => a.type === form.type && a.id !== account?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'New Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Account Code *</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g., 1001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Cash in Bank"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={form.brand_name || ''}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                placeholder="e.g., ABC Corporation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                value={form.alias || ''}
                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                placeholder="e.g., Short name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <Select 
                value={form.type} 
                onValueChange={(v) => setForm({ ...form, type: v, category: categoryOptions[v][0].value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions[form.type]?.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Parent Account</Label>
              <Select 
                value={form.parent_account_id || 'none'} 
                onValueChange={(v) => setForm({ ...form, parent_account_id: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <CurrencySelect 
                value={form.currency} 
                onChange={(v) => setForm({ ...form, currency: v })}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening_balance">Opening Balance</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              value={form.opening_balance}
              onChange={(e) => setForm({ ...form, opening_balance: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3 text-slate-900">Contact Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Type</Label>
                <Select 
                  value={form.contact_type || 'none'} 
                  onValueChange={(v) => setForm({ ...form, contact_type: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={form.contact_person || ''}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g., +1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g., contact@example.com"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="account_address">Address</Label>
              <Textarea
                id="account_address"
                value={form.account_address || ''}
                onChange={(e) => setForm({ ...form, account_address: e.target.value })}
                rows={2}
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country || ''}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g., United States"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={form.region || ''}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="e.g., California"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3 text-slate-900">Financial Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Select 
                  value={form.payment_terms || 'none'} 
                  onValueChange={(v) => setForm({ ...form, payment_terms: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="net_7">Net 7</SelectItem>
                    <SelectItem value="net_15">Net 15</SelectItem>
                    <SelectItem value="net_30">Net 30</SelectItem>
                    <SelectItem value="net_45">Net 45</SelectItem>
                    <SelectItem value="net_60">Net 60</SelectItem>
                    <SelectItem value="net_90">Net 90</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="advance">Advance Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  value={form.credit_limit || 0}
                  onChange={(e) => setForm({ ...form, credit_limit: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
              <Input
                id="tax_id"
                value={form.tax_id || ''}
                onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                placeholder="e.g., 12-3456789"
              />
            </div>

            {form.type === 'expense' && (
              <div className="space-y-2 mt-4">
                <Label>Supplier Category</Label>
                <Select 
                  value={form.supplier_category || 'none'} 
                  onValueChange={(v) => setForm({ ...form, supplier_category: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fabric">Fabric</SelectItem>
                    <SelectItem value="trims">Trims</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Label htmlFor="is_active">Active Account</Label>
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
              {isLoading ? 'Saving...' : (account ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}