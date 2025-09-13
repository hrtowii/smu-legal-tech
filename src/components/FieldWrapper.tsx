// smu-legal-tech/src/app/(marketing)/demo/components/FieldWrapper.tsx
import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type {
  ExtractedFinancialForm,
  ValidationResult,
} from "../app/(marketing)/demo/types";
import {
  getFieldConfidence,
  getValidationStatus,
} from "../app/(marketing)/demo/utils";

type FieldWrapperProps = {
  path: string;
  label: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
  extractedData: ExtractedFinancialForm | null;
  fieldValidations: Record<string, ValidationResult>;
};

export const FieldWrapper = React.memo(
  ({
    path,
    label,
    children,
    extra,
    extractedData,
    fieldValidations,
  }: FieldWrapperProps) => {
    const confidence = useMemo(
      () => getFieldConfidence(path, extractedData),
      [path, extractedData],
    );
    const validation = useMemo(
      () => getValidationStatus(path, fieldValidations),
      [path, fieldValidations],
    );
    const lowConfidence = confidence !== null && confidence < 0.6;
    const hasError = (validation && !validation.isValid) || lowConfidence;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex items-center gap-2">
            {confidence !== null && (
              <Badge
                variant={
                  confidence > 0.8
                    ? "default"
                    : confidence > 0.6
                      ? "secondary"
                      : "destructive"
                }
                className="text-xs"
              >
                {Math.round(confidence * 100)}%
              </Badge>
            )}
            {hasError && (
              <Badge variant="destructive" className="text-xs">
                ⚠️
              </Badge>
            )}
            {extra}
          </div>
        </div>

        <div className="relative">
          {children}
          {hasError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {lowConfidence && (
                  <p className="mb-1">Low confidence extraction</p>
                )}
                {validation && !validation.isValid && (
                  <div className="space-y-1">
                    {validation.flags?.map((f) => (
                      <p key={`validation-flag-${f}`}>{f}</p>
                    ))}
                    {validation.suggestions?.length > 0 && (
                      <p className="mt-2 text-blue-600 dark:text-blue-400">
                        Suggestion: {validation.suggestions.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  },
);
