import React, { useMemo } from 'react';
import {
  Building2,
  Users,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  BarChart3,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { analytics, centres, currentUser } = useApp();

  const stateName = currentUser?.state || '';
  const districtName = currentUser?.district || '';

  const districtCentres = centres;

  const overloadedCentre = useMemo(() => {
    return districtCentres.find((c) => c.status === 'OVERLOADED') || districtCentres.find((c) => c.status === 'BUSY');
  }, [districtCentres]);

  const recommendedCentre = useMemo(() => {
    return districtCentres.find((c) => c.status === 'OPEN' && c.id !== overloadedCentre?.id);
  }, [districtCentres, overloadedCentre]);

  const activeCentresCount = useMemo(() => {
    return districtCentres.filter((c) => c.status !== 'CLOSED').length;
  }, [districtCentres]);

  const procurementTargetPercent = useMemo(() => {
    const target = analytics.targetProcurementQuintals || 12000;
    return Math.min(100, Math.round((analytics.totalProcurementQuintals / target) * 100));
  }, [analytics]);

  const COLORS = ['#2c694e', '#e9c46a', '#ba1a1a', '#717973'];

  const statusPieData = [
    { name: 'Normal / Open', value: analytics.centreStatusCounts.openNormal },
    { name: 'Busy', value: analytics.centreStatusCounts.busy },
    { name: 'Overloaded', value: analytics.centreStatusCounts.overloaded },
    { name: 'Closed', value: analytics.centreStatusCounts.closed },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-[#012d1d] text-[#c1ecd4] px-2.5 py-0.5 rounded-md">
              Govt. of {stateName} / Administration
            </span>
            <span className="text-xs text-[#717973]">{districtName} District HQ</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] tracking-tight mt-1">
            District Procurement & Queue Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csvContent =
                'Centre,District,Status,Queue,AvgWaitMin\n' +
                districtCentres.map((c) => `${c.name},${c.district},${c.status},${c.currentQueue},${c.estimatedWaitingTime}`).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `AnnSetu_${districtName}_District_Procurement_Report.csv`;
              a.click();
            }}
            className="bg-white hover:bg-[#f3f4f1] text-[#012d1d] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#c1c8c2]/50 flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#2c694e]" />
            <span>Export District CSV</span>
          </button>
        </div>
      </div>

      {/* Congestion Alert Banner (Dynamic per District Centres) */}
      {overloadedCentre ? (
        <div className="bg-[#fff4f2] border border-[#ba1a1a]/30 p-4 rounded-3xl flex items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#ba1a1a]">
                Congestion Alert: {overloadedCentre.name} is {overloadedCentre.status} (Queue: {overloadedCentre.currentQueue} Farmers, {overloadedCentre.estimatedWaitingTime} wait)
              </p>
              <p className="text-[#414844] mt-0.5">
                Smart Engine recommendation: Route incoming farmers to {recommendedCentre ? recommendedCentre.name : 'nearby open centres'} ({recommendedCentre ? recommendedCentre.estimatedWaitingTime : 'normal wait'}) or add 1 mobile weighbridge counter.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/admin/centres')}
            className="bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-xs px-3 py-1.5 rounded-xl shrink-0 transition-colors"
          >
            Rebalance Counters
          </button>
        </div>
      ) : (
        <div className="bg-[#f3f9f5] border border-[#2c694e]/30 p-4 rounded-3xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2c694e] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#012d1d]">
                No active congestion alerts in {districtName} district
              </p>
              <p className="text-[#414844] mt-0.5">
                All {districtCentres.length} procurement centres are operating within normal queue parameters today.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/admin/centres')}
            className="bg-[#1b4332] hover:bg-[#012d1d] text-white font-bold text-xs px-3 py-1.5 rounded-xl shrink-0 transition-colors"
          >
            View Centres
          </button>
        </div>
      )}

      {/* Core KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Total Centres Active</p>
          <p className="text-2xl md:text-3xl font-black text-[#012d1d] mt-1">{districtCentres.length}</p>
          <p className="text-[10px] text-[#2c694e] font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {activeCentresCount} Operational Today
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Registered Farmers</p>
          <p className="text-2xl md:text-3xl font-black text-[#012d1d] mt-1">
            {analytics.totalFarmers.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#2c694e] font-semibold mt-0.5">Active in {districtName} District</p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Total Procurement</p>
          <p className="text-2xl md:text-3xl font-black text-[#1b4332] mt-1">
            {analytics.totalProcurementQuintals.toLocaleString()} Qtl
          </p>
          <p className="text-[10px] text-[#717973] mt-0.5">{procurementTargetPercent}% of {((analytics.targetProcurementQuintals || 12000)).toLocaleString()} Qtl Target</p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Avg District Wait Time</p>
          <p className="text-2xl md:text-3xl font-black text-[#2c694e] mt-1">
            {analytics.averageWaitMinutes} min
          </p>
          <p className="text-[10px] text-[#2c694e] font-semibold mt-0.5">District Average Turnaround</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Issuance & Completion Over Time */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#012d1d]">Daily Token & Completion Velocity</h3>
              <p className="text-xs text-[#717973]">Tokens booked vs successfully procured</p>
            </div>
            <span className="text-xs font-bold text-[#2c694e] bg-[#f3f9f5] px-2.5 py-1 rounded-lg">
              {analytics.tokenCompletionRatePercent > 0 ? `${analytics.tokenCompletionRatePercent}% Completion Rate` : 'No Active Transactions'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.tokensOverTime}>
                <defs>
                  <linearGradient id="tokenColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1b4332" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1b4332" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="compColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c694e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2c694e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} stroke="#717973" />
                <YAxis fontSize={11} stroke="#717973" />
                <Tooltip />
                <Area type="monotone" dataKey="tokens" stroke="#1b4332" strokeWidth={2} fillOpacity={1} fill="url(#tokenColor)" name="Booked Tokens" />
                <Area type="monotone" dataKey="completed" stroke="#2c694e" strokeWidth={2} fillOpacity={1} fill="url(#compColor)" name="Procured" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Procurement Volume by Crop */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#012d1d]">Procurement Volume by Commodity (Quintals)</h3>
              <p className="text-xs text-[#717973]">Daily intake: Wheat, Paddy & Maize</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.procurementByCrop}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} stroke="#717973" />
                <YAxis fontSize={11} stroke="#717973" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Wheat" fill="#1b4332" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Paddy" fill="#2c694e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Maize" fill="#e9c46a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Centre Waiting Time Ranking Table */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#eeeeeb] flex items-center justify-between bg-[#f9faf6]">
          <div>
            <h3 className="font-bold text-base text-[#012d1d]">Centre Real-Time Queue Ranking</h3>
            <p className="text-xs text-[#717973]">Live queue status across {districtName} district centres</p>
          </div>
          <button
            onClick={() => onNavigate('/admin/centres')}
            className="text-xs font-bold text-[#2c694e] hover:underline"
          >
            Manage All Centres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f3f4f1] text-[#717973] uppercase font-bold text-[10px] border-b border-[#eeeeeb]">
              <tr>
                <th className="px-5 py-3">Centre Name</th>
                <th className="px-5 py-3">Block</th>
                <th className="px-5 py-3">Current Queue</th>
                <th className="px-5 py-3">Avg Wait Time</th>
                <th className="px-5 py-3">Counters Active</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeeb]">
              {districtCentres.map((c) => (
                <tr key={c.id} className="hover:bg-[#f9faf6] transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#012d1d]">{c.name}</td>
                  <td className="px-5 py-3.5 text-[#414844]">{c.block}</td>
                  <td className="px-5 py-3.5 font-bold text-[#012d1d]">{c.currentQueue} Farmers</td>
                  <td className="px-5 py-3.5 font-semibold text-[#2c694e]">{c.estimatedWaitingTime}</td>
                  <td className="px-5 py-3.5 text-[#414844]">
                    {c.activeCounters} / {c.counters}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === 'OPEN'
                          ? 'bg-[#aeeecb] text-[#002114]'
                          : c.status === 'BUSY'
                          ? 'bg-amber-100 text-amber-800'
                          : c.status === 'OVERLOADED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
