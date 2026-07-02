"use client";

import {
  Activity,
  BarChart3,
  Download,
  Filter,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"];

export default function AnalyticsDashboardPage() {
  const yieldData = [
    { name: "Jan", yield: 4000, price: 42 },
    { name: "Feb", yield: 3000, price: 44 },
    { name: "Mar", yield: 5000, price: 46 },
    { name: "Apr", yield: 2000, price: 45 },
    { name: "May", yield: 4500, price: 48 },
    { name: "Jun", yield: 6000, price: 52 },
  ];

  const distributionData = [
    { name: "Reforestation", value: 45 },
    { name: "Regen Ag", value: 30 },
    { name: "Blue Carbon", value: 15 },
    { name: "Renewables", value: 10 },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-12">
        <div className="max-w-2xl">
          <p className="text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <BarChart3 size={14} /> Yield Intelligence & Impact Analytics
          </p>
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase italic">
            Statistical <br /> Breakdown
          </h1>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 h-14 px-8 font-black uppercase tracking-widest text-[10px]"
          >
            <Download size={16} className="mr-2" /> Export Dataset
          </Button>
          <Button className="bg-slate-900 hover:bg-black text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl">
            <Filter size={16} className="mr-2" /> Adjust Parameters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-sm">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                Yield Performance (tCO2e)
              </h3>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-black text-[10px] text-slate-500 uppercase tracking-widest">
                Net Growth: <span className="text-brand-600">+24.2%</span>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldData}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      fontSize: "10px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="yield"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorYield)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <Activity
                size={100}
                className="absolute top-0 right-0 p-8 opacity-10"
              />
              <p className="text-brand-400 text-[9px] font-black uppercase tracking-widest mb-4">
                Precision MRV Integrity
              </p>
              <h4 className="text-4xl font-black italic uppercase tracking-tighter">
                99.8%
              </h4>
              <p className="text-slate-500 text-xs font-bold uppercase mt-6">
                Sensor Uptime & Trust Score
              </p>
            </div>
            <div className="bg-brand-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <TrendingUp
                size={100}
                className="absolute top-0 right-0 p-8 opacity-10"
              />
              <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-4">
                Average Market Liquidity
              </p>
              <h4 className="text-4xl font-black italic uppercase tracking-tighter">
                $52.40
              </h4>
              <p className="text-white/40 text-xs font-bold uppercase mt-6">
                Registry Asset Floor Price
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-sm h-full">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12 text-center">
              Portfolio Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {distributionData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-12 space-y-4">
              {distributionData.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900 tracking-tighter italic">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
