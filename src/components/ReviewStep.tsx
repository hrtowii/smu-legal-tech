// smu-legal-tech/src/app/(marketing)/demo/components/ReviewStep.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type {
  ApplicantIncome,
  HouseholdIncome,
  OtherIncomeSource,
  ValidationResult,
} from "../app/api/data";
import type { ExtractedFinancialForm } from "../app/(marketing)/demo/types";
import { FieldWrapper } from "./FieldWrapper";
import { getFieldDisplayName } from "../app/(marketing)/demo/utils";

interface ReviewStepProps {
  extractedData: ExtractedFinancialForm | null;
  fieldValidations: Record<string, ValidationResult>;
  onFinancialSituationChange: (value: string) => void;
  onApplicantIncomeChange: (
    idx: number,
    field: keyof ApplicantIncome,
    raw: string | number,
  ) => void;
  onHouseholdIncomeChange: (
    idx: number,
    field: keyof HouseholdIncome,
    raw: string | number,
  ) => void;
  onOtherIncomeChange: (
    idx: number,
    field: keyof OtherIncomeSource,
    raw: string | number,
  ) => void;
  addApplicantIncomeRow: () => void;
  addHouseholdIncomeRow: () => void;
  addOtherIncomeRow: () => void;
  onGoToExport: () => void;
  isValidating: boolean;
  onResetDemo: () => void;
  onContinueAnyway: () => void;
}

export function ReviewStep({
  extractedData,
  fieldValidations,
  onFinancialSituationChange,
  onApplicantIncomeChange,
  onHouseholdIncomeChange,
  onOtherIncomeChange,
  addApplicantIncomeRow,
  addHouseholdIncomeRow,
  addOtherIncomeRow,
  onGoToExport,
  isValidating,
  onResetDemo,
  onContinueAnyway,
}: ReviewStepProps) {
  if (!extractedData) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>3. Review &amp; Edit Financial Data</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <Badge
              variant={
                extractedData.confidence > 0.8
                  ? "default"
                  : extractedData.confidence > 0.6
                    ? "secondary"
                    : "destructive"
              }
            >
              {Math.round(extractedData.confidence * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* flags */}
        {extractedData.flags.length > 0 && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Flagged for Review</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2">
                {extractedData.flags.map((f) => (
                  <li key={`extracted-flag-${f}`}>{f}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* ---------- form fields ---------- */}
        <div className="space-y-8">
          {/* financial note */}
          <FieldWrapper
            path="financialSituationNote"
            label="Financial Situation Note"
            extractedData={extractedData}
            fieldValidations={fieldValidations}
          >
            <Textarea
              rows={3}
              placeholder="Any additional notes about the financial situation…"
              value={extractedData.financialSituationNote ?? ""}
              onChange={(e) => onFinancialSituationChange(e.target.value)}
              className={
                fieldValidations["financialSituationNote"]?.isValid === false
                  ? "border-destructive"
                  : ""
              }
            />
          </FieldWrapper>

          {/* applicant income */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Applicant Income</h3>
              <Button size="sm" onClick={addApplicantIncomeRow}>
                Add Row
              </Button>
            </div>

            {(!extractedData.applicantIncome ||
              extractedData.applicantIncome.length === 0) && (
              <p className="text-muted-foreground text-sm mb-4">
                No applicant‑income data extracted. Click "Add Row" to manually
                add entries.
              </p>
            )}

            {extractedData.applicantIncome?.map((inc, i) => (
              <Card
                key={`applicant-income-${i}-${inc.occupation || "unknown"}`}
                className="mb-4"
              >
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <FieldWrapper
                      path={`applicantIncome.${i}.occupation`}
                      label="Occupation"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="text"
                        value={inc.occupation ?? ""}
                        onChange={(e) =>
                          onApplicantIncomeChange(
                            i,
                            "occupation",
                            e.target.value,
                          )
                        }
                        className={
                          fieldValidations[`applicantIncome.${i}.occupation`]
                            ?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>

                    <FieldWrapper
                      path={`applicantIncome.${i}.grossMonthlyIncomeSGD`}
                      label="Monthly Income (SGD)"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="number"
                        value={inc.grossMonthlyIncomeSGD ?? 0}
                        onChange={(e) =>
                          onApplicantIncomeChange(
                            i,
                            "grossMonthlyIncomeSGD",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className={
                          fieldValidations[
                            `applicantIncome.${i}.grossMonthlyIncomeSGD`
                          ]?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>

                    <FieldWrapper
                      path={`applicantIncome.${i}.periodOfEmployment`}
                      label="Employment Period"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="text"
                        value={inc.periodOfEmployment ?? ""}
                        onChange={(e) =>
                          onApplicantIncomeChange(
                            i,
                            "periodOfEmployment",
                            e.target.value,
                          )
                        }
                        className={
                          fieldValidations[
                            `applicantIncome.${i}.periodOfEmployment`
                          ]?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* household income */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Household Income</h3>
              <Button size="sm" onClick={addHouseholdIncomeRow}>
                Add Row
              </Button>
            </div>

            {(!extractedData.householdIncome ||
              extractedData.householdIncome.length === 0) && (
              <p className="text-muted-foreground text-sm mb-4">
                No household‑income data extracted. Click "Add Row" to manually
                add entries.
              </p>
            )}

            {extractedData.householdIncome?.map((inc, i) => (
              <Card
                key={`household-income-${i}-${inc.name || "unknown"}`}
                className="mb-4"
              >
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <FieldWrapper
                      path={`householdIncome.${i}.name`}
                      label="Name"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="text"
                        value={inc.name ?? ""}
                        onChange={(e) =>
                          onHouseholdIncomeChange(i, "name", e.target.value)
                        }
                        className={
                          fieldValidations[`householdIncome.${i}.name`]
                            ?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>

                    <FieldWrapper
                      path={`householdIncome.${i}.relationshipToApplicant`}
                      label="Relationship"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="text"
                        value={inc.relationshipToApplicant ?? ""}
                        onChange={(e) =>
                          onHouseholdIncomeChange(
                            i,
                            "relationshipToApplicant",
                            e.target.value,
                          )
                        }
                        className={
                          fieldValidations[
                            `householdIncome.${i}.relationshipToApplicant`
                          ]?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>

                    <FieldWrapper
                      path={`householdIncome.${i}.occupation`}
                      label="Occupation"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="text"
                        value={inc.occupation ?? ""}
                        onChange={(e) =>
                          onHouseholdIncomeChange(
                            i,
                            "occupation",
                            e.target.value,
                          )
                        }
                        className={
                          fieldValidations[`householdIncome.${i}.occupation`]
                            ?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>

                    <FieldWrapper
                      path={`householdIncome.${i}.grossMonthlyIncomeSGD`}
                      label="Monthly Income (SGD)"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="number"
                        value={inc.grossMonthlyIncomeSGD ?? 0}
                        onChange={(e) =>
                          onHouseholdIncomeChange(
                            i,
                            "grossMonthlyIncomeSGD",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className={
                          fieldValidations[
                            `householdIncome.${i}.grossMonthlyIncomeSGD`
                          ]?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* other income */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Other Income Sources</h3>
              <Button size="sm" onClick={addOtherIncomeRow}>
                Add Row
              </Button>
            </div>

            {(!extractedData.otherIncomeSources ||
              extractedData.otherIncomeSources.length === 0) && (
              <p className="text-muted-foreground text-sm mb-4">
                No other‑income data extracted. Click "Add Row" to manually add
                entries.
              </p>
            )}

            {extractedData.otherIncomeSources?.map((inc, i) => (
              <Card
                key={`other-income-${i}-${inc.description || "unknown"}`}
                className="mb-4"
              >
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FieldWrapper
                      path={`otherIncomeSources.${i}.description`}
                      label="Description"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="text"
                        value={inc.description ?? ""}
                        onChange={(e) =>
                          onOtherIncomeChange(i, "description", e.target.value)
                        }
                        className={
                          fieldValidations[
                            `otherIncomeSources.${i}.description`
                          ]?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>

                    <FieldWrapper
                      path={`otherIncomeSources.${i}.amountSGD`}
                      label="Amount (SGD)"
                      extractedData={extractedData}
                      fieldValidations={fieldValidations}
                    >
                      <Input
                        type="number"
                        value={inc.amountSGD ?? 0}
                        onChange={(e) =>
                          onOtherIncomeChange(
                            i,
                            "amountSGD",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className={
                          fieldValidations[`otherIncomeSources.${i}.amountSGD`]
                            ?.isValid === false
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </FieldWrapper>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* validation error summary */}
        {Object.keys(fieldValidations).length > 0 &&
          Object.keys(fieldValidations).some(
            (key) => !fieldValidations[key].isValid,
          ) && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Validation Issues Found</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  Please resolve the following issues before continuing:
                </p>
                <ul className="space-y-1">
                  {Object.entries(fieldValidations)
                    .filter(([_, validation]) => !validation.isValid)
                    .map(([field, validation]) => (
                      <li key={field} className="text-sm">
                        <span className="font-medium">
                          {getFieldDisplayName(field)}:
                        </span>{" "}
                        {validation.flags?.join(", ") || "Invalid value"}
                      </li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

        {/* navigation buttons */}
        <div className="flex gap-4 mt-8">
          <Button onClick={onGoToExport} disabled={isValidating}>
            {isValidating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isValidating ? "Validating..." : "Continue to Export"}
          </Button>
          <Button variant="secondary" onClick={onContinueAnyway}>
            Continue Anyway
          </Button>
          <Button variant="outline" onClick={onResetDemo}>
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
