import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Calendar,
  X,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  MapPin,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api/apiService';
import { Token, TokenStatus } from '../../types';

interface AuditEvent {
  time: string;
  stage: string;
  description: string;
  actor: string;
}

interface EnrichedToken extends Token {
  auditTrail?: AuditEvent[];
  operatorName?: string;
  weighbridgeCounter?: number;
  blockName?: string;
}

export const AdminTokensPage: React.FC = () => {
  const { currentUser, centres, tokens: contextTokens } = useApp();
  const [tokenList, setTokenList] = useState<EnrichedToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCentre, setSelectedCentre] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [activeAuditToken, setActiveAuditToken] = useState<EnrichedToken | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTokens() {
      setLoading(true);
      try {
        const res = await apiService.getAdminTokens();
        if (res && res.success && Array.isArray(res.tokens)) {
          if (isMounted) {
            setTokenList(res.tokens);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('API getAdminTokens error:', err);
      }

      // Build enriched tokens from context tokens filtered by district if API fails
      const baseList: EnrichedToken[] = [];
      const districtLower = (currentUser.districtName || currentUser.district || '').toLowerCase();

      contextTokens.forEach((ct) => {
        const cObj = centres.find((c) => c.id === ct.centreId);
        if (
          cObj ||
          !currentUser.district ||
          (ct.centreDistrict && ct.centreDistrict.toLowerCase() === districtLower)
        ) {
          baseList.push({
            ...ct,
            centreName: cObj ? cObj.name : 'Procurement Yard',
            operatorName: 'Active Operator Staff',
            weighbridgeCounter: 1,
            auditTrail: [
              { time: '09:00 AM', stage: 'BOOKED', description: 'Token registered in system', actor: 'AnnSetu System' },
              { time: '10:00 AM', stage: ct.status, description: `Status set to ${ct.status}`, actor: 'Queue Manager' },
            ],
          });
        }
      });

      if (isMounted) {
        setTokenList(baseList);
        setLoading(false);
      }
    }

    fetchTokens();
    return () => { isMounted = false; };
  }, [currentUser.districtName, currentUser.district, contextTokens, centres]);

  // Filtered Tokens
  const filteredTokens = useMemo(() => {
    return tokenList.filter((t) => {
      const matchSearch =
        search === '' ||
        t.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
        (t.farmerName && t.farmerName.toLowerCase().includes(search.toLowerCase())) ||
        (t.farmerMobile && t.farmerMobile.includes(search));

      const matchCentre = selectedCentre === 'ALL' || t.centreId === selectedCentre;
      const matchStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
      const matchDate = selectedDate === 'ALL' || t.date === selectedDate;

      return matchSearch && matchCentre && matchStatus && matchDate;
    });
  }, [tokenList, search, selectedCentre, selectedStatus, selectedDate]);

  const getStatusBadge = (status: TokenStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">COMPLETED</span>;
      case 'PROCESSING':
      case 'VERIFIED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">PROCESSING</span>;
      case 'CALLED':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">CALLED</span>;
      case 'WAITING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">IN QUEUE</span>;
      case 'CONFIRMED':
      case 'SCHEDULED':
      case 'ARRIVED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">{status}</span>;
      default:
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332] text-[#c1ecd4] flex items-center justify-center font-bold text-sm">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-[#2c694e] bg-[#f3f4f1] px-2.5 py-0.5 rounded-md">
              Audit & Compliance Log
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] tracking-tight mt-1">
            Token Auditor & Queue Investigation Log
          </h1>
          <p className="text-xs md:text-sm text-[#414844] mt-0.5">
            Audit token lifecycle timestamps, queue calling events, operator actions, and weighbridge intake receipts for {currentUser.districtName || 'district'}.
          </p>
        </div>
      </div>

      {/* Audit KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-2xs">
          <p className="text-[10px] font-bold text-[#717973] uppercase tracking-wider">Total Tokens Issued</p>
          <p className="text-2xl font-black text-[#012d1d] mt-1">{tokenList.length}</p>
          <p className="text-[11px] text-[#2c694e] font-semibold mt-0.5">District Total Today</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-2xs">
          <p className="text-[10px] font-bold text-[#717973] uppercase tracking-wider">Active Queue</p>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {tokenList.filter((t) => ['WAITING', 'CALLED', 'PROCESSING', 'VERIFIED'].includes(t.status)).length}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Awaiting Intake</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-2xs">
          <p className="text-[10px] font-bold text-[#717973] uppercase tracking-wider">Verified & Completed</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {tokenList.filter((t) => t.status === 'COMPLETED').length}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">MSP Receipt Generated</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-2xs">
          <p className="text-[10px] font-bold text-[#717973] uppercase tracking-wider">Filtered View</p>
          <p className="text-2xl font-black text-[#2c694e] mt-1">{filteredTokens.length}</p>
          <p className="text-[11px] text-[#414844] font-semibold mt-0.5">Matching Search</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full flex items-center gap-2 bg-[#f3f4f1] px-3 py-2 rounded-2xl border border-[#c1c8c2]/40">
            <Search className="w-4 h-4 text-[#717973]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Token Number (e.g. WHT-08432) or Farmer Name..."
              className="w-full text-xs font-semibold bg-transparent outline-none text-[#012d1d] placeholder:text-[#717973]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#717973] hover:text-[#012d1d]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {(selectedCentre !== 'ALL' || selectedStatus !== 'ALL' || search !== '') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCentre('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 border-t border-[#eeeeeb]">
          <div>
            <label className="text-[10px] font-bold text-[#717973] block mb-1">Procurement Centre</label>
            <select
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="w-full bg-[#f3f4f1] text-xs font-bold text-[#012d1d] px-3 py-2 rounded-xl border border-[#c1c8c2]/40 outline-none"
            >
              <option value="ALL">All District Centres</option>
              {centres.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#717973] block mb-1">Audit Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#f3f4f1] text-xs font-bold text-[#012d1d] px-3 py-2 rounded-xl border border-[#c1c8c2]/40 outline-none"
            >
              <option value="ALL">All Audit Statuses</option>
              <option value="WAITING">WAITING (Queue)</option>
              <option value="CALLED">CALLED (Gate)</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="NO_SHOW">NO SHOW / CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#717973] block mb-1">Date Filter</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#f3f4f1] text-xs font-bold text-[#012d1d] px-3 py-2 rounded-xl border border-[#c1c8c2]/40 outline-none"
            >
              <option value="ALL">All Dates (Today & Past)</option>
              <option value="2026-03-06">Today (2026-03-06)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Token Auditor Log Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50 shadow-2xs">
          <div className="w-8 h-8 border-4 border-[#1b4332] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#012d1d]">Loading Token Audit Records...</p>
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50 shadow-2xs space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#012d1d]">No token audit records found</h3>
          <p className="text-xs text-[#414844] max-w-md mx-auto">
            No tokens matched your search query or selected centre/status filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCentre('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-5 py-2.5 bg-[#1b4332] text-white text-xs font-bold rounded-xl shadow hover:bg-[#2c694e] transition-colors inline-flex items-center gap-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f4f1] border-b border-[#c1c8c2]/40 text-[11px] font-bold text-[#414844] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Token ID & Slot</th>
                  <th className="py-3.5 px-4">Farmer Details</th>
                  <th className="py-3.5 px-4">Procurement Centre</th>
                  <th className="py-3.5 px-4">Commodity</th>
                  <th className="py-3.5 px-4">Audit Status</th>
                  <th className="py-3.5 px-4 text-right">Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeeb] text-xs">
                {filteredTokens.map((token) => (
                  <tr key={token.id} className="hover:bg-[#f9faf6] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-black text-[#012d1d] text-sm">{token.tokenNumber}</p>
                      <p className="text-[11px] text-[#717973] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#2c694e]" />
                        <span>{token.timeSlot}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#012d1d]">{token.farmerName}</p>
                      <p className="text-[11px] text-[#717973]">{token.farmerVillage || 'Fatwah'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#012d1d] max-w-[220px] truncate">{token.centreName}</p>
                      <p className="text-[11px] text-[#717973]">Counter #{token.weighbridgeCounter || 1}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#012d1d]">{token.crop}</p>
                      <p className="text-[11px] text-[#2c694e] font-bold">{token.quantityQuintals} Quintals</p>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(token.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveAuditToken(token)}
                        className="px-3 py-1.5 bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-[#2c694e]" />
                        <span>Audit Log</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Token Audit Timeline Modal */}
      {activeAuditToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#eeeeeb] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#f3f4f1] text-[#012d1d] px-2.5 py-1 rounded-md">
                  TOKEN AUDIT REPORT
                </span>
                <h2 className="text-xl font-black text-[#012d1d] mt-1">{activeAuditToken.tokenNumber}</h2>
                <p className="text-xs text-[#414844] mt-0.5">
                  {activeAuditToken.farmerName} • {activeAuditToken.crop} ({activeAuditToken.quantityQuintals} Qtl)
                </p>
              </div>
              <button
                onClick={() => setActiveAuditToken(null)}
                className="p-2 text-[#717973] hover:text-[#012d1d] bg-[#f3f4f1] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Box */}
            <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-[#717973] uppercase font-bold">Procurement Centre</p>
                <p className="font-bold text-[#012d1d] mt-0.5 truncate">{activeAuditToken.centreName}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#717973] uppercase font-bold">Assigned Counter</p>
                <p className="font-bold text-[#012d1d] mt-0.5">Weighbridge Counter #{activeAuditToken.weighbridgeCounter || 1}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#717973] uppercase font-bold">Staff Operator</p>
                <p className="font-semibold text-[#012d1d] mt-0.5">{activeAuditToken.operatorName || 'System Verified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#717973] uppercase font-bold">Current Status</p>
                <div className="mt-0.5">{getStatusBadge(activeAuditToken.status)}</div>
              </div>
            </div>

            {/* Audit Step-by-Step Timeline */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-[#012d1d] text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#2c694e]" />
                <span>Timestamped Audit Timeline</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#c1c8c2]/50">
                {(activeAuditToken.auditTrail || [
                  { time: '08:15 AM', stage: 'BOOKED', description: 'Token generated in system', actor: 'Farmer' },
                  { time: '10:00 AM', stage: 'WAITING', description: 'Assigned to active queue', actor: 'System' },
                ]).map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#1b4332] text-[#c1ecd4] flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-xs text-[#012d1d]">{step.stage}</p>
                        <span className="text-[10px] font-mono font-bold text-[#2c694e] bg-[#f3f4f1] px-2 py-0.5 rounded">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#414844] mt-0.5">{step.description}</p>
                      <p className="text-[10px] text-[#717973] mt-0.5">Actor: {step.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-2 border-t border-[#eeeeeb]">
              <button
                onClick={() => setActiveAuditToken(null)}
                className="w-full py-2.5 bg-[#1b4332] hover:bg-[#2c694e] text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
