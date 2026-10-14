import React, { useState } from "react";
import { X, QrCode, Camera, Search, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Patient } from "../types";
import { getPatients } from "../lib/storage";

interface QRScannerModalProps {
  onClose: () => void;
  onPatientFound: (patient: Patient) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  onPatientFound
}) => {
  const [manualCode, setManualCode] = useState("");
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(true);

  const handleLookup = (code: string) => {
    const clean = code.trim().toLowerCase();
    if (!clean) return;

    const all = getPatients();
    // Try matching fileNumber, barcodeNumber, nin, or ID
    const found = all.find((p) => {
      return (
        p.fileNumber.toLowerCase() === clean ||
        p.barcodeNumber.toLowerCase() === clean ||
        (p.nin && p.nin.toLowerCase() === clean) ||
        (p.legacyPaperFileNumber && p.legacyPaperFileNumber.toLowerCase() === clean) ||
        p.id === clean
      );
    });

    if (found) {
      setScanStatus(`Found patient file: ${found.lastName}, ${found.firstName} (${found.fileNumber})`);
      setTimeout(() => {
        onPatientFound(found);
        onClose();
      }, 500);
    } else {
      setScanStatus("No record found matching this barcode or QR code.");
    }
  };

  const handleQuickDemoScan = (patient: Patient) => {
    setManualCode(patient.fileNumber);
    handleLookup(patient.fileNumber);
  };

  const samplePatients = getPatients().slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              Scan Folder QR Code or Barcode
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Simulated Scanner Viewfinder */}
          <div className="relative aspect-4/3 bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-emerald-500/80 p-4">
            {/* Viewfinder Target Box */}
            <div className="w-44 h-44 border-2 border-dashed border-emerald-400 rounded-xl relative flex items-center justify-center animate-pulse">
              <div className="w-32 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              <span className="absolute -top-3 bg-slate-900 px-2 text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                Align Camera to Sticker
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-3 text-center">
              Position physical Manila folder QR label or patient plastic card within frame
            </p>
          </div>

          {/* Manual Input Alternative */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Or Type Stamped File Number / Barcode:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup(manualCode)}
                placeholder="e.g. UCH/2021/04812"
                className="flex-1 p-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleLookup(manualCode)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </div>
          </div>

          {scanStatus && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              scanStatus.includes("Found") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              {scanStatus.includes("Found") ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{scanStatus}</span>
            </div>
          )}

          {/* Quick Demo Shortcuts */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Test Scan Simulation:
            </p>
            <div className="space-y-1.5">
              {samplePatients.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => handleQuickDemoScan(sp)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900">{sp.lastName}, {sp.firstName}</span>
                    <span className="font-mono text-slate-500 ml-2">({sp.fileNumber})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
