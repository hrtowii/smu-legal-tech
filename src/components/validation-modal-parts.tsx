"use client";

import { useState } from "react";

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  title,
  fieldName,
  extractedValue,
  confidence,
  flags,
  suggestions = [],
  alternatives = [],
  onEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  onReject: () => void;
  title: string;
  fieldName: string;
  extractedValue: string;
  confidence: number;
  flags: string[];
  suggestions?: string[];
  alternatives?: string[];
  onEdit: (newValue: string) => void;
}) {
  const [currentValue, setCurrentValue] = useState(extractedValue);
  const [showAlternatives, setShowAlternatives] = useState(false);
  if (!isOpen) return null;

  const confidenceColor =
    confidence > 0.8
      ? "text-green-600"
      : confidence > 0.6
        ? "text-yellow-600"
        : "text-red-600";

  const confidenceLabel =
    confidence > 0.8
      ? "High confidence"
      : confidence > 0.6
        ? "Medium confidence"
        : "Low confidence";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Field: {fieldName}
            </label>
            <div className={`text-sm ${confidenceColor} font-medium`}>
              {confidenceLabel} ({Math.round(confidence * 100)}%)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Extracted Value:
            </label>
            <textarea
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full p-3 border border-input rounded-md focus:ring-ring focus:border-ring bg-background text-foreground"
              rows={3}
              placeholder="Enter the correct value..."
            />
          </div>

          {flags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Issues Detected:
              </label>
              <div className="flex flex-wrap gap-2">
                {flags.map((flag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                  >
                    {flag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Suggestions:
              </label>
              <ul className="text-sm text-muted-foreground space-y-1">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {alternatives.length > 0 && (
            <div>
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showAlternatives ? "Hide" : "Show"} alternative interpretations
                ({alternatives.length})
              </button>
              {showAlternatives && (
                <div className="mt-2 space-y-2">
                  {alternatives.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentValue(String(alt))}
                      className="w-full text-left p-2 bg-muted/50 hover:bg-muted rounded border text-sm"
                    >
                      {String(alt)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onConfirm(currentValue)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Confirm Value
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Mark as Invalid
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-input hover:border-border text-foreground rounded-lg font-medium"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export function FieldValidationPrompt({
  fieldName,
  value,
  confidence,
  flags,
  onValueChange,
  onValidate,
}: {
  fieldName: string;
  value: string;
  confidence: number;
  flags: string[];
  onValueChange: (value: string) => void;
  onValidate?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(
    flags.length > 0 || confidence < 0.7,
  );

  const getConfidenceColor = (conf: number) => {
    if (conf > 0.8) return "bg-green-100 text-green-800 border-green-200";
    if (conf > 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div
      className={`border-l-4 pl-4 ${
        confidence < 0.7
          ? "border-yellow-400 bg-yellow-50"
          : "border-green-400 bg-green-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">
            {fieldName}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded-full border ${getConfidenceColor(confidence)}`}
          >
            {Math.round(confidence * 100)}% confidence
          </span>
          {flags.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {isExpanded ? "Hide" : "Show"} issues ({flags.length})
            </button>
          )}
        </div>
        {onValidate && (
          <button
            onClick={onValidate}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
          >
            Re‑validate
          </button>
        )}
      </div>

      {isExpanded && flags.length > 0 && (
        <div className="mt-2 space-y-1">
          {flags.map((f, i) => (
            <div key={i} className="text-xs text-orange-700 flex items-center">
              <span className="mr-1">⚠️</span>
              {f.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SmartSuggestionPopup({
  isOpen,
  onClose,
  onSelect,
  suggestions,
  fieldName,
  currentValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (suggestion: string) => void;
  suggestions: string[];
  fieldName: string;
  currentValue: string;
}) {
  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg">
      <div className="p-3 border-b border-border">
        <h4 className="text-sm font-medium text-foreground">
          Suggestions for {fieldName}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          Current: "{currentValue}"
        </p>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm border-b border-border last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <span>{s}</span>
              <span className="text-xs text-blue-600">Select</span>
            </div>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-border">
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close suggestions
        </button>
      </div>
    </div>
  );
}
