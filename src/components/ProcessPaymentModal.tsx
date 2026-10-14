import React, { useState } from "react";
import { BillingInvoice, PaymentMethod } from "../types";
import { recordPayment, getActiveStaff } from "../lib/storage";
import { X, CreditCard, Check, Receipt, AlertCircle } from "lucide-react";

interface ProcessPaymentModalProps {
  invoice: BillingInvoice;
  onClose: () => void;
  onPaymentRecorded: (updated: BillingInvoice) => void;
}

export const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({
  invoice,
  onClose,
  onPaymentRecorded
}) => {
  const staff = getActiveStaff();
  const [amount, setAmount] = useState<number>(invoice.balanceDueNaira);
  const [method, setMethod] = useState<PaymentMethod>("POS / Debit Card");
  const [reference, setReference] = useState("");
  const [cashierNotes, setCashierNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setIsProcessing(true);
    const updated = recordPayment(invoice.id, {
      amountPaid: amount,
      paymentMethod: method,
      transactionReference: reference.trim() || undefined,
      cashierName: staff.name,
      notes: cashierNotes.trim() || undefined
    });

    if (updated) {
      onPaymentRecorded(updated);
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Process Patient Payment & Issue Receipt</h2>
              <p className="text-[11px] text-slate-400 font-mono">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6 space-y-5">
          {/* Patient Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="text-[10px] font-bold uppercase text-slate-500">Patient File</div>
            <div className="font-extrabold text-slate-900 text-sm mt-0.5">{invoice.patientName}</div>
            <div className="text-slate-600 font-mono mt-0.5">
              File: <strong>{invoice.patientFileNumber}</strong>
            </div>
          </div>

          {/* Amount overview */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-xl text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block font-bold uppercase">Total Bill</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5 block">₦{invoice.totalAmountNaira.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-bold uppercase">Paid to Date</span>
              <span className="font-mono font-bold text-emerald-700 mt-0.5 block">₦{invoice.amountPaidNaira.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-bold uppercase">Balance Due</span>
              <span className="font-mono font-extrabold text-amber-700 mt-0.5 block">₦{invoice.balanceDueNaira.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment collection form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Amount Collected (₦)
              </label>
              <input
                type="number"
                min="1"
                max={invoice.balanceDueNaira}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-base font-bold font-mono text-slate-900 focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                <span>Paying remaining balance:</span>
                <button
                  type="button"
                  onClick={() => setAmount(invoice.balanceDueNaira)}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Full Balance (₦{invoice.balanceDueNaira.toLocaleString()})
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Method / Channel
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Cash (NGN)">Cash (NGN - Naira Notes)</option>
                <option value="POS / Debit Card">POS / Debit Card Terminal</option>
                <option value="Bank Transfer / USSD">Bank Direct Transfer / Instant USSD</option>
                <option value="NHIA / HMO Scheme">NHIA / HMO Co-Payment</option>
                <option value="Other">Other Hospital Channel</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Terminal Reference / POS RRN / Transfer Session ID
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. STANBIC-POS-RRN-99214 or GTB-USSD-091"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cashier Remarks / Clearance Notes (Optional)
              </label>
              <input
                type="text"
                value={cashierNotes}
                onChange={(e) => setCashierNotes(e.target.value)}
                placeholder="e.g. Cleared for Pharmacy and Hematology Lab"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
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
              disabled={isProcessing || amount <= 0}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              id="btn-confirm-record-payment"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Issue Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
