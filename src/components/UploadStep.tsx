// smu-legal-tech/src/app/(marketing)/demo/components/UploadStep.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UploadStepProps {
  file: File | null;
  imagePreview: string | null;
  isProcessing: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExtract: () => void;
  onRemove: () => void;
}

export function UploadStep({
  file,
  imagePreview,
  isProcessing,
  onFileUpload,
  onExtract,
  onRemove,
}: UploadStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          1. Upload Financial Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <input
              type="file"
              onChange={onFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-muted-foreground">
                <Upload className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg mb-2">
                  <span className="font-medium text-primary hover:text-primary/80">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-sm">PDF, PNG, JPG up to 10 MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* image preview */}
            {imagePreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Image preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Image
                      src={imagePreview}
                      alt="Uploaded financial form"
                      width={800}
                      height={600}
                      className="max-w-full max-h-96 object-contain border rounded shadow"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* file card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onRemove}
                    >
                      Remove
                    </Button>
                    <Button onClick={onExtract} disabled={isProcessing}>
                      {isProcessing
                        ? "Processing…"
                        : "Extract Financial Data"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
