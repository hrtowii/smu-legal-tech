"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExtractedFinancialForm } from "../app/(marketing)/demo/types";

interface ExportStepProps {
  extractedData: ExtractedFinancialForm | null;
  onExportToCSV: () => void;
  onSaveToDatabase: () => void;
  onResetDemo: () => void;
}

export function ExportStep({
  extractedData,
  onExportToCSV,
  onSaveToDatabase,
  onResetDemo,
}: ExportStepProps) {
  if (!extractedData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          4. Export or Save Financial Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* CSV */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300">
                Download CSV
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Export the financial data as a CSV file for use in spreadsheets
                or other systems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onExportToCSV} className="w-full">
                Download CSV
              </Button>
            </CardContent>
          </Card>

          {/* DB save */}
          <Card className="bg-green-50/50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300">
                Save to Database
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Save directly to the case‑management system for immediate access
                by staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={onSaveToDatabase}
                className="w-full"
                variant="default"
              >
                Save Data to Database
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={onResetDemo}>
            Process Another Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
