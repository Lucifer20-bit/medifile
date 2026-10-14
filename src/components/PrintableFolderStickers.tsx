import React, { useEffect, useState } from "react";
import { X, Printer, QrCode, Download, ShieldCheck, MapPin } from "lucide-react";
import { Patient } from "../types";
import { generateQRDataUrl, generateBarcodeSvg } from "../lib/qrHelper";
import { getHospitalConfig } from "../lib/storage";

interface PrintableFolderStickersProps {
  patient: Patient;
  onClose: () => void;
}

export const PrintableFolderStickers: React.FC<PrintableFolderStickersProps> = ({
  patient,
  onClose
}) => {
  const config = getHospitalConfig();
  const [qrUrl, setQrUrl] = useState<string>("");
  const [barcodeSvg, setBarcodeSvg] = useState<string>("");
  const [stickerFormat, setStickerFormat] = useState<"folder" | "card">("folder");

  useEffect(() => {
    // Generate QR payload
    const payload = JSON.stringify({
      medifile: "v1",
      fileNumber: patient.fileNumber,
      nin: patient.nin || "",
      patientId: patient.id
    });

    generateQRDataUrl(payload).then(setQrUrl);
    setBarcodeSvg(generateBarcodeSvg(patient.barcodeNumber || patient.fileNumber));
  }, [patient]);

  const handlePrint = () => {
    window.print();
  };

  const isSickleCell = patient.genotype === "SS";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Header - Hidden on Print */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              Print Physical Manila Folder Sticker & Patient Card
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 rounded-lg p-0.5 text-xs flex">
              <button
                onClick={() => setStickerFormat("folder")}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  stickerFormat === "folder" ? "bg-emerald-700 text-white" : "text-slate-300"
                }`}
              >
                Folder Label (Cover)
              </button>
              <button
                onClick={() => setStickerFormat("card")}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  stickerFormat === "card" ? "bg-emerald-700 text-white" : "text-slate-300"
                }`}
              >
                Patient Card (Pocket)
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100 print:bg-white print:p-0">
          {stickerFormat === "folder" ? (
            /* Manila Folder Large Sticker Label */
            <div className="w-full max-w-lg bg-white border-2 border-slate-900 rounded-xl p-5 shadow-md print:shadow-none print:border-2 text-slate-900 font-sans space-y-4">
              {/* Top Hospital Stamped Header */}
              <div className="text-center border-b-2 border-slate-900 pb-2">
                <p className="font-black text-sm tracking-wider uppercase">{config.hospitalName}</p>
                <p className="text-[10px] tracking-wide text-slate-600 font-semibold uppercase">
                  DIVISION OF HEALTH INFORMATION MANAGEMENT & MEDICAL ARCHIVES
                </p>
                <p className="text-[9px] text-slate-500 font-mono">PHYSICAL MANILA FOLDER RECORD LABEL</p>
              </div>

              {/* Main File Number & QR Code Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Hospital File Number
                  </span>
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900 bg-slate-100 px-3 py-1 rounded border border-slate-300 inline-block">
                    {patient.fileNumber}
                  </div>
                  {patient.legacyPaperFileNumber && (
                    <div className="text-xs font-bold text-amber-900 font-mono">
                      Legacy Paper Card: {patient.legacyPaperFileNumber}
                    </div>
                  )}
                  {patient.nin && (
                    <div className="text-[11px] text-slate-600 font-mono">
                      NIN: {patient.nin}
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="text-center shrink-0">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="Folder QR Code"
                      className="w-24 h-24 border border-slate-900 rounded p-1"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-slate-200 animate-pulse rounded"></div>
                  )}
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5">SCAN FOR DIGITAL FILE</span>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black uppercase text-slate-900">
                    {patient.lastName}, {patient.firstName} {patient.middleName || ""}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {patient.gender} • {patient.ageYears} yrs
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Phone: {patient.phone}</span>
                  <span>Origin: {patient.stateOfOrigin} State ({patient.lga})</span>
                </div>
              </div>

              {/* Genotype & Blood Group Matrix */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className={`p-2 rounded-lg border-2 ${
                  isSickleCell ? "bg-rose-100 border-rose-600 text-rose-900" : "bg-white border-slate-900 text-slate-900"
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider block">Genotype</span>
                  <span className="text-lg font-black">{patient.genotype}</span>
                  {isSickleCell && (
                    <span className="text-[8px] font-bold block text-rose-700">SICKLE CELL ALERT</span>
                  )}
                </div>

                <div className="p-2 rounded-lg border-2 border-slate-900 bg-white text-slate-900">
                  <span className="text-[9px] font-bold uppercase tracking-wider block">Blood Group</span>
                  <span className="text-lg font-black">{patient.bloodGroup}</span>
                  <span className="text-[8px] text-slate-500 block">ABO Compatibility</span>
                </div>
              </div>

              {/* Physical Shelf Coordinates - The Core Nigerian Paper Bridge */}
              <div className="bg-amber-100 border-2 border-amber-400 p-2.5 rounded-lg text-slate-900 space-y-1">
                <div className="flex items-center justify-between font-bold text-[10px] text-amber-900 uppercase">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-700" />
                    Physical Archive Coordinates:
                  </span>
                  <span>{patient.physicalArchive.folderColor}</span>
                </div>
                <div className="text-xs font-black text-slate-900 font-mono">
                  {patient.physicalArchive.roomNumber} &gt; {patient.physicalArchive.cabinet} &gt; {patient.physicalArchive.shelfOrDrawer}
                </div>
              </div>

              {/* Barcode & Footer Warning */}
              <div className="text-center pt-1 border-t border-slate-200">
                <div
                  dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                  className="w-full flex justify-center"
                />
                <p className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider">
                  PROPERTY OF HOSPITAL HEALTH RECORDS • DO NOT REMOVE FROM PREMISES WITHOUT FORMAL LOG
                </p>
              </div>
            </div>
          ) : (
            /* Patient Pocket Wallet Plastic Card Format */
            <div className="w-full max-w-sm bg-gradient-to-br from-emerald-800 to-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-3 border border-emerald-600 print:shadow-none">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">{config.hospitalName}</h4>
                  <p className="text-[9px] text-emerald-200">PATIENT HEALTH ACCESS CARD</p>
                </div>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  {patient.fileNumber}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-black text-sm leading-tight">
                    {patient.lastName}, {patient.firstName}
                  </p>
                  <p className="text-[10px] text-emerald-100">
                    {patient.gender} • DOB: {patient.dateOfBirth}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="bg-white text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded">
                      GP: {patient.bloodGroup}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isSickleCell ? "bg-rose-500 text-white animate-pulse" : "bg-emerald-500 text-white"
                    }`}>
                      Hb {patient.genotype}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-1 rounded-lg shrink-0">
                  {qrUrl && <img src={qrUrl} alt="Card QR" className="w-20 h-20" />}
                </div>
              </div>

              <div className="border-t border-white/20 pt-2 flex items-center justify-between text-[9px] text-emerald-200">
                <span>Next of Kin: {patient.nextOfKin.name} ({patient.nextOfKin.phone})</span>
                <span>Valid: Permanent</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
