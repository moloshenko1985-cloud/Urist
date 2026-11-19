import React from 'react';
import { Phone, ShieldAlert, X, Info } from 'lucide-react';
import { ManagementCompany } from '../types';

interface EmergencySheetProps {
  isOpen: boolean;
  onClose: () => void;
  company: ManagementCompany;
}

export const EmergencySheet: React.FC<EmergencySheetProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-sheet-title"
    >
      <div
        className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[24px] bg-[#F2F2F7] shadow-2xl overflow-hidden pb-safe animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[#FF3B30]/12 text-[#FF3B30] flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <h2
              id="emergency-sheet-title"
              className="text-[17px] font-semibold tracking-tight text-[#1C1C1E]"
            >
              Аварийные службы
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Grouped iOS Contact List */}
          <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] divide-y divide-black/[0.06]">
            <a
              href={`tel:${company.emergencyPhoneRaw}`}
              className="flex items-center justify-between px-4 py-3.5 min-h-[64px] active:bg-[#F2F2F7] transition-colors"
            >
              <div>
                <div className="text-[15px] font-semibold text-[#D70015]">
                  Аварийная служба {company.name} (24/7)
                </div>
                <div className="text-[14px] text-[#3C3C43]/75 tabular-nums mt-0.5">
                  {company.emergencyPhone}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FF3B30]/12 text-[#FF3B30] flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
            </a>

            <a
              href={`tel:${company.officePhoneRaw}`}
              className="flex items-center justify-between px-4 py-3.5 min-h-[64px] active:bg-[#F2F2F7] transition-colors"
            >
              <div>
                <div className="text-[15px] font-semibold text-[#1C1C1E]">
                  Офис {company.name}
                </div>
                <div className="text-[14px] text-[#3C3C43]/75 tabular-nums mt-0.5">
                  {company.officePhone}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
            </a>

            <a
              href="tel:+73652604909"
              className="flex items-center justify-between px-4 py-3.5 min-h-[64px] active:bg-[#F2F2F7] transition-colors"
            >
              <div>
                <div className="text-[15px] font-semibold text-[#1C1C1E]">
                  ЕДДС г. Симферополь
                </div>
                <div className="text-[14px] text-[#3C3C43]/75 tabular-nums mt-0.5">
                  +7 (3652) 60-49-09
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
            </a>

            <a
              href="tel:112"
              className="flex items-center justify-between px-4 py-3.5 min-h-[64px] active:bg-[#F2F2F7] transition-colors"
            >
              <div>
                <div className="text-[15px] font-semibold text-[#1C1C1E]">
                  Единый номер экстренных служб
                </div>
                <div className="text-[14px] text-[#3C3C43]/75 tabular-nums mt-0.5">
                  112
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FF3B30]/12 text-[#FF3B30] flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
            </a>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-black/[0.05] flex gap-3 items-start">
            <Info className="w-4.5 h-4.5 text-[#007AFF] shrink-0 mt-0.5" />
            <p className="text-[13px] leading-relaxed text-[#3C3C43]/80">
              При звонке в диспетчерскую обязательно уточните и запишите{' '}
              <strong className="font-semibold text-[#1C1C1E]">
                номер заявки, дату, время и ФИО диспетчера
              </strong>{' '}
              — это прямое доказательство для перерасчета и жалобы в ГЖИ.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-xl bg-white border border-black/[0.06] text-[16px] font-semibold text-[#007AFF] active:scale-[0.99] transition-transform"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
