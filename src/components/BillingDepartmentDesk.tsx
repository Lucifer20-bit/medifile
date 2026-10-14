import React, { useState, useEffect } from "react";
import { Patient, BillingInvoice, PaymentStatus } from "../types";
import { getInvoices, subscribeInvoices, deleteInvoice } from "../lib/storage";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { ProcessPaymentModal } from "./ProcessPaymentModal";
import { ApplyWaiverModal } from "./ApplyWaiverModal";
import { PrintableReceiptModal } from "./PrintableReceiptModal";
import { 
  CreditCard, 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Printer, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle, 
  FileText,
  Trash2
} from "lucide-react";

interface BillingDepartmentDeskProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const BillingDepartmentDesk: React.FC<BillingDepartmentDeskProps> = ({
  patients,
  onSelectPatient
}) => {
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => getInvoices());
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<BillingInvoice | null>(null);
  const [selectedInvoiceForWaiver, setSelectedInvoiceForWaiver] = useState<BillingInvoice | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<BillingInvoice | null>(null);

  useEffect(() => {
    const unsub = subscribeInvoices((updated) => {
      setInvoices(updated);
    });
    return () => unsub();
  }, []);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      inv.patientName.toLowerCase().includes(term) ||
      inv.patientFileNumber.toLowerCase().includes(term) ||
      inv.invoiceNumber.toLowerCase().includes(term) ||
      (inv.receiptNumber && inv.receiptNumber.toLowerCase().includes(term)) ||
      (inv.transactionReference && inv.transactionReference.toLowerCase().includes(term))
    );
    return matchesStatus && matchesSearch;
  });

  // Calculate KPIs
  const totalRevenuePaid = invoices.reduce((acc, inv) => acc + (inv.amountPaidNaira || 0), 0);
  const totalPendingBalance = invoices.reduce((acc, inv) => acc + (inv.balanceDueNaira || 0), 0);
  const totalWaivers = invoices.reduce((acc, inv) => acc + (inv.discountOrWaiverNaira || 0), 0);
  const totalReceiptsCount = invoices.filter((inv) => inv.receiptNumber).length;
  const pendingInvoicesCount = invoices.filter((inv) => inv.status === "pending").length;

  const handleOpenPatientFile = (patientId: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      onSelectPatient(found);
    }
  };

  const handleDeleteInvoice = (invId: string) => {
    if (confirm("Are you sure you want to cancel and delete this invoice?")) {
      deleteInvoice(invId);
    }
  };

  return (
    <div className="space-y-5" id="billing-cashier-desk">
      {/* 1. Cash Office Financial KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Revenue Collected</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-800 mt-1">
            ₦{totalRevenuePaid.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Cleared via Cash / POS / USSD</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Settlement</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-900 mt-1">
            ₦{totalPendingBalance.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-800/80 mt-0.5">
            {pendingInvoicesCount} patients awaiting clearance
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approved Waivers</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-purple-900 mt-1">
            ₦{totalWaivers.toLocaleString()}
          </div>
          <p className="text-[10px] text-purple-800/80 mt-0.5">Sickle Cell & Indigent Welfare</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Receipts Issued</span>
            <Receipt className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {totalReceiptsCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Official clearance records</p>
        </div>
      </div>

      {/* 2. Action & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Bills ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pending ({invoices.filter((i) => i.status === "pending").length})</span>
          </button>
          <button
            onClick={() => setStatusFilter("paid")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "paid"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid ({invoices.filter((i) => i.status === "paid").length})</span>
          </button>
          <button
            onClick={() => setStatusFilter("waiver")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "waiver"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-purple-800 hover:bg-purple-50"
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Waivers ({invoices.filter((i) => i.status === "waiver").length})</span>
          </button>
        </div>

        {/* Search & New Bill Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search file, patient, receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
            id="btn-create-new-invoice"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Bill</span>
          </button>
        </div>
      </div>

      {/* 3. Invoices List Table */}
      <div className="space-y-3">
        {filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredInvoices.map((inv) => {
              const isPaid = inv.status === "paid";
              const isPending = inv.status === "pending";
              const isWaiver = inv.status === "waiver";
              const isPartial = inv.status === "partially_paid";

              return (
                <div
                  key={inv.id}
                  className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending
                      ? "border-amber-300 bg-amber-50/10 hover:border-amber-400"
                      : isWaiver
                      ? "border-purple-200 bg-purple-50/10 hover:border-purple-300"
                      : isPaid
                      ? "border-slate-200 hover:border-emerald-300"
                      : "border-slate-200"
                  }`}
                >
                  {/* Left info: Patient & Invoice Meta */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
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

                      <span className="text-[11px] text-slate-400">
                        {new Date(inv.createdAt).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2">
                      <button
                        onClick={() => handleOpenPatientFile(inv.patientId)}
                        className="text-base font-extrabold text-slate-900 hover:text-emerald-700 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{inv.patientName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {inv.patientFileNumber}
                      </span>
                      {inv.nhisNumber && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          NHIA: {inv.nhisNumber}
                        </span>
                      )}
                    </div>

                    {/* Breakdown of items badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                      {inv.items.map((item, idx) => (
                        <span
                          key={item.id || idx}
                          className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700"
                        >
                          {item.description} ({item.quantity}x • ₦{item.totalPriceNaira.toLocaleString()})
                        </span>
                      ))}
                    </div>

                    {inv.waiverReason && (
                      <div className="text-[11px] text-purple-800 bg-purple-50 p-2 rounded-lg border border-purple-200 font-medium">
                        <strong>Waiver Scheme:</strong> {inv.waiverReason}
                        {inv.waiverApprovedBy && <span> (Approved by: {inv.waiverApprovedBy})</span>}
                      </div>
                    )}
                  </div>

                  {/* Right: Amounts & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right space-y-0.5">
                      <div className="text-xs text-slate-500">
                        Total: <span className="font-mono font-bold text-slate-900">₦{inv.totalAmountNaira.toLocaleString()}</span>
                      </div>
                      {inv.discountOrWaiverNaira > 0 && (
                        <div className="text-xs text-purple-700">
                          Waived: <span className="font-mono font-bold">- ₦{inv.discountOrWaiverNaira.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="text-sm font-extrabold text-slate-900">
                        Paid: <span className="font-mono text-emerald-700">₦{inv.amountPaidNaira.toLocaleString()}</span>
                      </div>
                      {inv.balanceDueNaira > 0 && (
                        <div className="text-xs font-bold text-amber-700">
                          Balance: <span className="font-mono">₦{inv.balanceDueNaira.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(isPending || isPartial) && (
                        <>
                          <button
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            id={`btn-collect-pay-${inv.id}`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Collect Payment</span>
                          </button>
                          <button
                            onClick={() => setSelectedInvoiceForWaiver(inv)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            id={`btn-apply-waiver-${inv.id}`}
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
                          id={`btn-print-receipt-${inv.id}`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenPatientFile(inv.patientId)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Open full patient chart"
                      >
                        File
                      </button>

                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete / Cancel Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No invoices found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No billing records match your current search or status filter."
                : "No hospital billing records created yet. Issue a new bill to track consultation fees, labs, and medications."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue First Hospital Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateInvoiceModal
          patientsList={patients}
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
