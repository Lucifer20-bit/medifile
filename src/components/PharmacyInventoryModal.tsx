import React, { useState } from "react";
import { 
  X, 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight, 
  Filter, 
  Sparkles,
  Layers,
  TrendingDown
} from "lucide-react";
import { PharmacyItem } from "../types";
import { 
  getPharmacyInventory, 
  upsertPharmacyItem, 
  restockPharmacyItem, 
  getLowStockAlerts, 
  getPatients 
} from "../lib/storage";

interface PharmacyInventoryModalProps {
  onClose: () => void;
  onInventoryUpdated?: () => void;
}

export const PharmacyInventoryModal: React.FC<PharmacyInventoryModalProps> = ({
  onClose,
  onInventoryUpdated
}) => {
  const [inventory, setInventory] = useState<PharmacyItem[]>(getPharmacyInventory());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New medication modal / drawer
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [restockModalItem, setRestockModalItem] = useState<PharmacyItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(50);
  const [restockBatch, setRestockBatch] = useState("");
  const [restockExpiry, setRestockExpiry] = useState("");

  // New item form state
  const [formData, setFormData] = useState<Omit<PharmacyItem, "id" | "lastRestockedAt">>({
    drugName: "",
    genericName: "",
    category: "Antimalarial",
    dosageForm: "Tablet",
    strength: "",
    stockQuantity: 100,
    unit: "tablets",
    reorderThreshold: 30,
    batchNumber: "EMZ-2026-",
    expiryDate: "2027-12-31",
    unitPriceNaira: 1500,
    supplier: "Emzor Pharmaceuticals Lagos",
    notes: ""
  });

  const lowStockItems = inventory.filter((item) => item.stockQuantity <= item.reorderThreshold);

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = 
      item.drugName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesLowStock = !showLowStockOnly || item.stockQuantity <= item.reorderThreshold;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PharmacyItem = {
      ...formData,
      id: `med-${Date.now()}`,
      lastRestockedAt: new Date().toISOString()
    };
    upsertPharmacyItem(newItem);
    setInventory(getPharmacyInventory());
    setIsAddingNew(false);
    setStatusMessage(`Added ${newItem.drugName} to pharmacy catalog.`);
    if (onInventoryUpdated) onInventoryUpdated();
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    restockPharmacyItem(
      restockModalItem.id,
      restockQuantity,
      restockBatch || undefined,
      restockExpiry || undefined
    );

    setInventory(getPharmacyInventory());
    setRestockModalItem(null);
    setStatusMessage(`Restocked ${restockQuantity} ${restockModalItem.unit} of ${restockModalItem.drugName}.`);
    if (onInventoryUpdated) onInventoryUpdated();
  };

  // Recent dispensed audit stats
  const patients = getPatients();
  const allPrescriptions = patients.flatMap((p) => 
    p.prescriptions.map((rx) => ({ ...rx, patientName: `${p.lastName}, ${p.firstName}`, fileNo: p.fileNumber }))
  );
  const dispensedList = allPrescriptions.filter((rx) => rx.dispensed).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden space-y-4">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Hospital Pharmacy Inventory Management
                </h2>
                {lowStockItems.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {lowStockItems.length} Low Stock
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Track pharmaceutical stock levels, batch numbers, reorder thresholds, and dispensed records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Incoming Drug</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Low Stock Warning Banner */}
          {lowStockItems.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-rose-900">
                <span className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Urgent Pharmacy Reorder Threshold Alerts ({lowStockItems.length} items below minimum)
                </span>
                <button
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className="text-xs font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
                >
                  {showLowStockOnly ? "Show All Stock" : "Filter Low Stock Only"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white px-3 py-1.5 rounded-lg border border-rose-300 text-rose-900 text-xs flex items-center gap-2 shadow-2xs"
                  >
                    <span className="font-bold">{item.drugName}</span>
                    <span className="bg-rose-100 text-rose-800 font-mono font-bold px-1.5 py-0.2 rounded text-[11px]">
                      {item.stockQuantity} / {item.reorderThreshold} {item.unit}
                    </span>
                    <button
                      onClick={() => {
                        setRestockModalItem(item);
                        setRestockQuantity(50);
                        setRestockBatch(item.batchNumber);
                        setRestockExpiry(item.expiryDate);
                      }}
                      className="text-emerald-700 font-bold hover:underline ml-1"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search, Filter and Statistics Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by drug name, active ingredient, batch number, or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 text-xs bg-white border border-slate-300 rounded-lg font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Antimalarial">Antimalarial</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Analgesic / NSAID">Analgesic / NSAID</option>
                <option value="Antihypertensive">Antihypertensive</option>
                <option value="Antidiabetic">Antidiabetic</option>
                <option value="Vitamins / Supplements">Vitamins / Supplements</option>
                <option value="IV Fluids & Injectables">IV Fluids & Injectables</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-3 py-2 rounded-lg font-semibold border transition-colors cursor-pointer ${
                  showLowStockOnly
                    ? "bg-rose-600 text-white border-rose-700"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {showLowStockOnly ? "Showing Low Stock" : "All Stock"}
              </button>
            </div>
          </div>

          {/* Main Inventory Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Drug & Formulation</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Stock Level</th>
                  <th className="p-3">Batch & Expiry</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                      No medications found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.stockQuantity <= item.reorderThreshold;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{item.drugName}</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.genericName} • {item.dosageForm} ({item.strength})
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                              isLow ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {item.stockQuantity} {item.unit}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              Reorder at: {item.reorderThreshold}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-semibold text-slate-800 block text-[11px]">
                            {item.batchNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Exp: {item.expiryDate}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          ₦{item.unitPriceNaira.toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-600 text-[11px] max-w-[140px] truncate">
                          {item.supplier}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQuantity(50);
                              setRestockBatch(item.batchNumber);
                              setRestockExpiry(item.expiryDate);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Dispensing Audit Log Preview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              Recent Patient Prescriptions Dispensed from Inventory
            </h4>
            {dispensedList.length === 0 ? (
              <p className="text-slate-500 text-[11px] italic">No prescriptions dispensed yet today.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dispensedList.map((rx) => (
                  <div key={rx.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{rx.drugName}</span>
                      <span className="text-[11px] text-slate-500">
                        Patient: {rx.patientName} ({rx.fileNo})
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      Dispensed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODAL: Record Incoming Medication */}
        {isAddingNew && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Record Incoming Medication Shipment
                </h3>
                <button onClick={() => setIsAddingNew(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewItem} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Medication Trade Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coartem 80/480mg, Lonart DS, Augmentin 625mg..."
                    value={formData.drugName}
                    onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Generic / Active Chemical</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Artemether + Lumefantrine"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Therapeutic Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Antimalarial">Antimalarial</option>
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Analgesic / NSAID">Analgesic / NSAID</option>
                      <option value="Antihypertensive">Antihypertensive</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Vitamins / Supplements">Vitamins / Supplements</option>
                      <option value="IV Fluids & Injectables">IV Fluids & Injectables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Formulation</label>
                    <select
                      value={formData.dosageForm}
                      onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Suspension / Syrup">Suspension / Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Ointment / Cream">Ointment / Cream</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Strength</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg, 80/480mg"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Initial Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Reorder Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.reorderThreshold}
                      onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value) || 10 })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit Price (₦)</label>
                    <input
                      type="number"
                      value={formData.unitPriceNaira}
                      onChange={(e) => setFormData({ ...formData, unitPriceNaira: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Manufacturer / Distributor</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                  >
                    Save to Pharmacy Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Restock Item */}
        {restockModalItem && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Restock Medication: {restockModalItem.drugName}
                </h3>
                <button onClick={() => setRestockModalItem(null)} className="p-1 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmRestock} className="space-y-3">
                <p className="text-slate-600">
                  Current Stock: <strong className="font-mono text-slate-900">{restockModalItem.stockQuantity} {restockModalItem.unit}</strong>
                </p>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Units to Add ({restockModalItem.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">New Batch Number (Optional)</label>
                  <input
                    type="text"
                    value={restockBatch}
                    onChange={(e) => setRestockBatch(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">New Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={restockExpiry}
                    onChange={(e) => setRestockExpiry(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRestockModalItem(null)}
                    className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                  >
                    Confirm Restock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
