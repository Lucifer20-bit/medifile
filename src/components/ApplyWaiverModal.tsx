import React, { useState } from "react";
import { BillingInvoice } from "../types";
import { applyWaiver, getActiveStaff } from "../lib/storage";
import { X, ShieldCheck, Check, AlertCircle } from "lucide-react";

interface ApplyWaiverModalProps {
  invoice: BillingInvoice;
  onClose: () => void;
  onWaiverApplied: (updated: BillingInvoice) => void;
}

export const ApplyWaiverModal: React.FC<ApplyWaiverModalProps> = ({
  invoice,
  onClose,
  onWaiverApplied
}) => {
  const staff = getActiveStaff();
  const [waiverAmount, setWaiverAmount] = useState<number>(invoice.balanceDueNaira || invoice.subtotalNaira);
  const [reason, setReason] = useState("Hospital Medical Social Welfare Indigent Support Scheme");
  const [approvedBy, setApprovedBy] = useState("Dr. Babatunde Adeyemi (Chief Medical Director / CMD)");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (waiverAmount <= 0) {
      alert("Please enter a valid waiver amount.");
      return;
    }

    setIsProcessing(true);
    const updated = applyWaiver(invoice.id, {
      waiverAmount,
      reason: reason.trim(),
      approvedBy: approvedBy.trim(),
      cashierName: staff.name
    });

    if (updated) {
      onWaiverApplied(updated);
    }
    setIsProcessing(false);
  };

  const isFullWaiver = waiverAmount >= (invoice.balanceDueNaira || invoice.subtotalNaira);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top bar */}
        <div className="p-4 bg-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Apply Hospital Fee Waiver / Subsidy</h2>
              <p className="text-[11px] text-purple-200 font-mono">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-purple-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-5">
          {/* Patient Card */}
          <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200 text-xs">
            <div className="text-[10px] font-bold uppercase text-purple-800">Patient File & Billing Context</div>
            <div className="font-extrabold text-slate-900 text-sm mt-0.5">{invoice.patientName}</div>
            <div className="text-slate-600 font-mono mt-0.5">
              File: <strong>{invoice.patientFileNumber}</strong> • Total Bill: <strong className="text-slate-900">₦{invoice.subtotalNaira.toLocaleString()}</strong>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Waiver / Subsidy Amount (₦)
              </label>
              <input
                type="number"
                min="1"
                max={invoice.subtotalNaira}
                value={waiverAmount}
                onChange={(e) => setWaiverAmount(parseInt(e.target.value) || 0)}
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-base font-bold font-mono text-slate-900 focus:ring-1 focus:ring-purple-600"
              />
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                <span>Waiver coverage:</span>
                <span className={`font-bold ${isFullWaiver ? 'text-purple-700' : 'text-slate-700'}`}>
                  {isFullWaiver ? "100% Full Hospital Waiver" : `Partial Waiver (Balance: ₦${(invoice.subtotalNaira - waiverAmount).toLocaleString()})`}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Clinical / Social Welfare Scheme Justification
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-purple-600 mb-2"
              >
                <option value="Sickle Cell Warrior Emergency Care Protocol">Sickle Cell Warrior Emergency Care Protocol</option>
                <option value="Hospital Medical Social Welfare Indigent Support Scheme">Hospital Medical Social Welfare Indigent Support Scheme</option>
                <option value="Accident & Emergency Acute Life-Saving Resuscitation Protocol">Accident & Emergency Acute Life-Saving Resuscitation Protocol</option>
                <option value="Vulnerable Mother & Under-5 Pediatric Health Subsidy">Vulnerable Mother & Under-5 Pediatric Health Subsidy</option>
                <option value="Hospital Staff Dependent Compassionate Concession">Hospital Staff Dependent Compassionate Concession</option>
                <option value="Custom Clinical Waiver">Custom Clinical Justification...</option>
              </select>
              {reason === "Custom Clinical Waiver" && (
                <input
                  type="text"
                  placeholder="Enter specific medical or administrative reason"
                  required
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Authorizing Medical Officer / Directorate
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                required
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Applying this waiver marks the patient's bill as officially cleared under hospital administrative protocols, allowing immediate laboratory investigation and pharmacy medication release.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || waiverAmount <= 0}
              className="flex items-center gap-2 px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              id="btn-confirm-apply-waiver"
            >
              <Check className="w-4 h-4" />
              <span>Authorize & Apply Waiver</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
