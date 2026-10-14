import React, { useState, useRef } from "react";
import { 
  X, 
  HardDrive, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Save, 
  ShieldCheck, 
  Database
} from "lucide-react";
import { 
  exportDatabaseBackupJson, 
  importDatabaseBackupJson, 
  resetToInitialSeed, 
  getHospitalConfig, 
  saveHospitalConfig,
  getPatients,
  getAuditLogs
} from "../lib/storage";

interface BackupManagerModalProps {
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupManagerModal: React.FC<BackupManagerModalProps> = ({
  onClose,
  onDataChanged
}) => {
  const [config, setConfig] = useState(getHospitalConfig());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patients = getPatients();
  const logs = getAuditLogs();

  const handleDownloadBackup = () => {
    const jsonString = exportDatabaseBackupJson();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `medifile_ng_backup_${config.filePrefix.toLowerCase()}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage("Database backup downloaded successfully. Safe to copy to external flash drive.");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importDatabaseBackupJson(text);
        if (success) {
          setStatusMessage("Database backup restored successfully!");
          onDataChanged();
        } else {
          setStatusMessage("Failed to restore backup. Invalid file format.");
        }
      } catch (err) {
        setStatusMessage("Error reading file.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (confirm("Reset database to the pre-loaded Nigerian hospital patients? Current changes will be replaced.")) {
      resetToInitialSeed();
      setStatusMessage("Reset to sample Nigerian hospital dataset completed.");
      onDataChanged();
    }
  };

  const handleSaveHospitalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveHospitalConfig(config);
    setStatusMessage("Hospital facility configuration saved.");
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden space-y-4">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Hospital Offline Database & Backup Center
              </h2>
              <p className="text-xs text-slate-400">
                Daily backup to flash drive, restore archive, and facility configurations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{statusMessage}</span>
            </div>
          )}

          {/* Database Vital Statistics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Patients Registered</span>
              <span className="text-xl font-bold text-slate-900">{patients.length}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Audit Actions</span>
              <span className="text-xl font-bold text-slate-900">{logs.length}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Storage Protocol</span>
              <span className="text-xs font-bold text-emerald-700 mt-1 block">Offline-First Indexed</span>
            </div>
          </div>

          {/* Backup & Restore Controls */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              Data Safety & External Flash Drive Backup
            </h3>
            <p className="text-slate-600 text-[11px]">
              In hospitals with erratic power supply or zero internet, records officers can export the entire hospital patient database as an encrypted, structured JSON file to store safely on a USB drive at the end of each shift.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Daily Flash Drive Backup</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup File</span>
              </button>

              <button
                onClick={handleResetSeed}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium transition-colors cursor-pointer ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>

          {/* Hospital Facility Profile Config */}
          <form onSubmit={handleSaveHospitalConfig} className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-slate-600" />
              Hospital Institution Profile
            </h3>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Official Hospital Facility Name</label>
              <input
                type="text"
                value={config.hospitalName}
                onChange={(e) => setConfig({ ...config, hospitalName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">File Number Prefix</label>
                <input
                  type="text"
                  value={config.filePrefix}
                  onChange={(e) => setConfig({ ...config, filePrefix: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hospital State</label>
                <input
                  type="text"
                  value={config.state}
                  onChange={(e) => setConfig({ ...config, state: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Update Facility Details</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
