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
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface GridItemProps {
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
}

const GridItem = ({ title, description, children }: GridItemProps) => {
  return (
    <div className="min-h-[14rem]">
      <div className="relative h-full rounded-2xl border md:rounded-3xl">
        <GlowingEffect
          blur={3}
          borderWidth={3}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  "#6f70ff",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#efa9ff",
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
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={`stat-skeleton-${i}`}
                className="h-32 bg-muted rounded"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={`chart-skeleton-${i}`}
                className="h-80 bg-muted rounded"
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
          <h1 className="text-2xl font-bold text-foreground mb-4">
            No Data Available
          </h1>
          <p className="text-muted-foreground">
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Financial Forms Analytics
        </h1>
        <p className="text-muted-foreground">
          Insights and patterns from extracted financial data
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GridItem
          title="Total Forms"
          description={
            <p className="text-3xl font-bold text-justice-blue">
              {analytics.summaryStats?.total_forms || 0}
            </p>
          }
        />
        <GridItem
          title="Average Confidence"
          description={
            <p className="text-3xl font-bold text-green-600">
              {Math.round((analytics.summaryStats?.avg_confidence || 0) * 100)}%
            </p>
          }
        />
        <GridItem
          title="Low Confidence"
          description={
            <p className="text-3xl font-bold text-red-600">
              {analytics.summaryStats?.low_confidence_count || 0}
            </p>
          }
        />
        <GridItem
          title="With Issues"
          description={
            <p className="text-3xl font-bold text-yellow-600">
              {analytics.summaryStats?.forms_with_flags || 0}
            </p>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Confidence Distribution */}
        <GridItem
          title="Confidence Distribution"
          description=""
          children={
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
          }
        />

        {/* Common Issues/Flags */}
        <GridItem
          title="Common Issues"
          description=""
          children={
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
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income Range Distribution */}
        <GridItem
          title="Income Range Distribution (SGD)"
          description=""
          children={
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.incomeRangeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="income_range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          }
        />

        {/* Income Source Analysis */}
        <GridItem
          title="Income Sources Overview"
          description=""
          children={
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
                <Bar
                  dataKey="avg_amount"
                  fill="#ffc658"
                  name="Average Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Common Occupations */}
        <GridItem
          title="Top Occupations"
          description=""
          children={
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
                <Bar
                  dataKey="avg_income"
                  fill="#00c49f"
                  name="Average Income"
                />
              </BarChart>
            </ResponsiveContainer>
          }
        />

        {/* Missing Fields Analysis */}
        <GridItem
          title="Commonly Missing Fields"
          description=""
          children={
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
          }
        />
      </div>

      {/* Submission Trends */}
      <div className="mb-8">
        <GridItem
          title="Submission Trends (Last 12 Months)"
          description=""
          children={
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
          }
        />
      </div>

      {/* Income Statistics Table */}
      <div className="bg-card p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Income Statistics Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Income Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Average Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Min Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Max Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {analytics.incomeSourceAnalysis.map((source, index) => (
                <tr key={`income-source-${source.source_type}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {source.source_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {source.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatCurrency(source.avg_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatCurrency(source.min_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
