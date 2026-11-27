"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartData {
  onTimeVsLate: { name: string; value: number }[];
  byDeliverableType: { name: string; count: number }[];
  byCategory: { name: string; count: number }[];
  workloadByOwner: { name: string; total: number; completed: number }[];
  monthlyTrend: { month: string; onTime: number; late: number }[];
}

const PIE_COLORS = ["#2563EB", "#E11D48", "#64748B", "#9CA3AF"];

export function DashboardCharts({ charts }: { charts: ChartData }) {
  const hasAnyData =
    charts.onTimeVsLate.some((d) => d.value > 0) ||
    charts.byDeliverableType.length > 0 ||
    charts.workloadByOwner.length > 0;

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productivity Overview</CardTitle>
          <CardDescription>
            Charts will populate automatically as jobs and deliverables are recorded.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* On-Time vs Late */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Delivery Timeliness</CardTitle>
          <CardDescription>On-time vs late and overdue deliverables</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.onTimeVsLate.filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={3}
              >
                {charts.onTimeVsLate.map((entry, idx) => (
                  <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deliverables by Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Deliverables by Type</CardTitle>
          <CardDescription>Distribution across content &amp; production assets</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.byDeliverableType.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11, fill: "#202638" }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Workload by Team Lead */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Workload by Owner</CardTitle>
          <CardDescription>Assigned vs completed deliverables per lead</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.workloadByOwner}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#202638" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip />
              <Bar dataKey="total" name="Assigned" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Approved" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

