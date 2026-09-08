import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Filter,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CentreStatus, ProcurementCentre } from '../../types';

export const AdminCentresPage: React.FC = () => {
  const { currentUser, centres, updateCentreCounters, updateCentreStatus } = useApp();
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Blocks list
  const blocks = useMemo(() => Array.from(new Set(centres.map((c) => c.block).filter(Boolean))), [centres]);

  const filteredCentres = useMemo(() => {
    return centres.filter((c) => {
      const matchSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.officialId || c.id || '').toLowerCase().includes(search.toLowerCase()) ||
        c.block.toLowerCase().includes(search.toLowerCase()) ||
        c.district.toLowerCase().includes(search.toLowerCase());

      const matchBlock = selectedBlock === 'ALL' || c.block === selectedBlock;
      const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

      return matchSearch && matchBlock && matchStatus;
    });
  }, [centres, search, selectedBlock, selectedStatus]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332] text-[#c1ecd4] flex items-center justify-center font-bold text-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-[#2c694e] bg-[#f3f4f1] px-2.5 py-0.5 rounded-md">
              {currentUser.districtName || 'District'} Centre Master
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] tracking-tight mt-1">
            Centres Management & Queue Control
          </h1>
          <p className="text-xs md:text-sm text-[#414844] mt-0.5">
            Configure weighbridge counters, manage centre intake status, and rebalance queues across {currentUser.districtName || 'district'} procurement yards.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full flex items-center gap-2 bg-[#f3f4f1] px-3.5 py-2.5 rounded-2xl border border-[#c1c8c2]/40">
            <Search className="w-4 h-4 text-[#717973]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search centres by name, ID, or block..."
              className="w-full text-xs font-semibold bg-transparent outline-none text-[#012d1d] placeholder:text-[#717973]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#717973] hover:text-[#012d1d]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {(selectedBlock !== 'ALL' || selectedStatus !== 'ALL' || search !== '') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedBlock('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#eeeeeb]">
          <div>
            <label className="text-[10px] font-bold text-[#717973] block mb-1">Block Filter</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full bg-[#f3f4f1] text-xs font-bold text-[#012d1d] px-3.5 py-2 rounded-xl border border-[#c1c8c2]/40 outline-none"
            >
              <option value="ALL">All Blocks ({blocks.length})</option>
              {blocks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#717973] block mb-1">Operational Status Filter</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#f3f4f1] text-xs font-bold text-[#012d1d] px-3.5 py-2 rounded-xl border border-[#c1c8c2]/40 outline-none"
            >
              <option value="ALL">All Operating Statuses</option>
              <option value="OPEN">OPEN (Normal)</option>
              <option value="BUSY">BUSY</option>
              <option value="OVERLOADED">OVERLOADED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Centres Grid or Empty State */}
      {filteredCentres.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50 shadow-2xs space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#012d1d]">No procurement centres found</h3>
          <p className="text-xs text-[#414844] max-w-md mx-auto">
            No centres match your current search query or active block/status filter criteria.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedBlock('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-5 py-2.5 bg-[#1b4332] text-white text-xs font-bold rounded-xl shadow hover:bg-[#2c694e] transition-colors inline-flex items-center gap-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCentres.map((centre) => (
            <div
              key={centre.id}
              className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono bg-[#f3f4f1] text-[#012d1d] px-2 py-0.5 rounded font-bold">
                    {centre.officialId || centre.id}
                  </span>
                  <h3 className="font-extrabold text-base text-[#012d1d] mt-1">{centre.name}</h3>
                  <p className="text-xs text-[#414844] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2c694e] shrink-0" />
                    <span>{centre.block} Block, {centre.district}</span>
                  </p>
                </div>

                {/* Status Selector */}
                <select
                  value={centre.status}
                  onChange={(e) => updateCentreStatus(centre.id, e.target.value as CentreStatus)}
                  className="bg-[#f3f4f1] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#c1c8c2]/50 outline-none"
                >
                  <option value="OPEN">OPEN (Normal)</option>
                  <option value="BUSY">BUSY</option>
                  <option value="OVERLOADED">OVERLOADED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40 text-center text-xs">
                <div>
                  <p className="text-[10px] text-[#717973] uppercase font-bold">Live Queue</p>
                  <p className="font-extrabold text-[#012d1d] mt-0.5">{centre.currentQueue} Farmers</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#717973] uppercase font-bold">Est. Wait</p>
                  <p className="font-extrabold text-[#2c694e] mt-0.5">{centre.estimatedWaitingTime}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#717973] uppercase font-bold">Completed</p>
                  <p className="font-extrabold text-[#012d1d] mt-0.5">{centre.completedToday} Farmers</p>
                </div>
              </div>

              {/* Counter adjustment */}
              <div className="flex items-center justify-between pt-2 border-t border-[#eeeeeb]">
                <div>
                  <p className="text-xs font-bold text-[#012d1d]">Active Weighbridge Counters</p>
                  <p className="text-[11px] text-[#717973]">Max available: {centre.counters} counters</p>
                </div>

                <div className="flex items-center gap-2 bg-[#f3f4f1] p-1 rounded-xl border border-[#c1c8c2]/50">
                  <button
                    onClick={() => updateCentreCounters(centre.id, centre.activeCounters - 1)}
                    disabled={centre.activeCounters <= 1}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-xs hover:bg-[#eeeeeb] disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-extrabold text-sm text-[#012d1d]">
                    {centre.activeCounters}
                  </span>
                  <button
                    onClick={() => updateCentreCounters(centre.id, centre.activeCounters + 1)}
                    disabled={centre.activeCounters >= centre.counters}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-xs hover:bg-[#eeeeeb] disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
