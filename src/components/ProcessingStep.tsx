// smu-legal-tech/src/app/(marketing)/demo/components/ProcessingStep.tsx
"use client";

import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProcessingStep() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          2. Processing Financial Form
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">
          Our AI is analysing the form and extracting income data…
        </p>
      </CardContent>
    </Card>
  );
}
