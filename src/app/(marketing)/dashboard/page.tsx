"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  flagAnalysis: Array<{ flag_type: string; count: number }>;
  confidenceDistribution: Array<{ confidence_range: string; count: number }>;
  incomeSourceAnalysis: Array<{
    source_type: string;
    count: number;
    avg_amount: number;
    min_amount: number;
    max_amount: number;
  }>;
  occupationAnalysis: Array<{
    occupation: string;
    count: number;
    avg_income: number;
  }>;
  incomeRangeDistribution: Array<{ income_range: string; count: number }>;
  submissionTrends: Array<{
    month: string;
    submissions: number;
    avg_confidence: number;
  }>;
  missingFieldsAnalysis: Array<{ missing_field: string; count: number }>;
  summaryStats: {
    total_forms: number;
    avg_confidence: number;
    low_confidence_count: number;
    forms_with_flags: number;
  };
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#a4de6c",
  "#ffc0cb",
];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={`stat-skeleton-${i}`}
                className="h-32 bg-gray-200 rounded"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={`chart-skeleton-${i}`}
                className="h-80 bg-gray-200 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Data Available
          </h1>
          <p className="text-gray-600">
            No financial forms have been processed yet.
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Financial Forms Analytics
        </h1>
        <p className="text-gray-600">
          Insights and patterns from extracted financial data
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Forms</h3>
          <p className="text-3xl font-bold text-blue-600">
            {analytics.summaryStats?.total_forms || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Average Confidence
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {Math.round((analytics.summaryStats?.avg_confidence || 0) * 100)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Low Confidence
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {analytics.summaryStats?.low_confidence_count || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">With Issues</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {analytics.summaryStats?.forms_with_flags || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Confidence Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confidence Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.confidenceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ confidence_range, percent }: any) =>
                  `${confidence_range}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.confidenceDistribution.map((entry, index) => (
                  <Cell
                    key={`confidence-${entry.confidence_range}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Common Issues/Flags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Common Issues
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.flagAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="flag_type"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income Range Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Income Range Distribution (SGD)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.incomeRangeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="income_range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income Source Analysis */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Income Sources Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.incomeSourceAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source_type" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "avg_amount") {
                    return [formatCurrency(Number(value)), "Average Amount"];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Count" />
              <Bar dataKey="avg_amount" fill="#ffc658" name="Average Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Common Occupations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Occupations
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.occupationAnalysis.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="occupation"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "avg_income") {
                    return [formatCurrency(Number(value)), "Average Income"];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#0088fe" name="Frequency" />
              <Bar dataKey="avg_income" fill="#00c49f" name="Average Income" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Missing Fields Analysis */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Commonly Missing Fields
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.missingFieldsAnalysis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ missing_field, percent }: any) =>
                  `${missing_field}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.missingFieldsAnalysis.map((entry, index) => (
                  <Cell
                    key={`missing-${entry.missing_field}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submission Trends */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Submission Trends (Last 12 Months)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analytics.submissionTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value, name) => {
                if (name === "avg_confidence") {
                  return [
                    `${(Number(value) * 100).toFixed(1)}%`,
                    "Average Confidence",
                  ];
                }
                return [value, "Submissions"];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="submissions"
              fill="#8884d8"
              name="Submissions"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avg_confidence"
              stroke="#ff7300"
              strokeWidth={3}
              name="Average Confidence"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Income Statistics Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Income Statistics Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.incomeSourceAnalysis.map((source, index) => (
                <tr key={`income-source-${source.source_type}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.source_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(source.avg_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(source.min_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(source.max_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
