import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export default function VendorBillForm({ open, onOpenChange, vendorBill, accounts = [], purchaseOrders = [], onSave, isLoading, viewMode = false }) {
  const [form, setForm] = useState({
    accountCode: '',
    supplier: '',
    serviceName: 'DaaS',
    poNo: '',
    billNo: '',
    billDate: '',
    billingCurrency: 'USD',
    billNetValue: 0,
    billTaxValue: 0,
    billValue: 0,
    billSharedOn: '',
    paymentTerms: 'net_30',
    paymentDueDate: '',
    currentStatus: 'Open',
    lineItems: [],
    po_id: '',
    supplier_id: '',
    notes: ''
  });

  useEffect(() => {
    if (vendorBill) {
      setForm({ ...vendorBill, lineItems: vendorBill.lineItems || [] });
    } else {
      setForm({
        accountCode: '',
        supplier: '',
        serviceName: 'DaaS',
        poNo: '',
        billNo: '',
        billDate: '',
        billingCurrency: 'USD',
        billNetValue: 0,
        billTaxValue: 0,
        billValue: 0,
        billSharedOn: '',
        paymentTerms: 'net_30',
        paymentDueDate: '',
        currentStatus: 'Open',
        lineItems: [],
        po_id: '',
        supplier_id: '',
        notes: ''
      });
    }
  }, [vendorBill, open]);

  const handlePOChange = (poNo) => {
    setForm({ ...form, poNo });
    
    // Auto-fetch PO details
    const po = purchaseOrders.find(p => p.po_number === poNo);
    if (po) {
      setForm(prev => ({
        ...prev,
        poNo,
        po_id: po.id,
        supplier: po.supplier_name || '',
        supplier_id: po.supplier_id || '',
        billingCurrency: po.currency || 'USD',
        paymentTerms: po.payment_terms || 'net_30',
        lineItems: po.items?.map(item => ({
          itemCode: item.itemCode || '',
          articleNo: item.articleNo || '',
          styleID: item.styleID || '',
          itemCategory: item.itemCategory || '',
          description: item.description || '',
          composition: item.composition || '',
          size: item.size || '',
          color: item.color || '',
          hsnCode: item.hsnCode || '',
          quantity: item.quantity || 0,
          rate: item.rate_per_unit || 0,
          net_amount: item.net_before_gst || 0,
          tax_amount: (item.gross_value || 0) - (item.net_before_gst || 0),
          gross_amount: item.gross_value || 0
        })) || []
      }));
    }
  };

  const handleNetValueChange = (value) => {
    const netValue = parseFloat(value) || 0;
    const taxValue = form.billTaxValue || 0;
    setForm({ ...form, billNetValue: netValue, billValue: netValue + taxValue });
  };

  const handleTaxValueChange = (value) => {
    const taxValue = parseFloat(value) || 0;
    const netValue = form.billNetValue || 0;
    setForm({ ...form, billTaxValue: taxValue, billValue: netValue + taxValue });
  };

  const handleRemoveItem = (index) => {
    const newItems = form.lineItems.filter((_, i) => i !== index);
    setForm({ ...form, lineItems: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!viewMode) {
      onSave(form);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{viewMode ? 'View Vendor Bill' : (vendorBill ? 'Edit Vendor Bill' : 'New Vendor Bill')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>PO No</Label>
              <Select value={form.poNo} onValueChange={handlePOChange} disabled={viewMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select PO" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseOrders.filter(po => !po.is_deleted && po.status === 'approved').map((po) => (
                    <SelectItem key={po.id} value={po.po_number}>{po.po_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billNo">Bill No *</Label>
              <Input
                id="billNo"
                value={form.billNo}
                onChange={(e) => setForm({ ...form, billNo: e.target.value })}
                required
                disabled={viewMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billDate">Bill Date *</Label>
              <Input
                id="billDate"
                type="date"
                value={form.billDate}
                onChange={(e) => setForm({ ...form, billDate: e.target.value })}
                required
                disabled={viewMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountCode">Account Code</Label>
              <Input
                id="accountCode"
                value={form.accountCode}
                onChange={(e) => setForm({ ...form, accountCode: e.target.value })}
                disabled={viewMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                required
                disabled={viewMode}
              />
            </div>
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Select value={form.serviceName} onValueChange={(v) => setForm({ ...form, serviceName: v })} disabled={viewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DaaS">DaaS</SelectItem>
                  <SelectItem value="GaaS">GaaS</SelectItem>
                  <SelectItem value="AI Photoshoot">AI Photoshoot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Billing Currency</Label>
              <Select value={form.billingCurrency} onValueChange={(v) => setForm({ ...form, billingCurrency: v })} disabled={viewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billSharedOn">Bill Shared On</Label>
              <Input
                id="billSharedOn"
                type="date"
                value={form.billSharedOn}
                onChange={(e) => setForm({ ...form, billSharedOn: e.target.value })}
                disabled={viewMode}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select value={form.paymentTerms} onValueChange={(v) => setForm({ ...form, paymentTerms: v })} disabled={viewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net_30">Net 30</SelectItem>
                  <SelectItem value="net_45">Net 45</SelectItem>
                  <SelectItem value="net_60">Net 60</SelectItem>
                  <SelectItem value="net_90">Net 90</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billNetValue">Bill Net Value</Label>
              <Input
                id="billNetValue"
                type="number"
                step="0.01"
                value={form.billNetValue}
                onChange={(e) => handleNetValueChange(e.target.value)}
                disabled={viewMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billTaxValue">Bill Tax Value</Label>
              <Input
                id="billTaxValue"
                type="number"
                step="0.01"
                value={form.billTaxValue}
                onChange={(e) => handleTaxValueChange(e.target.value)}
                disabled={viewMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billValue">Bill Value</Label>
              <Input
                id="billValue"
                type="number"
                step="0.01"
                value={form.billValue}
                disabled
                className="bg-slate-50 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDueDate">Payment Due Date</Label>
              <Input
                id="paymentDueDate"
                type="date"
                value={form.paymentDueDate}
                onChange={(e) => setForm({ ...form, paymentDueDate: e.target.value })}
                disabled={viewMode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select value={form.currentStatus} onValueChange={(v) => setForm({ ...form, currentStatus: v })} disabled={viewMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partially paid">Partially paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Line Items</Label>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Item Code</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Article No</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Style ID</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Category</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Description</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Composition</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Size</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Color</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">HSN</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Qty</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Rate</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Net Amount</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Tax</th>
                      <th className="p-2 text-left font-bold border-r border-slate-300">Gross</th>
                      {!viewMode && <th className="p-2 text-left font-bold w-12"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {form.lineItems?.length > 0 ? (
                      form.lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200">{item.itemCode || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.articleNo || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.styleID || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.itemCategory || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.description || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.composition || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.size || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.color || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.hsnCode || '-'}</td>
                          <td className="p-2 border-r border-slate-200">{item.quantity || 0}</td>
                          <td className="p-2 border-r border-slate-200">{item.rate || 0}</td>
                          <td className="p-2 border-r border-slate-200">{item.net_amount || 0}</td>
                          <td className="p-2 border-r border-slate-200">{item.tax_amount || 0}</td>
                          <td className="p-2 border-r border-slate-200">{item.gross_amount || 0}</td>
                          {!viewMode && (
                            <td className="p-2">
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveItem(idx)}
                              >
                                <Trash2 className="w-3 h-3 text-rose-500" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={viewMode ? 14 : 15} className="p-6 text-center text-slate-400">
                          No line items. Select a PO to auto-populate items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {form.lineItems?.length > 0 && (
              <div className="text-right text-sm">
                <span className="font-semibold">Total Items: </span>
                <span>{form.lineItems.length}</span>
                <span className="ml-4 font-semibold">Total Qty: </span>
                <span>{form.lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {viewMode ? 'Close' : 'Cancel'}
            </Button>
            {!viewMode && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (vendorBill ? 'Update Vendor Bill' : 'Create Vendor Bill')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}