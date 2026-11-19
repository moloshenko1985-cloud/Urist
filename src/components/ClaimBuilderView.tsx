import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Mail,
  Save,
  Share2,
  Printer,
  CalendarPlus,
  Check,
  FileText,
  Pencil,
  Scale,
  Info,
  FileDown,
  AlertTriangle,
} from 'lucide-react';
import {
  ClaimCategory,
  ManagementCompany,
  OwnerProfile,
  SavedClaim,
} from '../types';
import {
  addBusinessDays,
  buildMailtoHref,
  buildOfficialClaimText,
  downloadIOSCalendarReminder,
  downloadWordDocument,
  formatRussianDateLong,
} from '../utils/claimUtils';
import { haptics } from '../utils/haptics';
import { CategoryIcon } from './CategoryIcon';

interface ClaimBuilderViewProps {
  category: ClaimCategory;
  initialTemplateId?: string;
  profile: OwnerProfile;
  company: ManagementCompany;
  onBack: () => void;
  onEditProfile: () => void;
  onSaveClaim: (claim: SavedClaim) => void;
  onToast: (message: string) => void;
}

export const ClaimBuilderView: React.FC<ClaimBuilderViewProps> = ({
  category,
  initialTemplateId,
  profile,
  company,
  onBack,
  onEditProfile,
  onSaveClaim,
  onToast,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplateId && category.templates.some((t) => t.id === initialTemplateId)
      ? initialTemplateId
      : category.templates[0].id
  );
  const [step, setStep] = useState<1 | 2>(1);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const template = useMemo(
    () =>
      category.templates.find((t) => t.id === selectedTemplateId) ||
      category.templates[0],
    [category.templates, selectedTemplateId]
  );

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    category.templates.forEach((tpl) => {
      tpl.fields.forEach((f) => {
        if (f.defaultValue) initial[`${tpl.id}:${f.id}`] = f.defaultValue;
      });
    });
    return initial;
  });

  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentValues = useMemo(() => {
    const map: Record<string, string> = {};
    template.fields.forEach((f) => {
      map[f.id] = fieldValues[`${template.id}:${f.id}`] ?? f.defaultValue ?? '';
    });
    return map;
  }, [template, fieldValues]);

  const now = useMemo(() => new Date(), []);
  const deadlineDate = useMemo(() => addBusinessDays(now, 10), [now]);

  const documentText = useMemo(() => {
    const { facts, demands } = template.bodyBuilder(currentValues);
    return buildOfficialClaimText({
      profile,
      company,
      title: template.title,
      legalBasis: template.legalBasis,
      facts,
      demands,
      date: now,
    });
  }, [template, currentValues, profile, company, now]);

  const buildClaimRecord = (status: SavedClaim['status'] = 'draft'): SavedClaim => ({
    id: savedId ?? `claim-${Date.now()}`,
    categoryId: category.id,
    categoryLabel: category.shortLabel,
    templateId: template.id,
    title: template.title,
    subject: template.subject,
    documentText,
    createdAt: new Date().toISOString(),
    deadlineAt: deadlineDate.toISOString(),
    status,
  });

  const handleGenerateDocument = () => {
    haptics.medium();
    const record = buildClaimRecord('draft');
    onSaveClaim(record);
    setSavedId(record.id);
    setStep(2);
    onToast('Документ сформирован и сохранен в историю');
    setTimeout(() => {
      if (window.innerWidth >= 1024) {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleSave = (status: SavedClaim['status'] = 'draft') => {
    haptics.success();
    const record = buildClaimRecord(status);
    onSaveClaim(record);
    setSavedId(record.id);
    if (status === 'draft') {
      onToast('Заявление сохранено в истории · контроль 10 раб. дней');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(documentText);
      haptics.success();
      setCopied(true);
      onToast('Текст претензии скопирован');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('Не удалось скопировать текст');
    }
  };

  const handleShare = async () => {
    haptics.light();
    if (navigator.share) {
      try {
        await navigator.share({
          title: template.subject,
          text: documentText,
        });
      } catch {
        // user dismissed iOS share sheet
      }
    } else {
      handleCopy();
    }
  };

  const handleCalendar = () => {
    haptics.success();
    const record = buildClaimRecord();
    downloadIOSCalendarReminder(record);
    onToast('Файл напоминания (.ics) создан для Календаря iOS');
  };

  const handleDownloadWord = () => {
    haptics.success();
    downloadWordDocument(template.title, documentText);
    onToast('Документ Word (.doc) скачан по ГОСТ');
  };

  const mailtoHref = buildMailtoHref(company.email, template.subject, documentText);

  const isProfileIncomplete =
    !profile.fullName.trim() || !profile.apartment.trim();

  const ownerLine = [
    profile.fullName.trim() || 'Не указано ФИО',
    profile.apartment.trim() ? `кв. ${profile.apartment.trim()}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center gap-3 no-print">
        <button
          type="button"
          onClick={() => {
            if (step === 2 && window.innerWidth < 1024) {
              setStep(1);
            } else {
              onBack();
            }
          }}
          className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-[#007AFF] hover:bg-[#007AFF]/8 transition-colors"
          aria-label="Назад"
        >
          <ArrowLeft className="w-5.5 h-5.5" />
        </button>
        <div
          className={`w-10 h-10 rounded-[11px] ${category.accentBg} ${category.accentText} flex items-center justify-center shrink-0`}
        >
          <CategoryIcon categoryId={category.id} className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight text-[#1C1C1E] truncate">
            {category.title}
          </h1>
          <p className="text-[13px] text-[#3C3C43]/70 truncate">
            {step === 1
              ? 'Шаг 1 из 2: Уточнение деталей'
              : `Шаг 2 из 2: Готовый документ · ответ до ${formatRussianDateLong(deadlineDate)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Step 1: Details & Situation Selector */}
        <div
          className={`lg:col-span-5 space-y-4 no-print ${
            step === 2 ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Recipient & Applicant Summary Card */}
          <div
            className={`bg-white rounded-2xl border p-4 space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
              isProfileIncomplete ? 'border-amber-400/60' : 'border-black/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13.5px] font-semibold text-[#1C3D7A]">
                Адресат и заявитель
              </span>
              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#007AFF] hover:underline min-h-[32px] px-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                {isProfileIncomplete ? 'Заполнить' : 'Изменить данные'}
              </button>
            </div>
            <div className="text-[13px] text-[#3C3C43]/80 leading-snug">
              Куда: {company.name} ({company.directorLine})
            </div>
            <div className="text-[14px] font-semibold text-[#1C1C1E] tabular-nums">
              От кого: {ownerLine}
            </div>
            {isProfileIncomplete && (
              <button
                type="button"
                onClick={onEditProfile}
                className="w-full mt-1 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-2 flex items-center gap-2 text-left text-[12.5px] font-medium text-amber-900"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Укажите ваши ФИО и квартиру, чтобы шапка документа заполнилась автоматически</span>
              </button>
            )}
          </div>

          {/* Radio Selector: Choose specific situation */}
          <div className="space-y-2.5">
            <h2 className="text-[15.5px] font-bold text-[#1C1C1E] px-1">
              Выберите конкретную ситуацию:
            </h2>
            <div className="space-y-2.5" role="radiogroup" aria-label="Конкретная ситуация">
              {category.templates.map((tpl) => {
                const active = tpl.id === template.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setSavedId(null);
                    }}
                    className={`w-full rounded-2xl px-4 py-4 text-left transition-all flex items-center gap-3.5 min-h-[64px] border ${
                      active
                        ? 'bg-[#EAF2FF] border-[#1C3D7A] text-[#1C1C1E]'
                        : 'bg-white border-black/[0.06] hover:bg-[#FAFAFC] text-[#1C1C1E]'
                    }`}
                  >
                    <span
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'border-[#1C3D7A]' : 'border-[#8E8E93]/60'
                      }`}
                    >
                      {active && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1C3D7A]" />
                      )}
                    </span>
                    <span
                      className={`text-[15px] leading-snug ${
                        active ? 'font-bold text-[#1C1C1E]' : 'font-medium text-[#1C1C1E]'
                      }`}
                    >
                      {tpl.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Details & Refinements */}
          <div className="space-y-2">
            <div className="px-1">
              <h2 className="text-[15.5px] font-bold text-[#1C1C1E]">
                Подробности и уточнения (опционально):
              </h2>
              <p className="text-[13px] text-[#3C3C43]/75 mt-0.5">
                {template.shortDescription}
              </p>
            </div>

            {template.fields.map((field) => {
              const key = `${template.id}:${field.id}`;
              const val = fieldValues[key] ?? field.defaultValue ?? '';
              return (
                <div
                  key={field.id}
                  className="bg-white rounded-2xl border border-black/[0.06] p-3.5 space-y-1.5 focus-within:border-[#007AFF] transition-colors"
                >
                  <label
                    htmlFor={key}
                    className="block text-[12px] font-medium text-[#8E8E93]"
                  >
                    {field.label}
                  </label>
                  <textarea
                    id={key}
                    rows={4}
                    value={val}
                    onChange={(e) => {
                      setFieldValues((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }));
                      setSavedId(null);
                    }}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent text-[15px] leading-relaxed text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none resize-y"
                  />
                </div>
              );
            })}
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2.5 px-1 text-[13px] leading-relaxed text-[#3C3C43]/75">
            <Info className="w-4 h-4 text-[#1C3D7A] shrink-0 mt-0.5" />
            <p>
              После нажатия кнопки документ будет полностью сформирован с точными ссылками на законы. Вы сможете скопировать его или сразу отправить на email УК.
            </p>
          </div>

          {/* Primary Generate CTA */}
          <button
            type="button"
            onClick={handleGenerateDocument}
            className="w-full min-h-[54px] rounded-2xl bg-[#1C3D7A] hover:bg-[#163163] text-white text-[16px] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.99] transition-all shadow-sm"
          >
            <Scale className="w-5 h-5" />
            Сформировать документ
          </button>
        </div>

        {/* Step 2 (and desktop right pane): Official Document Preview & Actions */}
        <div
          ref={previewRef}
          className={`lg:col-span-7 space-y-4 ${
            step === 1 ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden print-only">
            <div className="px-4 py-3 border-b border-black/[0.06] flex items-center justify-between gap-2 bg-[#FAFAFC] no-print">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#3C3C43] min-w-0">
                <FileText className="w-4 h-4 text-[#1C3D7A] shrink-0" />
                <span className="truncate">Официальная претензия ({company.name})</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadWord}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#1C3D7A] hover:bg-[#1C3D7A]/8 rounded-lg min-h-[36px] px-2.5 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Word (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#007AFF] hover:bg-[#007AFF]/8 rounded-lg min-h-[36px] px-2.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Печать / PDF</span>
                </button>
              </div>
            </div>
            <div className="p-5 sm:p-7">
              <pre className="whitespace-pre-wrap font-sans text-[13.5px] sm:text-[14px] leading-[1.6] text-[#1C1C1E]">
                {documentText}
              </pre>
            </div>
          </div>

          {/* Document Actions */}
          <div className="space-y-2.5 no-print">
            <a
              href={mailtoHref}
              onClick={() => {
                handleSave('sent');
                onToast('Открыта почта · статус изменен на «Отправлено»');
              }}
              className="w-full min-h-[52px] rounded-2xl bg-[#1C3D7A] hover:bg-[#163163] text-white text-[15.5px] font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm"
            >
              <Mail className="w-4.5 h-4.5" />
              Отправить на Email УК ({company.email})
            </a>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                className="min-h-[46px] rounded-xl bg-white border border-black/[0.06] text-[13.5px] font-semibold text-[#1C1C1E] flex items-center justify-center gap-1.5 hover:bg-[#FAFAFC] active:scale-[0.99] transition-all"
              >
                {savedId ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    В истории
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#007AFF]" />
                    Сохранить
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[46px] rounded-xl bg-white border border-black/[0.06] text-[13.5px] font-semibold text-[#1C1C1E] flex items-center justify-center gap-1.5 hover:bg-[#FAFAFC] active:scale-[0.99] transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#007AFF]" />
                    Копировать
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[46px] rounded-xl bg-white border border-black/[0.06] text-[13.5px] font-semibold text-[#1C1C1E] flex items-center justify-center gap-1.5 hover:bg-[#FAFAFC] active:scale-[0.99] transition-all"
              >
                <Share2 className="w-4 h-4 text-[#007AFF]" />
                Поделиться
              </button>

              <button
                type="button"
                onClick={handleCalendar}
                className="min-h-[46px] rounded-xl bg-white border border-black/[0.06] text-[13.5px] font-semibold text-[#1C1C1E] flex items-center justify-center gap-1.5 hover:bg-[#FAFAFC] active:scale-[0.99] transition-all"
              >
                <CalendarPlus className="w-4 h-4 text-amber-600" />
                В Календарь
              </button>
            </div>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="lg:hidden w-full min-h-[46px] rounded-xl bg-white border border-black/[0.06] text-[14px] font-semibold text-[#007AFF]"
              >
                Изменить ситуацию или текст проблемы
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
