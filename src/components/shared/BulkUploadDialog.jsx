import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BulkUploadDialog({ open, onOpenChange, entityName, schema, onSuccess, templateData }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setErrors([]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = templateData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadErrorFile = () => {
    if (errors.length === 0) return;

    const headers = ['Row Number', 'Error Reason', 'Data'];
    const rows = errors.map(err => [
      err.row,
      err.error,
      JSON.stringify(err.data)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName}_upload_errors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProgress(30);

      // Extract data from file
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });

      setProgress(60);

      if (extractResult.status === 'error') {
        setResult({ success: false, error: extractResult.details });
        setUploading(false);
        return;
      }

      // Bulk create records with error tracking
      const data = Array.isArray(extractResult.output) ? extractResult.output : [extractResult.output];
      const errorList = [];
      let successCount = 0;

      for (let i = 0; i < data.length; i++) {
        try {
          await base44.entities[entityName].create(data[i]);
          successCount++;
        } catch (error) {
          errorList.push({
            row: i + 2, // +2 because row 1 is header, and array is 0-indexed
            data: data[i],
            error: error.message || 'Unknown error'
          });
        }
        setProgress(60 + (40 * (i + 1) / data.length));
      }
      
      setProgress(100);
      setErrors(errorList);
      setResult({ 
        success: errorList.length === 0, 
        count: successCount,
        totalRows: data.length,
        errorCount: errorList.length
      });
      
      if (errorList.length === 0) {
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setFile(null);
          setResult(null);
          setErrors([]);
          setProgress(0);
        }, 1500);
      } else {
        onSuccess();
      }

    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Upload {entityName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              Upload a CSV or Excel file with your data. Download the template to see the required format.
            </AlertDescription>
          </Alert>

          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>

          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-slate-500 text-center">
                {progress < 30 ? 'Uploading file...' : progress < 60 ? 'Extracting data...' : 'Creating records...'}
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {result.error ? (
                    `Error: ${result.error}`
                  ) : result.success ? (
                    `Successfully uploaded ${result.count} of ${result.totalRows} records!`
                  ) : (
                    `Uploaded ${result.count} of ${result.totalRows} records. ${result.errorCount} failed.`
                  )}
                </AlertDescription>
              </Alert>
              
              {errors.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadErrorFile}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Error Report ({errors.length} errors)
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading} className="bg-slate-900 hover:bg-slate-800">
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}