import React, { useState } from "react";
import { Patient, BillingInvoice, BillItem, BillItemCategory, PaymentMethod } from "../types";
import { STANDARD_HOSPITAL_TARIFFS } from "../data/initialInvoices";
import { generateInvoiceNumber, generateReceiptNumber, upsertInvoice, getActiveStaff } from "../lib/storage";
import { X, Plus, Trash2, Receipt, ShieldCheck, CreditCard, Sparkles, Check, AlertCircle } from "lucide-react";

interface CreateInvoiceModalProps {
  patient?: Patient;
  patientsList?: Patient[];
  onClose: () => void;
  onInvoiceCreated: (invoice: BillingInvoice) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  patient: initialPatient,
  patientsList = [],
  onClose,
  onInvoiceCreated
}) => {
  const staff = getActiveStaff();
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(initialPatient);

  // Line items
  const [items, setItems] = useState<BillItem[]>(() => {
    if (!initialPatient) return [];
    const initialItems: BillItem[] = [];

    // Auto-pull recent consultations if any
    if (initialPatient.consultations && initialPatient.consultations.length > 0) {
      const latestCon = initialPatient.consultations[0];
      initialItems.push({
        id: `itm-${Date.now()}-1`,
        category: "consultation",
        description: `${latestCon.department} Doctor Consultation (${latestCon.doctorName})`,
        quantity: 1,
        unitPriceNaira: latestCon.department.includes("Specialist") ? 5000 : 2500,
        totalPriceNaira: latestCon.department.includes("Specialist") ? 5000 : 2500,
        department: latestCon.department,
        code: "CON-GOPD"
      });
    }

    // Auto-pull ordered labs
    if (initialPatient.labOrders && initialPatient.labOrders.length > 0) {
      initialPatient.labOrders.forEach((lab, idx) => {
        let price = 1500;
        if (lab.testName.toLowerCase().includes("pcv")) price = 1200;
        else if (lab.testName.toLowerCase().includes("creatinine") || lab.testName.toLowerCase().includes("electrolyte")) price = 4500;
        else if (lab.testName.toLowerCase().includes("widal")) price = 2200;
        else if (lab.testName.toLowerCase().includes("fbc") || lab.testName.toLowerCase().includes("count")) price = 3000;

        initialItems.push({
          id: `itm-${Date.now()}-lab-${idx}`,
          category: "laboratory",
          description: lab.testName,
          quantity: 1,
          unitPriceNaira: price,
          totalPriceNaira: price,
          department: "Laboratory",
          linkedLabTestId: lab.id
        });
      });
    }

    // Auto-pull prescriptions
    if (initialPatient.prescriptions && initialPatient.prescriptions.length > 0) {
      initialPatient.prescriptions.forEach((rx, idx) => {
        let price = 1500;
        if (rx.drugName.toLowerCase().includes("coartem") || rx.drugName.toLowerCase().includes("artemether")) price = 2800;
        else if (rx.drugName.toLowerCase().includes("paracetamol")) price = 500;
        else if (rx.drugName.toLowerCase().includes("amlodipine")) price = 2200;
        else if (rx.drugName.toLowerCase().includes("lisinopril")) price = 1800;
        else if (rx.drugName.toLowerCase().includes("pregnacare")) price = 6500;
        else if (rx.drugName.toLowerCase().includes("fansidar")) price = 1200;

        initialItems.push({
          id: `itm-${Date.now()}-rx-${idx}`,
          category: "medication",
          description: rx.drugName,
          quantity: 1,
          unitPriceNaira: price,
          totalPriceNaira: price,
          department: "Pharmacy",
          linkedPrescriptionId: rx.id
        });
      });
    }

    return initialItems;
  });

  // New item draft
  const [selectedTariffCode, setSelectedTariffCode] = useState("");
  const [customCategory, setCustomCategory] = useState<BillItemCategory>("consultation");
  const [customDesc, setCustomDesc] = useState("");
  const [customPrice, setCustomPrice] = useState(2500);
  const [customQty, setCustomQty] = useState(1);

  // Billing settlement mode
  const [settlementMode, setSettlementMode] = useState<"pending" | "direct_payment" | "waiver">("pending");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash (NGN)");
  const [transactionRef, setTransactionRef] = useState("");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Waiver fields
  const [waiverAmount, setWaiverAmount] = useState<number>(0);
  const [waiverReason, setWaiverReason] = useState(
    initialPatient?.genotype === "SS"
      ? "Sickle Cell Warrior Emergency Care Protocol"
      : "Medical Social Welfare Indigent Support"
  );
  const [waiverApprovedBy, setWaiverApprovedBy] = useState("Dr. Babatunde Adeyemi (Chief Medical Director)");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  // Totals
  const subtotal = items.reduce((acc, itm) => acc + itm.totalPriceNaira, 0);
  const effectiveWaiver = settlementMode === "waiver" ? (waiverAmount > 0 ? waiverAmount : subtotal) : 0;
  const netPayable = Math.max(0, subtotal - effectiveWaiver);

  const handleAddTariffItem = () => {
    if (!selectedTariffCode) return;
    const tariff = STANDARD_HOSPITAL_TARIFFS.find((t) => t.code === selectedTariffCode);
    if (!tariff) return;

    const newItem: BillItem = {
      id: `itm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: tariff.category,
      description: tariff.name,
      quantity: 1,
      unitPriceNaira: tariff.defaultPriceNaira,
      totalPriceNaira: tariff.defaultPriceNaira,
      department: tariff.department,
      code: tariff.code
    };

    setItems([...items, newItem]);
    setSelectedTariffCode("");
  };

  const handleAddCustomItem = () => {
    if (!customDesc.trim()) return;
    const newItem: BillItem = {
      id: `itm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: customCategory,
      description: customDesc.trim(),
      quantity: Math.max(1, customQty),
      unitPriceNaira: Math.max(0, customPrice),
      totalPriceNaira: Math.max(1, customQty) * Math.max(0, customPrice),
      department: customCategory === "medication" ? "Pharmacy" : customCategory === "laboratory" ? "Laboratory" : "Hospital"
    };

    setItems([...items, newItem]);
    setCustomDesc("");
    setCustomQty(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItemQty = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setItems(
      items.map((i) =>
        i.id === id
          ? { ...i, quantity: newQty, totalPriceNaira: newQty * i.unitPriceNaira }
          : i
      )
    );
  };

  const handleUpdateItemPrice = (id: string, newPrice: number) => {
    if (newPrice < 0) return;
    setItems(
      items.map((i) =>
        i.id === id
          ? { ...i, unitPriceNaira: newPrice, totalPriceNaira: i.quantity * newPrice }
          : i
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Please select a patient file.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one billable item to the invoice.");
      return;
    }

    const invoiceNum = generateInvoiceNumber();
    let status: BillingInvoice["status"] = "pending";
    let finalPaid = 0;
    let finalBalance = netPayable;
    let receiptNum: string | undefined = undefined;

    if (settlementMode === "direct_payment") {
      finalPaid = paidAmount > 0 ? paidAmount : netPayable;
      finalBalance = Math.max(0, netPayable - finalPaid);
      status = finalBalance <= 0 ? "paid" : "partially_paid";
      receiptNum = generateReceiptNumber();
    } else if (settlementMode === "waiver") {
      finalPaid = 0;
      finalBalance = 0;
      status = "waiver";
      receiptNum = `WVR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newInvoice: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      receiptNumber: receiptNum,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.lastName}, ${selectedPatient.firstName} ${selectedPatient.middleName || ""}`.trim(),
      patientFileNumber: selectedPatient.fileNumber,
      patientPhone: selectedPatient.phone,
      nhisNumber: selectedPatient.nhisNumber,
      hmoProvider: selectedPatient.hmoProvider,
      items,
      subtotalNaira: subtotal,
      discountOrWaiverNaira: effectiveWaiver,
      waiverReason: settlementMode === "waiver" ? waiverReason : undefined,
      waiverApprovedBy: settlementMode === "waiver" ? waiverApprovedBy : undefined,
      totalAmountNaira: netPayable,
      amountPaidNaira: finalPaid,
      balanceDueNaira: finalBalance,
      status,
      paymentMethod: settlementMode === "direct_payment" ? paymentMethod : settlementMode === "waiver" ? "Hospital Indigent Waiver" : undefined,
      transactionReference: transactionRef.trim() || undefined,
      cashierName: staff.name,
      cashierShift: "Current Shift",
      createdAt: new Date().toISOString(),
      paidAt: (settlementMode === "direct_payment" || settlementMode === "waiver") ? new Date().toISOString() : undefined,
      notes: invoiceNotes.trim() || undefined
    };

    upsertInvoice(newInvoice);
    onInvoiceCreated(newInvoice);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Issue Hospital Bill & Invoice</h2>
              <p className="text-xs text-slate-400">
                Track consultation fees, laboratory investigations, and pharmacy medication costs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* 1. Patient Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Patient Information & Medical File
            </label>
            {initialPatient ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-extrabold text-slate-900 text-base">
                    {initialPatient.lastName}, {initialPatient.firstName} {initialPatient.middleName || ""}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>File: <strong className="text-slate-800 font-mono">{initialPatient.fileNumber}</strong></span>
                    <span>•</span>
                    <span>{initialPatient.gender}, {initialPatient.ageYears} yrs</span>
                    <span>•</span>
                    <span>Genotype: <strong className={initialPatient.genotype === "SS" ? "text-rose-600" : "text-slate-800"}>{initialPatient.genotype}</strong></span>
                  </div>
                </div>
                {initialPatient.nhisNumber && (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold self-start">
                    NHIA / {initialPatient.hmoProvider || "Insured"}
                  </span>
                )}
              </div>
            ) : (
              <select
                value={selectedPatient?.id || ""}
                onChange={(e) => {
                  const p = patientsList.find((item) => item.id === e.target.value);
                  setSelectedPatient(p);
                }}
                required
                className="w-full text-xs font-medium p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Choose Patient File --</option>
                {patientsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lastName}, {p.firstName} • {p.fileNumber} ({p.currentDepartment.toUpperCase()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Bill Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Billable Items & Clinical Tariffs
                </h3>
                <p className="text-[11px] text-slate-500">
                  Consultation fees, laboratory tests, and prescribed drugs
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {items.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 text-left font-bold uppercase text-[10px]">Category</th>
                      <th className="py-2.5 px-3 text-left font-bold uppercase text-[10px]">Service / Drug</th>
                      <th className="py-2.5 px-3 text-center font-bold uppercase text-[10px] w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right font-bold uppercase text-[10px] w-24">Unit (₦)</th>
                      <th className="py-2.5 px-3 text-right font-bold uppercase text-[10px] w-24">Total (₦)</th>
                      <th className="py-2.5 px-2 text-center font-bold uppercase text-[10px] w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.category === "consultation" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            item.category === "laboratory" ? "bg-purple-50 text-purple-800 border border-purple-200" :
                            item.category === "medication" ? "bg-teal-50 text-teal-800 border border-teal-200" :
                            "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {item.description}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQty(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center p-1 border border-slate-300 rounded font-mono text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={item.unitPriceNaira}
                            onChange={(e) => handleUpdateItemPrice(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 text-right p-1 border border-slate-300 rounded font-mono text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ₦{item.totalPriceNaira.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">No items on this bill yet.</p>
                <p className="text-[11px] text-slate-400">Pick from standard tariffs below or enter a custom service charge.</p>
              </div>
            )}

            {/* Tariff Preset Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <div className="sm:col-span-8">
                <select
                  value={selectedTariffCode}
                  onChange={(e) => setSelectedTariffCode(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Quick Add from Standard Hospital Tariffs --</option>
                  <optgroup label="Doctor Consultations">
                    {STANDARD_HOSPITAL_TARIFFS.filter((t) => t.category === "consultation").map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name} (₦{t.defaultPriceNaira.toLocaleString()})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Laboratory Investigations">
                    {STANDARD_HOSPITAL_TARIFFS.filter((t) => t.category === "laboratory").map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name} (₦{t.defaultPriceNaira.toLocaleString()})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Common Medications">
                    {STANDARD_HOSPITAL_TARIFFS.filter((t) => t.category === "medication").map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name} (₦{t.defaultPriceNaira.toLocaleString()})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Procedures & Registration">
                    {STANDARD_HOSPITAL_TARIFFS.filter((t) => t.category === "procedure" || t.category === "registration" || t.category === "bed_admission").map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name} (₦{t.defaultPriceNaira.toLocaleString()})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={handleAddTariffItem}
                  disabled={!selectedTariffCode}
                  className="w-full flex items-center justify-center gap-1.5 p-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tariff Item</span>
                </button>
              </div>
            </div>

            {/* Custom Item Adder */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Or Add Custom Service / Item
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-3">
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as BillItemCategory)}
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md font-medium"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="medication">Medication</option>
                    <option value="procedure">Procedure</option>
                    <option value="registration">Registration</option>
                    <option value="bed_admission">Bed / Ward</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Description (e.g. ECG scan, Dressing)"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={customQty}
                    onChange={(e) => setCustomQty(parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                    placeholder="Price ₦"
                    className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    disabled={!customDesc.trim()}
                    className="w-full h-full min-h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
                    title="Add Custom Item"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment / Settlement Options */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment & Clearance Mode
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSettlementMode("pending");
                    setWaiverAmount(0);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    settlementMode === "pending"
                      ? "bg-amber-500 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Pending Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettlementMode("direct_payment");
                    setWaiverAmount(0);
                    setPaidAmount(subtotal);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    settlementMode === "direct_payment"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Immediate Payment (Receipt)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettlementMode("waiver");
                    setWaiverAmount(subtotal);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    settlementMode === "waiver"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Hospital Fee Waiver
                </button>
              </div>
            </div>

            {/* Direct Payment sub-fields */}
            {settlementMode === "direct_payment" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <div>
                  <label className="text-[11px] font-bold text-emerald-900 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg font-medium"
                  >
                    <option value="Cash (NGN)">Cash (NGN)</option>
                    <option value="POS / Debit Card">POS / Debit Card</option>
                    <option value="Bank Transfer / USSD">Bank Transfer / USSD</option>
                    <option value="NHIA / HMO Scheme">NHIA / HMO Scheme</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-900 block mb-1">Amount Collected (₦)</label>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={paidAmount || subtotal}
                    onChange={(e) => setPaidAmount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-900 block mb-1">POS RRN / Transfer Ref (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. STANBIC-RRN-8921"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            )}

            {/* Waiver sub-fields */}
            {settlementMode === "waiver" && (
              <div className="space-y-3 p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Clinical Indigent / Emergency Health Waiver Form</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-purple-900 block mb-1">Waiver / Subsidy Amount (₦)</label>
                    <input
                      type="number"
                      min="0"
                      max={subtotal}
                      value={waiverAmount || subtotal}
                      onChange={(e) => setWaiverAmount(parseInt(e.target.value) || 0)}
                      className="w-full text-xs p-2 bg-white border border-purple-300 rounded-lg font-mono font-bold"
                    />
                    <span className="text-[10px] text-purple-700 mt-0.5 block">
                      {waiverAmount >= subtotal ? "100% Full Waiver" : `Partial Waiver (Remaining: ₦${(subtotal - waiverAmount).toLocaleString()})`}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-purple-900 block mb-1">Approving Hospital Authority</label>
                    <input
                      type="text"
                      value={waiverApprovedBy}
                      onChange={(e) => setWaiverApprovedBy(e.target.value)}
                      required
                      className="w-full text-xs p-2 bg-white border border-purple-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-purple-900 block mb-1">Clinical Justification / Official Scheme</label>
                  <input
                    type="text"
                    value={waiverReason}
                    onChange={(e) => setWaiverReason(e.target.value)}
                    placeholder="e.g. Sickle cell emergency crisis subsidy, Emergency life-saving protocol, Indigent fund"
                    required
                    className="w-full text-xs p-2 bg-white border border-purple-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Pending notice */}
            {settlementMode === "pending" && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Bill will be generated as <strong>Pending Payment</strong>. Patient or guardian can proceed to the Cash Office or make POS transfer before receiving pharmacy drugs or laboratory clearance.
                </span>
              </div>
            )}
          </div>

          {/* 4. Financial Summary Breakdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-xl">
            <div className="text-xs space-y-1">
              <div className="text-slate-400">
                Gross Subtotal: <strong className="text-white font-mono">₦{subtotal.toLocaleString()}</strong>
              </div>
              {effectiveWaiver > 0 && (
                <div className="text-purple-300">
                  Waiver Concession: <strong className="font-mono">- ₦{effectiveWaiver.toLocaleString()}</strong>
                </div>
              )}
              <div className="text-emerald-400 font-bold">
                Net Payable: <span className="font-mono text-base">₦{netPayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={items.length === 0 || !selectedPatient}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                id="btn-submit-generate-invoice"
              >
                <Check className="w-4 h-4" />
                <span>
                  {settlementMode === "direct_payment"
                    ? "Generate Bill & Issue Receipt"
                    : settlementMode === "waiver"
                    ? "Authorize & Issue Waiver"
                    : "Generate Pending Bill"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
