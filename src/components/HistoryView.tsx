import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Copy,
  Mail,
  Trash2,
  ArrowRight,
  BellPlus,
  Clock,
  X,
  FileDown,
  Share2,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Send,
} from 'lucide-react';
import {
  ClaimStatus,
  ManagementCompany,
  OwnerProfile,
  SavedClaim,
} from '../types';
import {
  buildGjiEscalationClaim,
  buildMailtoHref,
  buildProsecutorEscalationClaim,
  downloadIOSCalendarReminder,
  downloadWordDocument,
  formatShortDateTime,
  getDeadlineStatus,
  GJI_RK_EMAIL,
  PROSECUTOR_SIMFEROPOL_EMAIL,
} from '../utils/claimUtils';
import { haptics } from '../utils/haptics';
import { CategoryIcon } from './CategoryIcon';

interface HistoryViewProps {
  claims: SavedClaim[];
  profile: OwnerProfile;
  company: ManagementCompany;
  onDeleteClaim: (id: string) => void;
  onMarkReminder: (id: string) => void;
  onUpdateStatus: (id: string, status: ClaimStatus) => void;
  onCreateNew: () => void;
  onToast: (message: string) => void;
}

const STATUS_META: Record<
  ClaimStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  draft: {
    label: 'Сформировано',
    dotColor: 'bg-[#8E8E93]',
    textColor: 'text-[#3C3C43]/80',
  },
  sent: {
    label: 'Отправлено в УК',
    dotColor: 'bg-[#007AFF]',
    textColor: 'text-[#007AFF]',
  },
  resolved: {
    label: 'Решено',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
  },
  escalated: {
    label: 'Жалоба в ГЖИ',
    dotColor: 'bg-[#D70015]',
    textColor: 'text-[#D70015]',
  },
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  claims,
  profile,
  company,
  onDeleteClaim,
  onMarkReminder,
  onUpdateStatus,
  onCreateNew,
  onToast,
}) => {
  const [openedClaim, setOpenedClaim] = useState<SavedClaim | null>(null);
  const [escalationState, setEscalationState] = useState<{
    claim: SavedClaim;
    target: 'gji' | 'prosecutor';
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      haptics.success();
      onToast('Текст документа скопирован');
    } catch {
      onToast('Не удалось скопировать текст');
    }
  };

  const handleReminder = (claim: SavedClaim) => {
    haptics.success();
    downloadIOSCalendarReminder(claim);
    onMarkReminder(claim.id);
    onToast('Напоминание добавлено в Календарь iOS (.ics)');
  };

  const handleShare = async (subject: string, text: string) => {
    haptics.light();
    if (navigator.share) {
      try {
        await navigator.share({
          title: subject,
          text,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopy(text);
    }
  };

  const handleOpenEscalation = (
    claim: SavedClaim,
    target: 'gji' | 'prosecutor' = 'gji'
  ) => {
    haptics.medium();
    setOpenedClaim(null);
    setEscalationState({ claim, target });
  };

  const activeEscalationDoc = escalationState
    ? escalationState.target === 'gji'
      ? buildGjiEscalationClaim(escalationState.claim, profile, company)
      : buildProsecutorEscalationClaim(escalationState.claim, profile, company)
    : null;

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1C1C1E]">
          История заявлений
        </h1>
      </div>

      {/* 10 Business Days Info Banner */}
      <div className="rounded-2xl bg-[#EAF2FF] border border-[#007AFF]/12 p-4 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-[10px] bg-white/85 text-[#1C3D7A] flex items-center justify-center shrink-0">
          <Timer className="w-5 h-5" />
        </div>
        <p className="text-[13.5px] leading-relaxed text-[#1C2A44]">
          Срок ответа УК — строго{' '}
          <strong className="font-semibold">10 рабочих дней</strong> (п. 36 Правил № 416).
          Отмечайте статус обращений, а при просрочке в один клик формируйте жалобу в ГЖИ РК.
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] text-[#8E8E93] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-[17px] font-semibold text-[#1C1C1E]">
            Заявлений пока нет
          </h2>
          <p className="text-[14px] text-[#3C3C43]/70 max-w-sm mx-auto">
            Выберите категорию на главном экране, чтобы сформировать официальную претензию в {company.name}.
          </p>
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onCreateNew();
            }}
            className="mt-2 inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl bg-[#1C3D7A] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            Создать претензию
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {claims.map((claim) => {
            const status = getDeadlineStatus(claim.deadlineAt);
            const claimState: ClaimStatus = claim.status ?? 'draft';
            const stateMeta = STATUS_META[claimState];
            const isConfirming = confirmDeleteId === claim.id;

            return (
              <article
                key={claim.id}
                className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(15,37,82,0.035)] p-4 sm:p-5 flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-3">
                  {/* Unboxed clean metadata header */}
                  <div className="flex items-center justify-between gap-2 text-[12.5px] text-[#3C3C43]/70">
                    <div className="flex items-center gap-1.5 font-medium text-[#1C3D7A] min-w-0">
                      <CategoryIcon categoryId={claim.categoryId} className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{claim.categoryLabel}</span>
                    </div>
                    <time className="tabular-nums shrink-0">
                      {formatShortDateTime(claim.createdAt)}
                    </time>
                  </div>

                  <h2 className="text-[16.5px] font-bold text-[#1C1C1E] leading-snug">
                    {claim.title}
                  </h2>

                  {/* Status Row with Quick Progression */}
                  <div className="flex items-center justify-between gap-2 text-[12.5px]">
                    <span className={`inline-flex items-center gap-1.5 font-semibold ${stateMeta.textColor}`}>
                      <span className={`w-2 h-2 rounded-full ${stateMeta.dotColor}`} />
                      {stateMeta.label}
                    </span>

                    <div className="flex items-center gap-2">
                      {claimState === 'draft' && (
                        <button
                          type="button"
                          onClick={() => {
                            haptics.light();
                            onUpdateStatus(claim.id, 'sent');
                            onToast('Статус: Отправлено в УК');
                          }}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#007AFF] hover:underline"
                        >
                          <Send className="w-3 h-3" />
                          Отметить отправленным
                        </button>
                      )}
                      {claimState !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => {
                            haptics.success();
                            onUpdateStatus(claim.id, 'resolved');
                            onToast('Обращение отмечено как решенное');
                          }}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:underline"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Решено
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Deadline Strip */}
                  {claimState !== 'resolved' && (
                    <div
                      className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                        status.isExpired
                          ? 'bg-[#FFE5E5] text-[#8E1118]'
                          : 'bg-[#FFF5D6] text-[#7A4F01]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[13px] font-medium tabular-nums min-w-0">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className="truncate">{status.label}</span>
                      </div>
                      {status.isExpired ? (
                        <button
                          type="button"
                          onClick={() => handleOpenEscalation(claim, 'gji')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#D70015] text-white text-[12px] font-semibold shrink-0 active:scale-[0.98] transition-transform"
                        >
                          ГЖИ / Прокуратура
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReminder(claim)}
                          title="Добавить напоминание в Календарь iOS"
                          aria-label="Добавить напоминание в Календарь iOS"
                          className="min-w-[36px] min-h-[36px] -mr-1.5 flex items-center justify-center rounded-lg text-[#1C3D7A] hover:bg-black/5 transition-colors shrink-0"
                        >
                          <BellPlus className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(claim.documentText)}
                      aria-label="Скопировать текст"
                      title="Скопировать текст"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#1C3D7A] hover:bg-[#F2F2F7] transition-colors"
                    >
                      <Copy className="w-4.5 h-4.5" />
                    </button>
                    <a
                      href={buildMailtoHref(
                        company.email,
                        claim.subject,
                        claim.documentText
                      )}
                      onClick={() => onUpdateStatus(claim.id, 'sent')}
                      aria-label="Отправить по Email"
                      title="Отправить на Email УК"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#1C3D7A] hover:bg-[#F2F2F7] transition-colors"
                    >
                      <Mail className="w-4.5 h-4.5" />
                    </a>
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 pl-1">
                        <button
                          type="button"
                          onClick={() => {
                            haptics.warning();
                            onDeleteClaim(claim.id);
                            setConfirmDeleteId(null);
                            onToast('Заявление удалено');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FF3B30] text-white text-[12px] font-semibold"
                        >
                          Удалить
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 rounded-lg bg-[#F2F2F7] text-[#3C3C43] text-[12px] font-medium"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          haptics.light();
                          setConfirmDeleteId(claim.id);
                        }}
                        aria-label="Удалить заявление"
                        title="Удалить заявление"
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#D70015] hover:bg-[#FF3B30]/8 transition-colors"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.light();
                      setOpenedClaim(claim);
                    }}
                    className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#1C3D7A] hover:text-[#007AFF] transition-colors"
                  >
                    <span>Открыть</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full Document Viewer Sheet */}
      <AnimatePresence>
        {openedClaim && (
          <motion.div
            key="claim-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs p-0 sm:p-4"
            onClick={() => setOpenedClaim(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full sm:max-w-2xl max-h-[88vh] flex flex-col rounded-t-[28px] sm:rounded-[24px] bg-[#F2F2F7] shadow-2xl overflow-hidden pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:hidden flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 rounded-full bg-black/15" />
              </div>

              <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] bg-white">
                <div className="min-w-0 pr-2">
                  <div className="text-[12px] text-[#3C3C43]/70">
                    {openedClaim.categoryLabel} · {formatShortDateTime(openedClaim.createdAt)}
                  </div>
                  <h3 className="text-[16px] font-bold text-[#1C1C1E] truncate">
                    {openedClaim.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenedClaim(null)}
                  aria-label="Закрыть"
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                <div className="bg-white rounded-2xl border border-black/[0.05] p-5">
                  <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-[1.6] text-[#1C1C1E]">
                    {openedClaim.documentText}
                  </pre>
                </div>

                {/* Escalation to GJI RK & Prosecutor Card */}
                <div className="bg-[#FFF5F5] rounded-2xl border border-[#FF3B30]/15 p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-[#D70015] shrink-0 mt-0.5" />
                    <div className="text-[13px] text-[#7A0916] leading-snug">
                      <strong className="font-semibold">УК не отвечает или игнорирует?</strong>{' '}
                      Сформируйте готовую жалобу в надзорные органы со ссылкой на это обращение.
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEscalation(openedClaim, 'gji')}
                      className="min-h-[42px] px-3 rounded-xl bg-[#D70015] hover:bg-[#B80012] text-white text-[13px] font-semibold transition-colors"
                    >
                      Жалоба в ГЖИ РК
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEscalation(openedClaim, 'prosecutor')}
                      className="min-h-[42px] px-3 rounded-xl bg-[#1C3D7A] hover:bg-[#163163] text-white text-[13px] font-semibold transition-colors"
                    >
                      В Прокуратуру
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={buildMailtoHref(
                    company.email,
                    openedClaim.subject,
                    openedClaim.documentText
                  )}
                  onClick={() => onUpdateStatus(openedClaim.id, 'sent')}
                  className="min-h-[44px] rounded-xl bg-[#1C3D7A] text-white text-[13.5px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  Отправить
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(openedClaim.documentText)}
                  className="min-h-[44px] rounded-xl bg-[#F2F2F7] text-[#1C1C1E] text-[13.5px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-4 h-4 text-[#007AFF]" />
                  Копировать
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptics.success();
                    downloadWordDocument(openedClaim.title, openedClaim.documentText);
                    onToast('Документ Word (.doc) скачан');
                  }}
                  className="min-h-[44px] rounded-xl bg-[#F2F2F7] text-[#1C1C1E] text-[13.5px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <FileDown className="w-4 h-4 text-[#1C3D7A]" />
                  Word (.doc)
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(openedClaim.subject, openedClaim.documentText)}
                  className="min-h-[44px] rounded-xl bg-[#F2F2F7] text-[#1C1C1E] text-[13.5px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-[#007AFF]" />
                  Поделиться
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escalation Document Sheet (GJI RK & Prosecutor's Office) */}
      <AnimatePresence>
        {escalationState && activeEscalationDoc && (
          <motion.div
            key="escalation-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
            onClick={() => setEscalationState(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-[28px] sm:rounded-[24px] bg-[#F2F2F7] shadow-2xl overflow-hidden pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:hidden flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 rounded-full bg-black/15" />
              </div>

              <div className="px-5 pt-3 pb-3 border-b border-black/[0.06] bg-white space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 pr-2">
                    <div className="text-[12px] font-semibold text-[#D70015]">
                      {escalationState.target === 'gji'
                        ? 'ГЖИ Республики Крым · ст. 7.23.3 КоАП РФ'
                        : 'Прокуратура г. Симферополя · ФЗ № 2202-1'}
                    </div>
                    <h3 className="text-[16px] font-bold text-[#1C1C1E] truncate">
                      {escalationState.target === 'gji'
                        ? `Жалоба в ГЖИ на ${company.name}`
                        : `Жалоба в Прокуратуру на ${company.name}`}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEscalationState(null)}
                    aria-label="Закрыть"
                    className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* iOS Segmented Control: GJI vs Prosecutor */}
                <div
                  role="tablist"
                  aria-label="Выбор надзорного органа"
                  className="grid grid-cols-2 p-1 rounded-xl bg-[#F2F2F7]"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={escalationState.target === 'gji'}
                    onClick={() => {
                      haptics.light();
                      setEscalationState({ ...escalationState, target: 'gji' });
                    }}
                    className={`min-h-[36px] rounded-[9px] text-[13px] font-semibold transition-all ${
                      escalationState.target === 'gji'
                        ? 'bg-white text-[#1C1C1E] shadow-xs'
                        : 'text-[#3C3C43]/75'
                    }`}
                  >
                    ГЖИ РК
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={escalationState.target === 'prosecutor'}
                    onClick={() => {
                      haptics.light();
                      setEscalationState({ ...escalationState, target: 'prosecutor' });
                    }}
                    className={`min-h-[36px] rounded-[9px] text-[13px] font-semibold transition-all ${
                      escalationState.target === 'prosecutor'
                        ? 'bg-white text-[#1C1C1E] shadow-xs'
                        : 'text-[#3C3C43]/75'
                    }`}
                  >
                    Прокуратура
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                <div className="rounded-xl bg-[#FFF5D6] border border-amber-400/35 px-3.5 py-2.5 text-[12.5px] leading-snug text-[#7A4F01]">
                  <strong className="font-semibold">Важно перед отправкой:</strong> в открывшемся письме обязательно прикрепите скриншот ранее отправленной претензии в {company.name} из папки «Отправленные» (чтобы были видны дата и адрес получателя).
                  {escalationState.target === 'prosecutor' && (
                    <span>
                      {' '}Также обращение можно подать через Интернет-приёмную Прокуратуры с авторизацией через Госуслуги (скопировав текст кнопкой ниже).
                    </span>
                  )}
                </div>
                <div className="bg-white rounded-2xl border border-black/[0.05] p-5">
                  <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-[1.6] text-[#1C1C1E]">
                    {activeEscalationDoc.body}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-black/[0.06] space-y-2">
                <a
                  href={buildMailtoHref(
                    activeEscalationDoc.email ||
                      (escalationState.target === 'gji'
                        ? GJI_RK_EMAIL
                        : PROSECUTOR_SIMFEROPOL_EMAIL),
                    activeEscalationDoc.subject,
                    activeEscalationDoc.body
                  )}
                  onClick={() => {
                    haptics.medium();
                    onUpdateStatus(escalationState.claim.id, 'escalated');
                    onToast(
                      escalationState.target === 'gji'
                        ? `Открыта почта ГЖИ (${activeEscalationDoc.email})`
                        : `Открыта почта Прокуратуры (${activeEscalationDoc.email})`
                    );
                  }}
                  className={`w-full min-h-[48px] rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors ${
                    escalationState.target === 'gji'
                      ? 'bg-[#D70015] hover:bg-[#B80012]'
                      : 'bg-[#1C3D7A] hover:bg-[#163163]'
                  }`}
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {escalationState.target === 'gji'
                      ? `Отправить в ГЖИ (${activeEscalationDoc.email})`
                      : `Отправить в Прокуратуру (${activeEscalationDoc.email})`}
                  </span>
                </a>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus(escalationState.claim.id, 'escalated');
                      handleCopy(activeEscalationDoc.body);
                    }}
                    className="min-h-[42px] rounded-xl bg-[#F2F2F7] text-[#1C1C1E] text-[13px] font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-4 h-4 text-[#007AFF]" />
                    Копировать
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.success();
                      onUpdateStatus(escalationState.claim.id, 'escalated');
                      downloadWordDocument(
                        activeEscalationDoc.subject,
                        activeEscalationDoc.body
                      );
                      onToast(
                        escalationState.target === 'gji'
                          ? 'Жалоба в ГЖИ скачана (.doc)'
                          : 'Жалоба в Прокуратуру скачана (.doc)'
                      );
                    }}
                    className="min-h-[42px] rounded-xl bg-[#F2F2F7] text-[#1C1C1E] text-[13px] font-semibold flex items-center justify-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4 text-[#1C3D7A]" />
                    Word (.doc)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus(escalationState.claim.id, 'escalated');
                      handleShare(
                        activeEscalationDoc.subject,
                        activeEscalationDoc.body
                      );
                    }}
                    className="min-h-[42px] rounded-xl bg-[#F2F2F7] text-[#1C1C1E] text-[13px] font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4 text-[#007AFF]" />
                    Поделиться
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
