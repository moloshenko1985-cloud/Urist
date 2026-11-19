import React from 'react';
import { Share, PlusSquare, CheckCircle2, Smartphone, X, Download } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onNativeInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onNativeInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
    >
      <div
        className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[24px] bg-[#F2F2F7] shadow-2xl overflow-hidden pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <h2
              id="ios-install-title"
              className="text-[17px] font-semibold tracking-tight text-[#1C1C1E]"
            >
              Установка на iPhone / iPad
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-[14px] leading-relaxed text-[#3C3C43]/85 px-1">
            Добавьте приложение «Юрист в кармане» на экран «Домой» iOS. Оно будет открываться на весь экран без панели браузера и работать даже без интернета.
          </p>

          {isInstallable && (
            <button
              type="button"
              onClick={async () => {
                const ok = await onNativeInstall();
                if (ok) onClose();
              }}
              className="w-full min-h-[48px] rounded-xl bg-[#007AFF] text-white text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Download className="w-4.5 h-4.5" />
              Установить приложение сейчас
            </button>
          )}

          <div className="bg-white rounded-2xl border border-black/[0.05] divide-y divide-black/[0.06]">
            <div className="flex items-start gap-3.5 p-4">
              <div className="w-9 h-9 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                <Share className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1C1C1E]">
                  1. Нажмите «Поделиться» в Safari
                </div>
                <p className="text-[13px] text-[#3C3C43]/75 mt-0.5 leading-snug">
                  Кнопка со стрелкой вверх расположена внизу экрана Safari на iPhone или вверху на iPad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4">
              <div className="w-9 h-9 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                <PlusSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1C1C1E]">
                  2. Выберите «На экран «Домой»»
                </div>
                <p className="text-[13px] text-[#3C3C43]/75 mt-0.5 leading-snug">
                  Пролистайте меню действий вниз и нажмите пункт со значком плюса.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4">
              <div className="w-9 h-9 rounded-[10px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1C1C1E]">
                  3. Нажмите «Добавить»
                </div>
                <p className="text-[13px] text-[#3C3C43]/75 mt-0.5 leading-snug">
                  Иконка «Юрист ЖК» появится на рабочем столе iPhone как обычное iOS-приложение.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-xl bg-white border border-black/[0.06] text-[16px] font-semibold text-[#007AFF] active:scale-[0.99] transition-transform"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
