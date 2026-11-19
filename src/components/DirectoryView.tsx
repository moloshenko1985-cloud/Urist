import React, { useMemo, useState } from 'react';
import {
  Search,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Timer,
  Thermometer,
  Droplets,
  Wrench,
  Wallet,
  Gauge,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { ClaimCategoryId, LegalArticle } from '../types';

interface DirectoryViewProps {
  articles: LegalArticle[];
  onJumpToCategory: (categoryId: ClaimCategoryId) => void;
}

const ArticleIcon: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'response-deadline':
      return <Timer className="w-5 h-5 text-[#1C3D7A]" />;
    case 'heating-norms':
      return <Thermometer className="w-5 h-5 text-orange-600" />;
    case 'water-norms':
      return <Droplets className="w-5 h-5 text-sky-600" />;
    case 'lift-and-flood-norms':
      return <Wrench className="w-5 h-5 text-violet-600" />;
    case 'tariff-approval':
      return <Wallet className="w-5 h-5 text-amber-600" />;
    case 'meters-sealing-law':
      return <Gauge className="w-5 h-5 text-blue-600" />;
    case 'cleaning-norms':
      return <Sparkles className="w-5 h-5 text-emerald-600" />;
    case 'common-property-law':
    default:
      return <Store className="w-5 h-5 text-teal-600" />;
  }
};

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  articles,
  onJumpToCategory,
}) => {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(articles[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.topic.toLowerCase().includes(q) ||
        a.keyRule.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.lawCitations.some((c) => c.toLowerCase().includes(q))
    );
  }, [articles, query]);

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1C1C1E]">
          Юридический справочник
        </h1>
      </div>

      {/* iOS Search Field */}
      <div className="relative">
        <Search className="w-4.5 h-4.5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по законам и нормативам..."
          aria-label="Поиск по законам и нормативам"
          className="w-full min-h-[46px] rounded-2xl bg-white border border-black/[0.06] pl-10 pr-10 text-[15px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:border-[#007AFF] focus:outline-none transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Очистить поиск"
            className="min-w-[40px] min-h-[40px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Intro Card */}
      <div className="rounded-2xl bg-white/85 border border-black/[0.05] p-4 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-[11px] bg-[#1C3D7A]/10 text-[#1C3D7A] flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">
            Права собственника жилья
          </h2>
          <p className="text-[13.5px] text-[#3C3C43]/75 leading-relaxed mt-0.5">
            Краткие официальные выжимки из ЖК РФ, СанПиН и Постановлений Правительства РФ № 354, 491, 416.
          </p>
        </div>
      </div>

      {/* Articles List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.05] p-8 text-center">
          <p className="text-[15px] text-[#3C3C43]/75">
            По запросу «{query}» ничего не найдено.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => {
            const isOpen = expandedId === article.id;
            return (
              <article
                key={article.id}
                className="bg-white rounded-2xl border border-black/[0.05] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : article.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex flex-col gap-3 hover:bg-[#FAFAFC] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-[11px] bg-[#F2F2F7] flex items-center justify-center shrink-0 mt-0.5">
                        <ArticleIcon id={article.id} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[16.5px] font-bold text-[#1C1C1E] leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-[13px] font-medium text-[#1C3D7A] mt-0.5">
                          {article.topic}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#8E8E93] shrink-0 mt-1 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#007AFF]' : ''
                      }`}
                    />
                  </div>

                  {/* Key Legal Rule Callout */}
                  <div className="w-full rounded-xl bg-[#F2F5FA] px-3.5 py-2.5 text-[14px] font-semibold text-[#1C1C1E]">
                    {article.keyRule}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-black/[0.05]">
                    <p className="text-[14.5px] leading-relaxed text-[#3C3C43] pt-3">
                      {article.summary}
                    </p>

                    <div className="space-y-1.5">
                      <h4 className="text-[12.5px] font-semibold text-[#8E8E93]">
                        Нормативная база
                      </h4>
                      <ul className="space-y-1 text-[13.5px] text-[#1C1C1E]">
                        {article.lawCitations.map((law, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#007AFF] font-semibold">·</span>
                            <span>{law}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-[12.5px] font-semibold text-[#8E8E93]">
                        Порядок действий
                      </h4>
                      <ol className="space-y-1.5 text-[13.5px] text-[#3C3C43]">
                        {article.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-semibold text-[#1C3D7A] tabular-nums">
                              {i + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onJumpToCategory(article.categoryId)}
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-[#007AFF]/10 hover:bg-[#007AFF]/15 text-[#007AFF] text-[14px] font-semibold transition-colors"
                      >
                        <span>Составить претензию по этой теме</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
