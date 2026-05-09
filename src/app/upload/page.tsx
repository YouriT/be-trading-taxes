"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, X, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsUploading(false);
    setFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Upload Broker Statements</h1>

      <Card>
        <CardContent className="p-10">
          <div
            className={cn(
              "border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center transition-colors",
              "hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
            )}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">Revolut or Trade Republic PDF statements</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={onFileChange}
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-500 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                  <X size={18} />
                </button>
              </div>
            ))}
            <div className="pt-4 flex justify-end">
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    "Process Statements"
                  )}
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
