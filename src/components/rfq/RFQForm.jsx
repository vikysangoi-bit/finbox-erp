import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function RFQForm({ open, onOpenChange, rfq, onSave }) {
  const [form, setForm] = useState({
    rfqId: '',
    legalName: '',
    brandName: '',
    currency: 'USD',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    country: '',
    scopeOfWork: '',
    serviceName: '',
    expectedValue: 0,
    status: 'draft'
  });

  useEffect(() => {
    if (rfq) {
      setForm(rfq);
    } else {
      setForm({
        rfqId: '',
        legalName: '',
        brandName: '',
        currency: 'USD',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        country: '',
        scopeOfWork: '',
        serviceName: '',
        expectedValue: 0,
        status: 'draft'
      });
    }
  }, [rfq, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rfq ? 'Edit RFQ' : 'New RFQ'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* RFQ ID */}
            <div>
              <Label>RFQ ID</Label>
              <Input
                value={form.rfqId}
                onChange={(e) => setForm({ ...form, rfqId: e.target.value })}
                placeholder="Auto-generated"
              />
            </div>

            {/* Currency */}
            <div>
              <Label>Currency *</Label>
              <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Legal Name */}
            <div>
              <Label>Legal Name *</Label>
              <Input
                required
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              />
            </div>

            {/* Brand Name */}
            <div>
              <Label>Brand Name</Label>
              <Input
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              />
            </div>

            {/* Contact Person */}
            <div>
              <Label>Contact Person</Label>
              <Input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Address */}
            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            {/* City */}
            <div>
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            {/* PIN Code */}
            <div>
              <Label>PIN Code</Label>
              <Input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>

            {/* State */}
            <div>
              <Label>State</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>

            {/* Country */}
            <div>
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>

            {/* Service Name */}
            <div>
              <Label>Service Name</Label>
              <Select value={form.serviceName} onValueChange={(value) => setForm({ ...form, serviceName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DaaS">DaaS</SelectItem>
                  <SelectItem value="GaaS">GaaS</SelectItem>
                  <SelectItem value="AI Photoshoot">AI Photoshoot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expected Value */}
            <div>
              <Label>Expected Value</Label>
              <Input
                type="number"
                value={form.expectedValue}
                onChange={(e) => setForm({ ...form, expectedValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Scope of Work */}
          <div>
            <Label>Scope of Work</Label>
            <Textarea
              value={form.scopeOfWork}
              onChange={(e) => setForm({ ...form, scopeOfWork: e.target.value })}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save RFQ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}