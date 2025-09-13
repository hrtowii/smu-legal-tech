"use client";

import {
  ConfirmationModal,
  FieldValidationPrompt,
  SmartSuggestionPopup,
} from "./validation-modal-parts";

interface ValidationModalsProps {
  pendingConfirmation: {
    field: string;
    value: string;
    confidence: number;
    onConfirm: (newValue: string) => void;
    onEdit: (newValue: string) => void;
  } | null;
  pendingValidation: {
    field: string;
    value: string;
    validationResult: {
      isValid: boolean;
      issues: string[];
      suggestions: string[];
    };
    onAccept: () => void;
    onEdit: (newValue: string) => void;
  } | null;
  onCloseConfirmation: () => void;
  onCloseValidation: () => void;
}

export function ValidationModals({
  pendingConfirmation,
  pendingValidation,
  onCloseConfirmation,
  onCloseValidation,
}: ValidationModalsProps) {
  return (
    <>
      {pendingConfirmation && (
        <ConfirmationModal
          isOpen={true}
          onClose={onCloseConfirmation}
          onConfirm={(newVal) => pendingConfirmation.onConfirm(newVal)}
          onReject={onCloseConfirmation}
          title="Low‑confidence field"
          fieldName={pendingConfirmation.field}
          extractedValue={pendingConfirmation.value}
          confidence={pendingConfirmation.confidence}
          flags={["low_confidence"]} // you can pass actual flags if you have them
          suggestions={[]} // could be filled from a smart‑suggestion service
          alternatives={[]} // could be filled from a suggestion service
          onEdit={pendingConfirmation.onEdit}
        />
      )}

      {pendingValidation && !pendingValidation.validationResult.isValid && (
        <FieldValidationPrompt
          fieldName={pendingValidation.field}
          value={pendingValidation.value}
          confidence={1.0} // confidence not needed here, placeholder
          flags={pendingValidation.validationResult.issues}
          onValueChange={pendingValidation.onEdit}
          onValidate={pendingValidation.onAccept}
        />
      )}

      {/* Example (commented out):
      {suggestions.length > 0 && (
        <SmartSuggestionPopup
          isOpen={true}
          onClose={() => setSuggestions([])}
          onSelect={value => pendingValidation?.onEdit(value)}
          suggestions={suggestions}
          fieldName={pendingValidation?.field ?? ""}
          currentValue={pendingValidation?.value ?? ""}
        />
      )}
      */}
    </>
  );
}
