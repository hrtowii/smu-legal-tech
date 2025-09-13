"use client";

import { useState, useEffect } from "react";

interface ExtractedRecord {
  id: number;
  applicant_name: string;
  contact_number: string;
  email: string;
  address: string;
  date_of_birth: string;
  charges: string;
  prior_convictions: string;
  employment_status: string;
  monthly_income: string;
  dependents: string;
  emergency_contact: string;
  flags: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
}

export default function History() {
  const [records, setRecords] = useState<ExtractedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ExtractedRecord | null>(
    null,
  );

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/save");
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        setError("Failed to fetch records");
      }
    } catch (err) {
      setError("Error fetching records");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportRecordToCSV = (record: ExtractedRecord) => {
    const csvData = [
      ["Field", "Value"],
      ["ID", record.id.toString()],
      ["Applicant Name", record.applicant_name],
      ["Contact Number", record.contact_number],
      ["Email", record.email],
      ["Address", record.address],
      ["Date of Birth", record.date_of_birth],
      ["Charges", record.charges],
      ["Prior Convictions", record.prior_convictions],
      ["Employment Status", record.employment_status],
      ["Monthly Income", record.monthly_income],
      ["Dependents", record.dependents],
      ["Emergency Contact", record.emergency_contact],
      ["Flags", record.flags.join("; ")],
      ["Confidence Score", record.confidence.toString()],
      ["Created At", record.created_at],
    ];

    const csvContent = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extraction_${record.id}_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-SG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading extraction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchRecords}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Extraction History
        </h1>
        <p className="text-xl text-gray-600">
          Archive of all processed legal forms and extracted data
        </p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No extractions yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by processing a form in the demo section.
          </p>
          <div className="mt-6">
            <a
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Process a Form
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.applicant_name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.contact_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.charges || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.confidence > 0.8
                            ? "bg-green-100 text-green-800"
                            : record.confidence > 0.6
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {Math.round(record.confidence * 100)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.flags.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {record.flags.length} flag
                          {record.flags.length !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => exportRecordToCSV(record)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Extraction Details - {selectedRecord.applicant_name}
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
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

            <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {Object.entries(selectedRecord)
                .filter(
                  ([key]) =>
                    !["id", "flags", "created_at", "updated_at"].includes(key),
                )
                .map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <div className="p-2 bg-gray-50 rounded text-sm text-gray-900">
                      {String(value) || "N/A"}
                    </div>
                  </div>
                ))}
            </div>

            {selectedRecord.flags.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  Review Flags:
                </h4>
                <ul className="text-sm text-yellow-700">
                  {selectedRecord.flags.map((flag, index) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => exportRecordToCSV(selectedRecord)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Export CSV
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
