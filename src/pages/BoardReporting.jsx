import React, { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Filter } from "lucide-react";
import * as XLSX from 'xlsx';

export default function BoardReporting() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

  const { data: salesOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => base44.entities.SalesOrder.filter({ is_deleted: false })
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.filter({ is_deleted: false })
  });

  const { data: receipts = [], isLoading: receiptsLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: () => base44.entities.Receipt.filter({ is_deleted: false })
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list()
  });

  // Get unique regions
  const regions = useMemo(() => {
    const regionSet = new Set(accounts.map(a => a.region).filter(Boolean));
    return ['all', ...Array.from(regionSet)];
  }, [accounts]);

  // Aggregate data by brand and service
  const reportData = useMemo(() => {
    if (!salesOrders.length) return [];

    // Filter by region
    let filteredOrders = salesOrders;
    if (selectedRegion !== 'all') {
      const regionCustomers = accounts
        .filter(a => a.region === selectedRegion)
        .map(a => a.code);
      filteredOrders = salesOrders.filter(o => regionCustomers.includes(o.customerCode));
    }

    // Group by brand
    const brandData = {};

    filteredOrders.forEach(order => {
      const brand = order.customerBrand || 'Unassigned';
      const service = order.serviceName || 'Other';
      
      if (!brandData[brand]) {
        brandData[brand] = {
          brand,
          DaaS: { signed: 0, advance: 0, invoiced: 0, received: 0 },
          GaaS: { signed: 0, advance: 0, invoiced: 0, received: 0 },
          'AI Photoshoot': { signed: 0, advance: 0, invoiced: 0, received: 0 },
          SKUs: { signed: 0, advance: 0, invoiced: 0, received: 0 }
        };
      }

      // Initialize service if not exists
      if (!brandData[brand][service]) {
        brandData[brand][service] = { signed: 0, advance: 0, invoiced: 0, received: 0 };
      }

      // Signed Order Value
      const orderValue = order.orderFormValue || 0;
      brandData[brand][service].signed += orderValue;

      // Get related invoices
      const orderInvoices = invoices.filter(inv => inv.salesOrderId === order.id);
      orderInvoices.forEach(inv => {
        // Invoiced/Delivered
        brandData[brand][service].invoiced += (inv.invoiceValue || 0);

        // Received against Invoice
        const invReceipts = receipts.filter(r => r.invoiceId === inv.id);
        invReceipts.forEach(r => {
          brandData[brand][service].received += (r.receiptValue || 0);
        });
      });
    });

    // Calculate totals for each brand
    Object.values(brandData).forEach(brand => {
      brand.total = {
        signed: 0,
        advance: 0,
        invoiced: 0,
        received: 0
      };
      ['DaaS', 'GaaS', 'AI Photoshoot', 'SKUs'].forEach(service => {
        brand.total.signed += brand[service].signed;
        brand.total.advance += brand[service].advance;
        brand.total.invoiced += brand[service].invoiced;
        brand.total.received += brand[service].received;
      });
    });

    // Calculate grand totals
    const grandTotal = {
      brand: 'Total',
      DaaS: { signed: 0, advance: 0, invoiced: 0, received: 0 },
      GaaS: { signed: 0, advance: 0, invoiced: 0, received: 0 },
      'AI Photoshoot': { signed: 0, advance: 0, invoiced: 0, received: 0 },
      SKUs: { signed: 0, advance: 0, invoiced: 0, received: 0 },
      total: { signed: 0, advance: 0, invoiced: 0, received: 0 }
    };

    Object.values(brandData).forEach(brand => {
      ['DaaS', 'GaaS', 'AI Photoshoot', 'SKUs'].forEach(service => {
        grandTotal[service].signed += brand[service].signed;
        grandTotal[service].advance += brand[service].advance;
        grandTotal[service].invoiced += brand[service].invoiced;
        grandTotal[service].received += brand[service].received;
      });
      grandTotal.total.signed += brand.total.signed;
      grandTotal.total.advance += brand.total.advance;
      grandTotal.total.invoiced += brand.total.invoiced;
      grandTotal.total.received += brand.total.received;
    });

    return [...Object.values(brandData).sort((a, b) => a.brand.localeCompare(b.brand)), grandTotal];
  }, [salesOrders, invoices, receipts, accounts, selectedRegion]);

  const handleExport = () => {
    const exportData = reportData.map(row => ({
      'Brand': row.brand,
      'DaaS - Signed Order Value': row.DaaS.signed,
      'DaaS - Advance Received': row.DaaS.advance,
      'DaaS - Invoiced/Delivered': row.DaaS.invoiced,
      'DaaS - Recd. against Invoice': row.DaaS.received,
      'GaaS - Signed Order Value': row.GaaS.signed,
      'GaaS - Advance Received': row.GaaS.advance,
      'GaaS - Invoiced/Delivered': row.GaaS.invoiced,
      'GaaS - Recd. against Invoice': row.GaaS.received,
      'AI Photoshoot - Signed Order Value': row['AI Photoshoot'].signed,
      'AI Photoshoot - Advance Received': row['AI Photoshoot'].advance,
      'AI Photoshoot - Invoiced/Delivered': row['AI Photoshoot'].invoiced,
      'AI Photoshoot - Recd. against Invoice': row['AI Photoshoot'].received,
      'SKUs - Signed Order Value': row.SKUs.signed,
      'SKUs - Advance Received': row.SKUs.advance,
      'SKUs - Invoiced/Delivered': row.SKUs.invoiced,
      'SKUs - Recd. against Invoice': row.SKUs.received,
      'Total - Signed Order Value': row.total.signed,
      'Total - Advance Received': row.total.advance,
      'Total - Invoiced/Delivered': row.total.invoiced,
      'Total - Recd. against Invoice': row.total.received
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Board Report');
    XLSX.writeFile(wb, `board_report_${selectedRegion}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const isLoading = ordersLoading || invoicesLoading || receiptsLoading;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Board Reporting</h1>
            <p className="text-slate-500 mt-1">Region x Brand Level Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Report Card */}
        <Card className="p-6">
          <div className="mb-4 text-right text-sm text-slate-500">
            All values in {selectedCurrency}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan="2" className="border border-slate-300 p-2 text-left font-semibold sticky left-0 bg-slate-100 z-10">
                    Brand
                  </th>
                  <th colSpan="4" className="border border-slate-300 p-2 text-center font-semibold bg-blue-50">
                    DaaS
                  </th>
                  <th colSpan="4" className="border border-slate-300 p-2 text-center font-semibold bg-green-50">
                    GaaS
                  </th>
                  <th colSpan="4" className="border border-slate-300 p-2 text-center font-semibold bg-purple-50">
                    AI Photoshoot
                  </th>
                  <th colSpan="4" className="border border-slate-300 p-2 text-center font-semibold bg-orange-50">
                    SKUs
                  </th>
                  <th colSpan="4" className="border border-slate-300 p-2 text-center font-semibold bg-slate-200">
                    Total
                  </th>
                </tr>
                <tr className="bg-slate-100">
                  {/* DaaS */}
                  <th className="border border-slate-300 p-2 text-center text-xs bg-blue-50">Signed Order Value</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-blue-50">Advance Received</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-blue-50">Invoiced / Delivered</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-blue-50">Recd. against Invoice</th>
                  {/* GaaS */}
                  <th className="border border-slate-300 p-2 text-center text-xs bg-green-50">Signed Order Value</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-green-50">Advance Received</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-green-50">Invoiced / Delivered</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-green-50">Recd. against Invoice</th>
                  {/* AI Photoshoot */}
                  <th className="border border-slate-300 p-2 text-center text-xs bg-purple-50">Signed Order Value</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-purple-50">Advance Received</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-purple-50">Invoiced / Delivered</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-purple-50">Recd. against Invoice</th>
                  {/* SKUs */}
                  <th className="border border-slate-300 p-2 text-center text-xs bg-orange-50">Signed Order Value</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-orange-50">Advance Received</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-orange-50">Invoiced / Delivered</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-orange-50">Recd. against Invoice</th>
                  {/* Total */}
                  <th className="border border-slate-300 p-2 text-center text-xs bg-slate-200">Signed Order Value</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-slate-200">Advance Received</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-slate-200">Invoiced / Delivered</th>
                  <th className="border border-slate-300 p-2 text-center text-xs bg-slate-200">Recd. against Invoice</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="21" className="border border-slate-300 p-8 text-center text-slate-500">
                      Loading data...
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan="21" className="border border-slate-300 p-8 text-center text-slate-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  reportData.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className={row.brand === 'Total' ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'}
                    >
                      <td className="border border-slate-300 p-2 sticky left-0 bg-white z-10">
                        {row.brand}
                      </td>
                      {/* DaaS */}
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.DaaS.signed)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.DaaS.advance)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.DaaS.invoiced)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.DaaS.received)}</td>
                      {/* GaaS */}
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.GaaS.signed)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.GaaS.advance)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.GaaS.invoiced)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.GaaS.received)}</td>
                      {/* AI Photoshoot */}
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row['AI Photoshoot'].signed)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row['AI Photoshoot'].advance)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row['AI Photoshoot'].invoiced)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row['AI Photoshoot'].received)}</td>
                      {/* SKUs */}
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.SKUs.signed)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.SKUs.advance)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.SKUs.invoiced)}</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(row.SKUs.received)}</td>
                      {/* Total */}
                      <td className="border border-slate-300 p-2 text-right bg-slate-50 font-semibold">{formatCurrency(row.total.signed)}</td>
                      <td className="border border-slate-300 p-2 text-right bg-slate-50 font-semibold">{formatCurrency(row.total.advance)}</td>
                      <td className="border border-slate-300 p-2 text-right bg-slate-50 font-semibold">{formatCurrency(row.total.invoiced)}</td>
                      <td className="border border-slate-300 p-2 text-right bg-slate-50 font-semibold">{formatCurrency(row.total.received)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}