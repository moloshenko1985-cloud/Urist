import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Pencil,
  Siren,
  ChevronRight,
  Scale,
  Search,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  ClaimCategory,
  ClaimCategoryId,
  ManagementCompany,
  OwnerProfile,
  SavedClaim,
} from '../types';
import { getDeadlineStatus } from '../utils/claimUtils';
import { haptics } from '../utils/haptics';
import { CategoryIcon } from './CategoryIcon';

interface HomeViewProps {
  profile: OwnerProfile;
  company: ManagementCompany;
  categories: ClaimCategory[];
  claims: SavedClaim[];
  onSelectCategory: (categoryId: ClaimCategoryId, templateId?: string) => void;
  onEditProfile: () => void;
  onOpenEmergency: () => void;
  onOpenHistory: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  company,
  categories,
  claims,
  onSelectCategory,
  onEditProfile,
  onOpenEmergency,
  onOpenHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const hasProfileName = profile.fullName.trim().length > 0;
  const addressPreview = [
    profile.apartment ? `кв. ${profile.apartment}` : '',
    profile.address,
  ]
    .filter(Boolean)
    .join(' · ');

  const totalTemplates = useMemo(
    () => categories.reduce((sum, c) => sum + c.templates.length, 0),
    [categories]
  );

  const activeClaimsSummary = useMemo(() => {
    const active = claims.filter((c) => c.status !== 'resolved');
    if (active.length === 0) return null;
    const expiredCount = active.filter((c) => getDeadlineStatus(c.deadlineAt).isExpired).length;
    const nearest = [...active].sort(
      (a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime()
    )[0];
    return {
      count: active.length,
      expiredCount,
      nearestStatus: getDeadlineStatus(nearest.deadlineAt),
    };
  }, [claims]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const matches: {
      category: ClaimCategory;
      templateId: string;
      title: string;
      hint: string;
    }[] = [];

    for (const cat of categories) {
      for (const tpl of cat.templates) {
        if (
          tpl.title.toLowerCase().includes(q) ||
          tpl.shortDescription.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q) ||
          tpl.legalBasis.toLowerCase().includes(q)
        ) {
          matches.push({
            category: cat,
            templateId: tpl.id,
            title: tpl.title,
            hint: tpl.shortDescription,
          });
        }
      }
    }
    return matches;
  }, [categories, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Executive Royal Navy & Gold Hero Card */}
      <section
        className="relative overflow-hidden rounded-[26px] p-5 sm:p-6 text-white shadow-[0_14px_34px_rgba(11,25,56,0.22)] ring-1 ring-white/10"
        style={{
          background:
            'linear-gradient(145deg, #0D204A 0%, #173570 55%, #0F2552 100%)',
        }}
      >
        {/* Subtle Ambient Gold Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full blur-3xl opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(245,210,122,0.55) 0%, rgba(245,210,122,0) 70%)',
          }}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#F5D27A]">
              {company.complexName}
            </p>
            <h1 className="text-[26px] sm:text-[31px] font-bold tracking-tight text-white leading-[1.14] mt-1 text-balance">
              Юрист в кармане
            </h1>
            <p className="text-[13.5px] text-white/75 mt-1">
              Официальные претензии в {company.name}
            </p>
          </div>
          <div className="w-14 h-14 rounded-[16px] overflow-hidden shrink-0 ring-1 ring-[#F5D27A]/45 shadow-[0_8px_20px_rgba(0,0,0,0.32)]">
            <img
              src="/pwa-192x192.png"
              alt="Герб приложения"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Owner Quick Profile & Emergency Row */}
        <div className="relative mt-5 grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onEditProfile();
            }}
            className="w-full min-h-[60px] rounded-2xl bg-white/12 hover:bg-white/18 backdrop-blur-md px-4 py-3 flex items-center gap-3 text-left ring-1 ring-white/15 active:scale-[0.99] transition-all"
          >
            {hasProfileName ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#F5D27A]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-[#F5D27A]" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-semibold text-white truncate">
                {hasProfileName ? profile.fullName : 'Заполните профиль собственника'}
              </div>
              <div className="text-[12.5px] text-white/70 truncate tabular-nums">
                {addressPreview || 'ФИО, квартира и email для шапки заявлений'}
              </div>
            </div>
            <Pencil className="w-4 h-4 text-[#F5D27A] shrink-0" />
          </button>

          {/* Emergency Services Trigger */}
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onOpenEmergency();
            }}
            className="w-full min-h-[60px] rounded-2xl bg-[#FF3B30]/20 hover:bg-[#FF3B30]/28 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3 text-left ring-1 ring-[#FF6961]/35 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[10px] bg-[#FF3B30]/25 text-[#FFB4AE] flex items-center justify-center shrink-0">
                <Siren className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[14.5px] font-semibold text-white truncate">
                  Аварийные службы 24/7
                </div>
                <div className="text-[12px] text-white/75 tabular-nums truncate">
                  {company.emergencyPhone} · диспетчерская
                </div>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-white/70 shrink-0" />
          </button>
        </div>

        {/* Live Active Claims Monitor Strip (only when resident has open claims) */}
        {activeClaimsSummary && (
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onOpenHistory();
            }}
            className="relative mt-2.5 w-full rounded-xl bg-black/20 hover:bg-black/28 px-3.5 py-2.5 flex items-center justify-between gap-3 text-left ring-1 ring-white/10 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0 text-[12.5px]">
              <Clock
                className={`w-4 h-4 shrink-0 ${
                  activeClaimsSummary.expiredCount > 0 ? 'text-[#FF8A80]' : 'text-[#F5D27A]'
                }`}
              />
              <span className="text-white/90 truncate tabular-nums">
                {activeClaimsSummary.expiredCount > 0
                  ? `Просрочен ответ УК (${activeClaimsSummary.expiredCount}) — можно подать в ГЖИ`
                  : `На контроле обращений: ${activeClaimsSummary.count} · ${activeClaimsSummary.nearestStatus.label}`}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
          </button>
        )}
      </section>

      {/* Categories & Quick Search Section */}
      <section aria-labelledby="categories-heading" className="space-y-3.5">
        <div className="px-1">
          <h2
            id="categories-heading"
            className="text-[22px] font-bold tracking-tight text-[#1C1C1E]"
          >
            Категории обращений
          </h2>
          <p className="text-[14px] text-[#3C3C43]/75 mt-0.5 leading-snug tabular-nums">
            {categories.length} разделов · {totalTemplates} готовых юридических шаблонов претензий
          </p>
        </div>

        {/* Instant Search across all 50 templates */}
        <div className="relative">
          <Search className="w-4.5 h-4.5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Быстрый поиск жалобы: лифт, вода, залив, домофон, пени..."
            aria-label="Быстрый поиск по всем жалобам"
            className="w-full min-h-[48px] rounded-2xl bg-white border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)] pl-10 pr-10 text-[15px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Очистить поиск"
              className="min-w-[40px] min-h-[40px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isSearching ? (
          searchResults.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 text-center space-y-2">
              <p className="text-[15px] text-[#3C3C43]/80">
                По запросу «{searchQuery}» шаблон не найден.
              </p>
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  onSelectCategory('universal');
                }}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#007AFF]/10 text-[#007AFF] text-[14px] font-semibold"
              >
                Открыть универсальную жалобу
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(15,37,82,0.04)] divide-y divide-black/[0.06] overflow-hidden">
              {searchResults.map((item) => (
                <button
                  key={item.templateId}
                  type="button"
                  onClick={() => {
                    haptics.light();
                    onSelectCategory(item.category.id, item.templateId);
                  }}
                  className="w-full px-4 py-3.5 text-left flex items-center gap-3.5 hover:bg-[#FAFAFC] active:bg-[#F2F2F7] transition-colors min-h-[68px]"
                >
                  <div
                    className={`w-10 h-10 rounded-[11px] ${item.category.accentBg} ${item.category.accentText} flex items-center justify-center shrink-0`}
                  >
                    <CategoryIcon categoryId={item.category.id} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium text-[#1C3D7A]">
                      {item.category.title}
                    </div>
                    <div className="text-[15px] font-semibold text-[#1C1C1E] leading-snug mt-0.5">
                      {item.title}
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-[#C7C7CC] shrink-0" />
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  haptics.light();
                  onSelectCategory(cat.id);
                }}
                className="group w-full rounded-2xl bg-white hover:bg-[#FCFCFE] p-4 border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(15,37,82,0.035)] hover:shadow-[0_4px_16px_rgba(15,37,82,0.07)] flex items-center gap-3.5 text-left active:scale-[0.985] transition-all min-h-[78px]"
              >
                <div
                  className={`w-11 h-11 rounded-[12px] ${cat.accentBg} ${cat.accentText} flex items-center justify-center shrink-0 transition-transform group-hover:scale-[1.04]`}
                >
                  <CategoryIcon categoryId={cat.id} className="w-5.5 h-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[16px] font-semibold text-[#1C1C1E] tracking-tight truncate">
                      {cat.title}
                    </span>
                    <span className="text-[12px] font-medium text-[#8E8E93] tabular-nums shrink-0">
                      {cat.templates.length} шт.
                    </span>
                  </div>
                  <p className="text-[13px] text-[#3C3C43]/70 leading-snug mt-0.5 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C7C7CC] group-hover:text-[#007AFF] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Legal Accuracy Footer Card */}
      <section className="rounded-2xl bg-white/90 border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.025)] p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-[11px] bg-[#1C3D7A]/8 text-[#1C3D7A] flex items-center justify-center shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#1C1C1E]">
            Юридическая точность
          </h3>
          <p className="text-[13px] text-[#3C3C43]/75 leading-relaxed mt-0.5">
            Все формулировки составлены с опорой на действующие статьи ЖК РФ, ПП РФ № 354, 491, 290, 416, № 1744, Постановление Госстроя № 170 и СанПиН.
          </p>
        </div>
      </section>
    </div>
  );
};
