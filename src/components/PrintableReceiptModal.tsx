import React, { useRef } from "react";
import { BillingInvoice } from "../types";
import { getHospitalConfig } from "../lib/storage";
import { X, Printer, CheckCircle2, ShieldCheck, FileText, QrCode } from "lucide-react";

interface PrintableReceiptModalProps {
  invoice: BillingInvoice;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  invoice,
  onClose
}) => {
  const config = getHospitalConfig();
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isWaiver = invoice.status === "waiver" || invoice.discountOrWaiverNaira > 0;
  const isPaid = invoice.status === "paid" || invoice.balanceDueNaira === 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:border-none print:max-w-none">
        {/* Modal Top Action Bar (hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">Official Hospital Receipt Preview</h2>
              <p className="text-[11px] text-slate-400">
                Receipt #{invoice.receiptNumber || invoice.invoiceNumber} • Thermal & A4 Print Ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              id="btn-print-receipt-dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6 text-slate-800 print:p-6 print:m-0" id="official-printed-receipt">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Federal Republic of Nigeria • Ministry of Health
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
              {config.hospitalName}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              {config.lga} LGA, {config.state} State • Health Information & Finance Directorate
            </p>
            <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full">
              Official Cash Office Receipt & Clearance
            </div>
          </div>

          {/* Receipt & Patient Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Patient Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{invoice.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Medical File Number</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 border border-slate-300 rounded inline-block">
                  {invoice.patientFileNumber}
                </span>
              </div>
              {invoice.patientPhone && (
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Phone Number</span>
                  <span className="font-medium text-slate-800">{invoice.patientPhone}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-right">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Receipt Number</span>
                <span className="font-mono font-extrabold text-emerald-800 text-sm">
                  {invoice.receiptNumber || "PENDING"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Invoice Reference</span>
                <span className="font-mono text-slate-700">{invoice.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Date & Timestamp</span>
                <span className="font-medium text-slate-800">
                  {new Date(invoice.paidAt || invoice.createdAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Itemized Clinical Services & Charges
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600">
                  <th className="py-2 text-left font-bold uppercase text-[10px]">#</th>
                  <th className="py-2 text-left font-bold uppercase text-[10px]">Category</th>
                  <th className="py-2 text-left font-bold uppercase text-[10px]">Description</th>
                  <th className="py-2 text-center font-bold uppercase text-[10px]">Qty</th>
                  <th className="py-2 text-right font-bold uppercase text-[10px]">Unit (₦)</th>
                  <th className="py-2 text-right font-bold uppercase text-[10px]">Total (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="py-2">
                    <td className="py-2 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.category === "consultation" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        item.category === "laboratory" ? "bg-purple-50 text-purple-800 border border-purple-200" :
                        item.category === "medication" ? "bg-teal-50 text-teal-800 border border-teal-200" :
                        item.category === "procedure" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2 font-medium text-slate-900">{item.description}</td>
                    <td className="py-2 text-center text-slate-700 font-mono">{item.quantity}</td>
                    <td className="py-2 text-right text-slate-700 font-mono">₦{item.unitPriceNaira.toLocaleString()}</td>
                    <td className="py-2 text-right font-bold text-slate-900 font-mono">₦{item.totalPriceNaira.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="border-t-2 border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs space-y-2 max-w-sm">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Payment Classification</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  Method: {invoice.paymentMethod || "Pending Cashier"}
                </div>
                {invoice.transactionReference && (
                  <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
                    Ref: {invoice.transactionReference}
                  </div>
                )}
                {invoice.nhisNumber && (
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    NHIA Coverage: {invoice.nhisNumber} ({invoice.hmoProvider || "Standard"})
                  </div>
                )}
              </div>

              {invoice.waiverReason && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-purple-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>Hospital Welfare Subsidy / Clinical Waiver</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">{invoice.waiverReason}</p>
                  {invoice.waiverApprovedBy && (
                    <div className="text-[10px] font-semibold mt-1 text-purple-800">
                      Approved By: {invoice.waiverApprovedBy}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Incurred:</span>
                <span className="font-mono font-semibold">₦{invoice.subtotalNaira.toLocaleString()}</span>
              </div>

              {invoice.discountOrWaiverNaira > 0 && (
                <div className="flex justify-between text-purple-700 font-medium">
                  <span>Waiver / Subsidy:</span>
                  <span className="font-mono font-bold">- ₦{invoice.discountOrWaiverNaira.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-300 pt-1">
                <span>Net Payable:</span>
                <span className="font-mono">₦{invoice.totalAmountNaira.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-emerald-800 font-extrabold border-t border-slate-200 pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-700">₦{invoice.amountPaidNaira.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-1">
                <span>Balance Due:</span>
                <span className={`font-mono ${invoice.balanceDueNaira > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  ₦{invoice.balanceDueNaira.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stamp & Official Clearance */}
          <div className="border-t border-dashed border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Stamp visual */}
            <div className="flex items-center gap-3">
              {isPaid || invoice.status === "waiver" ? (
                <div className="border-2 border-emerald-600 rounded-xl p-2.5 bg-emerald-50/60 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      OFFICIALLY CLEARED & PAID
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">
                      HOSPITAL CASH OFFICE • STAMP VALID
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Certified for Lab Investigation & Pharmacy Dispense
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-amber-500 rounded-xl p-2.5 bg-amber-50/60 text-amber-900 flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                    PAYMENT PENDING
                  </div>
                  <div className="text-[9px] text-slate-600">
                    Awaiting cashier settlement before dispensary release
                  </div>
                </div>
              )}
            </div>

            {/* Cashier & Verification */}
            <div className="text-right text-xs space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Authorized Cashier</div>
              <div className="font-bold text-slate-900">{invoice.cashierName}</div>
              <div className="text-[10px] text-slate-400">
                {config.currentStation} • Shift #{invoice.cashierShift || "Day"}
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-3">
            This document is an authentic computerized receipt from the MediFile NG Hospital Information System.
            Retain this receipt for clinical filing, pharmacy dispense clearance, and medical reimbursement.
          </div>
        </div>
      </div>
    </div>
  );
};
