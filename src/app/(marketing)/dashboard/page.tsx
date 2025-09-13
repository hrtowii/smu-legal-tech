"use client";

import { useState, useEffect } from "react";
import { EnhancedFinancialForm } from "../../api/data";

interface DashboardFilters {
  status: string;
  confidenceRange: [number, number];
  hasFlags: boolean;
  dateRange: string;
}

export default function ReviewDashboard() {
  const [forms, setForms] = useState<EnhancedFinancialForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<EnhancedFinancialForm[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    status: "all",
    confidenceRange: [0, 1],
    hasFlags: false,
    dateRange: "all",
  });
  const [selectedForm, setSelectedForm] =
    useState<EnhancedFinancialForm | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [forms, filters]);

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/save");
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...forms];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((form) => form.status === filters.status);
    }

    // Confidence filter
    filtered = filtered.filter(
      (form) =>
        form.confidence >= filters.confidenceRange[0] &&
        form.confidence <= filters.confidenceRange[1],
    );

    // Flags filter
    if (filters.hasFlags) {
      filtered = filtered.filter((form) => form.flags && form.flags.length > 0);
    }

    // Sort by most recent and lowest confidence first
    filtered.sort((a, b) => {
      // First sort by confidence (lowest first)
      if (a.confidence !== b.confidence) {
        return a.confidence - b.confidence;
      }
      // Then by creation date (newest first)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    setFilteredForms(filtered);
  };

  const updateFormStatus = async (
    formId: number,
    status: string,
    reviewNotes?: string,
  ) => {
    try {
      const response = await fetch(`/api/save`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formId,
          status,
          reviewNotes,
          reviewerId: "current_user", // In a real app, this would be the logged-in user
        }),
      });

      if (response.ok) {
        // Update local state
        setForms(
          forms.map((form) =>
            form.id === formId
              ? { ...form, status, review_notes: reviewNotes }
              : form,
          ),
        );
        setSelectedForm(null);
      }
    } catch (error) {
      console.error("Failed to update form status:", error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "text-green-600 bg-green-100";
    if (confidence > 0.6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "reviewed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-orange-600 bg-orange-100";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Form Review Dashboard
        </h1>
        <p className="text-gray-600">
          Review and manage extracted financial forms requiring attention
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Forms</h3>
          <p className="text-3xl font-bold text-blue-600">{forms.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Review
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {forms.filter((f) => f.status === "pending_review").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Low Confidence
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {forms.filter((f) => f.confidence < 0.7).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">With Flags</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {forms.filter((f) => f.flags && f.flags.length > 0).length}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Confidence
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.confidenceRange[0]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  confidenceRange: [
                    parseFloat(e.target.value),
                    filters.confidenceRange[1],
                  ],
                })
              }
              className="w-full"
            />
            <span className="text-sm text-gray-600">
              {Math.round(filters.confidenceRange[0] * 100)}%
            </span>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasFlags"
              checked={filters.hasFlags}
              onChange={(e) =>
                setFilters({ ...filters, hasFlags: e.target.checked })
              }
              className="mr-2"
            />
            <label
              htmlFor="hasFlags"
              className="text-sm font-medium text-gray-700"
            >
              Only forms with flags
            </label>
          </div>
          <div>
            <button
              onClick={() =>
                setFilters({
                  status: "all",
                  confidenceRange: [0, 1],
                  hasFlags: false,
                  dateRange: "all",
                })
              }
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Forms ({filteredForms.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredForms.map((form) => (
            <div key={form.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Form #{form.id}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(form.status)}`}
                    >
                      {form.status?.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(form.confidence)}`}
                    >
                      {Math.round(form.confidence * 100)}% confidence
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(form.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {form.flags && form.flags.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {form.flags
                          .slice(0, 3)
                          .map((flag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                            >
                              {flag.replace(/_/g, " ")}
                            </span>
                          ))}
                        {form.flags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{form.flags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        Applicant Income: {form.applicantIncome?.length || 0}{" "}
                        entries
                      </div>
                      <div>
                        Household Income: {form.householdIncome?.length || 0}{" "}
                        entries
                      </div>
                      <div>
                        Other Income: {form.otherIncomeSources?.length || 0}{" "}
                        entries
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedForm(form)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => updateFormStatus(form.id, "approved")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateFormStatus(form.id, "rejected")}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredForms.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No forms found
              </h3>
              <p className="text-gray-500">
                No forms match your current filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedForm && (
        <FormReviewModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onUpdateStatus={updateFormStatus}
        />
      )}
    </div>
  );
}

interface FormReviewModalProps {
  form: EnhancedFinancialForm;
  onClose: () => void;
  onUpdateStatus: (
    formId: number,
    status: string,
    reviewNotes?: string,
  ) => void;
}

function FormReviewModal({
  form,
  onClose,
  onUpdateStatus,
}: FormReviewModalProps) {
  const [reviewNotes, setReviewNotes] = useState(form.review_notes || "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Review Form #{form.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Extraction Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Confidence: {Math.round(form.confidence * 100)}%</div>
              <div>Status: {form.status?.replace("_", " ")}</div>
              <div>Created: {new Date(form.created_at).toLocaleString()}</div>
              <div>Flags: {form.flags?.length || 0}</div>
            </div>
          </div>

          {form.flags && form.flags.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Issues Detected
              </h3>
              <div className="flex flex-wrap gap-2">
                {form.flags.map((flag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                  >
                    {flag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {form.fieldConfidence &&
            Object.keys(form.fieldConfidence).length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Field-Level Confidence
                </h3>
                <div className="space-y-2">
                  {Object.entries(form.fieldConfidence).map(
                    ([fieldName, fieldData]: [string, any]) => (
                      <div
                        key={fieldName}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm font-medium">{fieldName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {Math.round(fieldData.confidence * 100)}%
                          </span>
                          {fieldData.flags && fieldData.flags.length > 0 && (
                            <span className="text-xs text-orange-600">
                              ⚠️ {fieldData.flags.length} issues
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes about this review..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdateStatus(form.id, "rejected", reviewNotes)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reject
          </button>
          <button
            onClick={() => onUpdateStatus(form.id, "reviewed", reviewNotes)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Mark as Reviewed
          </button>
          <button
            onClick={() => onUpdateStatus(form.id, "approved", reviewNotes)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
