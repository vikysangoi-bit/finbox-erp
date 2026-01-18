import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";

export default function PageHeader({ 
  title, 
  subtitle, 
  onAdd, 
  addLabel = "Add New",
  onExport,
  onImport,
  children 
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {onExport && (
          <Button variant="outline" onClick={onExport} className="border-slate-200">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
        {onImport && (
          <Button variant="outline" onClick={onImport} className="border-slate-200">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        )}
        {onAdd && (
          <Button onClick={onAdd} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" />
            {addLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}