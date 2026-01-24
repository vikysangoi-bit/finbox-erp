import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";

export default function SalesOrderForm({ open, onOpenChange, order, accounts = [], onSave, isLoading, viewMode = false }) {
  const [form, setForm] = useState({
    RFQID: '',
    orderFormNo: '',
    customerCode: '',
    customerName: '',
    customerBrand: '',
    customerAddress: '',
    customerCountry: '',
    customerGstId: '',
    orderFormValue: 0,
    paymentTerm: 'net_30',
    paymentTermFrom: '',
    expectedDelivery: '',
    orderTerm: '1_year',
    startDate: '',
    endDate: '',
    autoRenewal: 'No',
    leadSource: 'Direct',
    partnerName: '',
    salesPersonName: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    serviceName: 'DaaS',
    uom: 'SKU',
    inclusions: '',
    unitPrice: 0,
    billingFrequency: 'One_Time',
    specialTerms: '',
    status: 'draft',
    currency: 'USD',
    notes: '',
    attachments: []
  });

  useEffect(() => {
    if (order) {
      setForm(order);
    } else {
      setForm({
        RFQID: '',
        orderFormNo: '',
        customerCode: '',
        customerName: '',
        customerBrand: '',
        customerAddress: '',
        customerCountry: '',
        customerGstId: '',
        orderFormValue: 0,
        paymentTerm: 'net_30',
        paymentTermFrom: '',
        expectedDelivery: '',
        orderTerm: '1_year',
        startDate: '',
        endDate: '',
        autoRenewal: 'No',
        leadSource: 'Direct',
        partnerName: '',
        salesPersonName: '',
        contactPersonName: '',
        contactPersonEmail: '',
        contactPersonPhone: '',
        serviceName: 'DaaS',
        uom: 'SKU',
        inclusions: '',
        unitPrice: 0,
        billingFrequency: 'One_Time',
        specialTerms: '',
        status: 'draft',
        currency: 'USD',
        notes: '',
        attachments: []
      });
    }
  }, [order, open]);

  const handleCustomerCodeChange = (code) => {
    setForm({ ...form, customerCode: code });
    
    // Auto-fetch customer details from Account
    const customer = accounts.find(a => a.code === code);
    if (customer) {
      setForm(prev => ({
        ...prev,
        customerCode: code,
        customerName: customer.name || '',
        customerBrand: customer.brand || '',
        customerAddress: customer.address || '',
        customerCountry: customer.country || '',
        customerGstId: customer.gstId || ''
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), { name: file.name, url: file_url }]
      }));
    } catch (error) {
      alert('Failed to upload file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!viewMode) {
      onSave(form);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{viewMode ? 'View Sales Order' : (order ? 'Edit Sales Order' : 'New Sales Order')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="terms">Terms</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RFQID</Label>
                  <Input value={form.RFQID} onChange={(e) => setForm({ ...form, RFQID: e.target.value })} disabled={viewMode} />
                </div>
                <div className="space-y-2">
                  <Label>Order Form No *</Label>
                  <Input value={form.orderFormNo} onChange={(e) => setForm({ ...form, orderFormNo: e.target.value })} required disabled={viewMode} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Form Value</Label>
                  <Input type="number" step="0.01" value={form.orderFormValue} onChange={(e) => setForm({ ...form, orderFormValue: parseFloat(e.target.value) || 0 })} disabled={viewMode} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} disabled={viewMode} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })} disabled={viewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                {!viewMode && <Input type="file" onChange={handleFileUpload} />}
                {form.attachments?.map((att, idx) => (
                  <div key={idx} className="text-sm text-slate-600">
                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {att.name}
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="customer" className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Code *</Label>
                <Select value={form.customerCode} onValueChange={handleCustomerCodeChange} disabled={viewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.type === 'revenue').map((acc) => (
                      <SelectItem key={acc.id} value={acc.code}>{acc.code} - {acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={form.customerName} disabled className="bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input value={form.customerBrand} disabled className="bg-slate-100" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea value={form.customerAddress} disabled className="bg-slate-100" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={form.customerCountry} disabled className="bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label>GST ID</Label>
                  <Input value={form.customerGstId} disabled className="bg-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={form.contactPersonName} onChange={(e) => setForm({ ...form, contactPersonName: e.target.value })} disabled={viewMode} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.contactPersonEmail} onChange={(e) => setForm({ ...form, contactPersonEmail: e.target.value })} disabled={viewMode} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.contactPersonPhone} onChange={(e) => setForm({ ...form, contactPersonPhone: e.target.value })} disabled={viewMode} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Term</Label>
                  <Select value={form.paymentTerm} onValueChange={(v) => setForm({ ...form, paymentTerm: v })} disabled={viewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_advance">Full Advance</SelectItem>
                      <SelectItem value="net_7">Net 7</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="net_45">Net 45</SelectItem>
                      <SelectItem value="net_60">Net 60</SelectItem>
                      <SelectItem value="net_90">Net 90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Term From</Label>
                  <Input value={form.paymentTermFrom} onChange={(e) => setForm({ ...form, paymentTermFrom: e.target.value })} disabled={viewMode} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Delivery</Label>
                <Input type="date" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} disabled={viewMode} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Order Term</Label>
                  <Select value={form.orderTerm} onValueChange={(v) => setForm({ ...form, orderTerm: v })} disabled={viewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_year">1 Year</SelectItem>
                      <SelectItem value="2_years">2 Years</SelectItem>
                      <SelectItem value="3_years">3 Years</SelectItem>
                      <SelectItem value="5_years">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} disabled={viewMode} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={viewMode} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auto Renewal</Label>
                  <Select value={form.autoRenewal} onValueChange={(v) => setForm({ ...form, autoRenewal: v })} disabled={viewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead Source</Label>
                  <Select value={form.leadSource} onValueChange={(v) => setForm({ ...form, leadSource: v })} disabled={viewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Indirect">Indirect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Partner Name</Label>
                  <Input value={form.partnerName} onChange={(e) => setForm({ ...form, partnerName: e.target.value })} disabled={viewMode} />
                </div>
                <div className="space-y-2">
                  <Label>Sales Person</Label>
                  <Input value={form.salesPersonName} onChange={(e) => setForm({ ...form, salesPersonName: e.target.value })} disabled={viewMode} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Terms</Label>
                <Textarea value={form.specialTerms} onChange={(e) => setForm({ ...form, specialTerms: e.target.value })} rows={3} disabled={viewMode} />
              </div>
            </TabsContent>

            <TabsContent value="service" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Select value={form.serviceName} onValueChange={(v) => setForm({ ...form, serviceName: v })} disabled={viewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DaaS">DaaS</SelectItem>
                      <SelectItem value="GaaS">GaaS</SelectItem>
                      <SelectItem value="Snap">Snap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>UOM</Label>
                  <Select value={form.uom} onValueChange={(v) => setForm({ ...form, uom: v })} disabled={viewMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SKU">SKU</SelectItem>
                      <SelectItem value="Tech_pack">Tech Pack</SelectItem>
                      <SelectItem value="Qty">Qty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} disabled={viewMode} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Billing Frequency</Label>
                <Select value={form.billingFrequency} onValueChange={(v) => setForm({ ...form, billingFrequency: v })} disabled={viewMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One_Time">One Time</SelectItem>
                    <SelectItem value="ARR">ARR</SelectItem>
                    <SelectItem value="MRR">MRR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Inclusions</Label>
                <Textarea value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} rows={3} disabled={viewMode} />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} disabled={viewMode} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {viewMode ? 'Close' : 'Cancel'}
            </Button>
            {!viewMode && (
              <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
                {isLoading ? 'Saving...' : (order ? 'Update' : 'Create')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}