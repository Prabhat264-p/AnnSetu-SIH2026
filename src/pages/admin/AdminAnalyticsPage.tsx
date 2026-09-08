import React from 'react';
import {
  BarChart3,
  Clock,
  TrendingDown,
  Download,
  AlertCircle,
  Wheat,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const AdminAnalyticsPage: React.FC = () => {
  const { analytics } = useApp();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] tracking-tight">
            Procurement Analytics & Peak Traffic Heatmap
          </h1>
          <p className="text-xs md:text-sm text-[#414844] mt-0.5">
            Hourly arrival distribution, average turnaround duration, no-show rates, and crop-wise intake metrics.
          </p>
        </div>

        <button
          onClick={() => {
            const csvContent =
              'Metric,Value\n' +
              `Total Farmers Served,${analytics.totalFarmers}\n` +
              `Average Wait Time,${analytics.averageWaitMinutes} min\n` +
              `Token Completion Rate,${analytics.tokenCompletionRatePercent}%\n` +
              `No-Show Rate,${analytics.noShowRatePercent}%\n` +
              `Cancelled Tokens,${analytics.cancelledTokensCount}\n`;
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'AnnSetu_Analytics_Summary.csv';
            a.click();
          }}
          className="bg-white hover:bg-[#f3f4f1] text-[#012d1d] text-xs font-bold px-4 py-2 rounded-xl border border-[#c1c8c2]/50 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#2c694e]" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Completion Rate</p>
          <p className="text-2xl font-black text-[#2c694e] mt-1">{analytics.tokenCompletionRatePercent}%</p>
          <p className="text-[10px] text-[#2c694e] font-semibold mt-0.5">High Efficiency</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">No-Show Rate</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{analytics.noShowRatePercent}%</p>
          <p className="text-[10px] text-[#717973] mt-0.5">Automated SMS Reminders</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Cancelled Tokens</p>
          <p className="text-2xl font-black text-[#ba1a1a] mt-1">{analytics.cancelledTokensCount}</p>
          <p className="text-[10px] text-[#717973] mt-0.5">Slot Reallocated</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-xs">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Farmer Satisfaction</p>
          <p className="text-2xl font-black text-[#012d1d] mt-1">
            {typeof analytics.farmerSatisfactionScore === 'number' ? `${analytics.farmerSatisfactionScore} / 5.0` : 'N/A'}
          </p>
          <p className="text-[10px] text-[#2c694e] font-semibold mt-0.5">
            {typeof analytics.farmerSatisfactionScore === 'number' ? '★ Top Rated Platform' : 'No ratings recorded yet'}
          </p>
        </div>
      </div>

      {/* Hourly Arrival Traffic Heatmap Grid */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#012d1d]">Hourly Farmer Arrival Distribution</h3>
            <p className="text-xs text-[#717973]">Tractor & vehicle arrival volume throughout working hours</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
            analytics.peakArrivalHours.some(h => h.trafficLevel === 'PEAK' && h.count > 0)
              ? 'text-[#ba1a1a] bg-[#fff4f2]'
              : 'text-[#2c694e] bg-[#f3f9f5]'
          }`}>
            {analytics.peakArrivalHours.some(h => h.trafficLevel === 'PEAK' && h.count > 0)
              ? 'Peak Rush: 10 AM - 12 PM'
              : 'Normal Traffic'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {analytics.peakArrivalHours.map((slot) => (
            <div
              key={slot.hour}
              className={`p-4 rounded-2xl border text-center ${
                slot.trafficLevel === 'PEAK'
                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] shadow-sm'
                  : slot.trafficLevel === 'HIGH'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : slot.trafficLevel === 'MEDIUM'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-[#f3f4f1] text-[#414844] border-[#c1c8c2]/40'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider">{slot.hour}</p>
              <p className="text-2xl font-black mt-1">{slot.count}</p>
              <p className="text-[10px] uppercase font-bold mt-0.5 tracking-wide opacity-80">
                {slot.trafficLevel} Arrival
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Average Waiting Time by Centre */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#012d1d]">Average Waiting Time by Centre (Minutes)</h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.waitTimeByCentre} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" fontSize={11} stroke="#717973" unit=" min" />
              <YAxis dataKey="centreName" type="category" width={180} fontSize={11} stroke="#717973" />
              <Tooltip />
              <Bar dataKey="waitMinutes" fill="#1b4332" radius={[0, 4, 4, 0]} name="Wait Time (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
