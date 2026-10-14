import React, { useState, useEffect } from "react";
import { Patient, BillingInvoice } from "../types";
import { getInvoicesByPatientId, subscribeInvoices, deleteInvoice } from "../lib/storage";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { ProcessPaymentModal } from "./ProcessPaymentModal";
import { ApplyWaiverModal } from "./ApplyWaiverModal";
import { PrintableReceiptModal } from "./PrintableReceiptModal";
import { 
  Receipt, 
  Plus, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Trash2, 
  AlertCircle,
  TrendingUp
} from "lucide-react";

interface PatientBillingSectionProps {
  patient: Patient;
}

export const PatientBillingSection: React.FC<PatientBillingSectionProps> = ({ patient }) => {
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => getInvoicesByPatientId(patient.id));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<BillingInvoice | null>(null);
  const [selectedInvoiceForWaiver, setSelectedInvoiceForWaiver] = useState<BillingInvoice | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<BillingInvoice | null>(null);

  useEffect(() => {
    const unsub = subscribeInvoices(() => {
      setInvoices(getInvoicesByPatientId(patient.id));
    });
    return () => unsub();
  }, [patient.id]);

  const totalIncurred = invoices.reduce((acc, i) => acc + (i.totalAmountNaira || 0), 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (i.amountPaidNaira || 0), 0);
  const totalBalance = invoices.reduce((acc, i) => acc + (i.balanceDueNaira || 0), 0);
  const totalWaived = invoices.reduce((acc, i) => acc + (i.discountOrWaiverNaira || 0), 0);

  const hasPendingBills = invoices.some((i) => i.status === "pending" || i.status === "partially_paid");

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to cancel this bill?")) {
      deleteInvoice(id);
    }
  };

  return (
    <div className="space-y-5" id="patient-billing-section">
      {/* Financial Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Hospital Bills</span>
          <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
            ₦{totalIncurred.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">{invoices.length} invoices generated</span>
        </div>

        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
          <span className="text-[10px] font-bold uppercase text-emerald-800 block">Total Paid to Date</span>
          <span className="text-base font-extrabold text-emerald-800 font-mono mt-0.5 block">
            ₦{totalPaid.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700">Official cash & POS receipts</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${totalBalance > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
          <span className={`text-[10px] font-bold uppercase block ${totalBalance > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
            Balance Due
          </span>
          <span className={`text-base font-extrabold font-mono mt-0.5 block ${totalBalance > 0 ? 'text-amber-900' : 'text-slate-700'}`}>
            ₦{totalBalance.toLocaleString()}
          </span>
          <span className={`text-[10px] ${totalBalance > 0 ? 'text-amber-800' : 'text-slate-400'}`}>
            {totalBalance > 0 ? "Requires cashier clearance" : "All bills cleared"}
          </span>
        </div>

        <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200">
          <span className="text-[10px] font-bold uppercase text-purple-800 block">Waivers / Subsidies</span>
          <span className="text-base font-extrabold text-purple-900 font-mono mt-0.5 block">
            ₦{totalWaived.toLocaleString()}
          </span>
          <span className="text-[10px] text-purple-700">Indigent welfare & subsidies</span>
        </div>
      </div>

      {/* Warning banner if patient has pending bills */}
      {hasPendingBills && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This patient file has <strong>pending uncleared fees</strong>. Laboratory investigations and pharmacy dispensing may require payment clearance.
            </span>
          </div>
          <button
            onClick={() => {
              const pending = invoices.find((i) => i.status === "pending" || i.status === "partially_paid");
              if (pending) setSelectedInvoiceForPayment(pending);
            }}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
          >
            Clear Payment
          </button>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-slate-500" />
          <span>Patient Invoices & Payment Ledger</span>
        </h3>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
          id="btn-patient-issue-bill"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate Bill</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {invoices.length > 0 ? (
          invoices.map((inv) => {
            const isPaid = inv.status === "paid";
            const isPending = inv.status === "pending";
            const isWaiver = inv.status === "waiver";
            const isPartial = inv.status === "partially_paid";

            return (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-slate-200 p-4 transition-all shadow-2xs space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {inv.invoiceNumber}
                    </span>
                    {inv.receiptNumber && (
                      <span className="font-mono text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {inv.receiptNumber}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isPending
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : isWaiver
                          ? "bg-purple-100 text-purple-800 border border-purple-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}
                    >
                      {isPaid && <CheckCircle2 className="w-3 h-3" />}
                      {isPending && <Clock className="w-3 h-3" />}
                      {isWaiver && <ShieldCheck className="w-3 h-3" />}
                      <span>{inv.status.replace("_", " ")}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    {new Date(inv.createdAt).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </div>
                </div>

                {/* Items breakdown table */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-200 text-[10px] uppercase">
                        <th className="text-left pb-1">Service / Drug Item</th>
                        <th className="text-center pb-1 w-12">Qty</th>
                        <th className="text-right pb-1 w-20">Unit</th>
                        <th className="text-right pb-1 w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inv.items.map((item) => (
                        <tr key={item.id} className="text-slate-800">
                          <td className="py-1">
                            <span className="font-medium">{item.description}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 uppercase">({item.category})</span>
                          </td>
                          <td className="py-1 text-center font-mono">{item.quantity}</td>
                          <td className="py-1 text-right font-mono text-slate-600">₦{item.unitPriceNaira.toLocaleString()}</td>
                          <td className="py-1 text-right font-mono font-bold">₦{item.totalPriceNaira.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Waiver reason if any */}
                {inv.waiverReason && (
                  <div className="text-xs text-purple-900 bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <span className="font-bold">Hospital Fee Waiver Granted:</span> {inv.waiverReason}
                    {inv.waiverApprovedBy && <span className="block text-[11px] text-purple-700 mt-0.5">Approved by: {inv.waiverApprovedBy}</span>}
                  </div>
                )}

                {/* Financial footer & actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs flex items-center gap-3">
                    <div>
                      Subtotal: <strong className="font-mono text-slate-800">₦{inv.subtotalNaira.toLocaleString()}</strong>
                    </div>
                    {inv.discountOrWaiverNaira > 0 && (
                      <div className="text-purple-700">
                        Waiver: <strong className="font-mono">-₦{inv.discountOrWaiverNaira.toLocaleString()}</strong>
                      </div>
                    )}
                    <div className="text-emerald-800 font-bold">
                      Paid: <strong className="font-mono">₦{inv.amountPaidNaira.toLocaleString()}</strong>
                    </div>
                    {inv.balanceDueNaira > 0 && (
                      <div className="text-amber-800 font-bold">
                        Balance: <strong className="font-mono">₦{inv.balanceDueNaira.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(isPending || isPartial) && (
                      <>
                        <button
                          onClick={() => setSelectedInvoiceForPayment(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay & Receipt</span>
                        </button>
                        <button
                          onClick={() => setSelectedInvoiceForWaiver(inv)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Waiver</span>
                        </button>
                      </>
                    )}

                    {(isPaid || isWaiver || inv.receiptNumber) && (
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Cancel invoice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-4">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">No invoices for this patient</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Generate a bill for consultation, lab investigations, or pharmacy drugs.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Patient Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateInvoiceModal
          patient={patient}
          onClose={() => setIsCreateModalOpen(false)}
          onInvoiceCreated={(newInv) => {
            setIsCreateModalOpen(false);
            if (newInv.status === "paid" || newInv.status === "waiver") {
              setSelectedInvoiceForPrint(newInv);
            }
          }}
        />
      )}

      {selectedInvoiceForPayment && (
        <ProcessPaymentModal
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onPaymentRecorded={(updated) => {
            setSelectedInvoiceForPayment(null);
            setSelectedInvoiceForPrint(updated);
          }}
        />
      )}

      {selectedInvoiceForWaiver && (
        <ApplyWaiverModal
          invoice={selectedInvoiceForWaiver}
          onClose={() => setSelectedInvoiceForWaiver(null)}
          onWaiverApplied={(updated) => {
            setSelectedInvoiceForWaiver(null);
            setSelectedInvoiceForPrint(updated);
          }}
        />
      )}

      {selectedInvoiceForPrint && (
        <PrintableReceiptModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
