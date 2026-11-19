/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  History,
  BookOpen,
  User,
  Siren,
  Smartphone,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import {
  ClaimCategoryId,
  ClaimStatus,
  ManagementCompany,
  OwnerProfile,
  SavedClaim,
  TabId,
} from './types';
import { haptics } from './utils/haptics';
import {
  CLAIM_CATEGORIES,
  DEFAULT_MANAGEMENT_COMPANY,
  DEFAULT_OWNER_PROFILE,
  LEGAL_DIRECTORY_ARTICLES,
} from './data/legalData';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { HomeView } from './components/HomeView';
import { ClaimBuilderView } from './components/ClaimBuilderView';
import { HistoryView } from './components/HistoryView';
import { DirectoryView } from './components/DirectoryView';
import { ProfileView } from './components/ProfileView';
import { EmergencySheet } from './components/EmergencySheet';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SplashScreen } from './components/SplashScreen';

const STORAGE_KEYS = {
  profile: 'yurist_jk_profile_v1',
  company: 'yurist_jk_company_v1',
  history: 'yurist_jk_history_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<ClaimCategoryId | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >(undefined);

  const [profile, setProfile] = useState<OwnerProfile>(() =>
    loadFromStorage(STORAGE_KEYS.profile, DEFAULT_OWNER_PROFILE)
  );
  const [company, setCompany] = useState<ManagementCompany>(() =>
    loadFromStorage(STORAGE_KEYS.company, DEFAULT_MANAGEMENT_COMPANY)
  );
  const [claims, setClaims] = useState<SavedClaim[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.history);
      if (raw !== null) {
        return JSON.parse(raw) as SavedClaim[];
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [showSplash, setShowSplash] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    } catch {
      // ignore quota errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.company, JSON.stringify(company));
    } catch {
      // ignore quota errors
    }
  }, [company]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(claims));
    } catch {
      // ignore quota errors
    }
  }, [claims]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const activeCategory = useMemo(
    () =>
      selectedCategoryId
        ? CLAIM_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? null
        : null,
    [selectedCategoryId]
  );

  const handleSelectCategory = (
    categoryId: ClaimCategoryId,
    templateId?: string
  ) => {
    setActiveTab('home');
    setSelectedCategoryId(categoryId);
    setSelectedTemplateId(templateId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveClaim = (claim: SavedClaim) => {
    setClaims((prev) => {
      const exists = prev.some((c) => c.id === claim.id);
      if (exists) {
        return prev.map((c) => (c.id === claim.id ? claim : c));
      }
      return [claim, ...prev];
    });
  };

  const handleDeleteClaim = (id: string) => {
    setClaims((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMarkReminder = (id: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reminderAdded: true } : c))
    );
  };

  const handleUpdateClaimStatus = (id: string, status: ClaimStatus) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const switchTab = (tab: TabId) => {
    haptics.light();
    setActiveTab(tab);
    setSelectedCategoryId(null);
    setSelectedTemplateId(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Главная', icon: <Home className="w-5.5 h-5.5" /> },
    { id: 'history', label: 'История', icon: <History className="w-5.5 h-5.5" /> },
    {
      id: 'directory',
      label: 'Справочник',
      icon: <BookOpen className="w-5.5 h-5.5" />,
    },
    { id: 'profile', label: 'Профиль', icon: <User className="w-5.5 h-5.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] flex flex-col lg:flex-row">
      <SplashScreen visible={showSplash} onFinish={() => setShowSplash(false)} />

      {/* Desktop / iPadOS Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 bg-white/90 backdrop-blur-xl border-r border-black/[0.07] p-5 justify-between no-print z-30">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 pt-1">
            <img
              src="/pwa-192x192.png"
              alt="Юрист в кармане"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-[12px] object-cover shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[16px] font-bold tracking-tight text-[#1C1C1E] truncate">
                Юрист в кармане
              </div>
              <div className="text-[12px] text-[#3C3C43]/70 truncate">
                {company.complexName} · {company.name}
              </div>
            </div>
          </div>

          <nav aria-label="Основная навигация" className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={`w-full min-h-[46px] px-3.5 rounded-xl flex items-center justify-between gap-3 text-[15px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#007AFF]/12 text-[#007AFF]'
                      : 'text-[#3C3C43] hover:bg-[#F2F2F7]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'history' && claims.length > 0 && (
                    <span className="text-[12.5px] font-medium tabular-nums text-[#8E8E93]">
                      {claims.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setEmergencyOpen(true)}
            className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#FFE5E5] hover:bg-[#FFDADA] text-[#9E161C] text-[14px] font-semibold flex items-center gap-2.5 transition-colors"
          >
            <Siren className="w-4.5 h-4.5 text-[#D70015] shrink-0" />
            <span className="truncate">Аварийная служба 24/7</span>
          </button>

          {!isInstalled && (
            <button
              type="button"
              onClick={() => setInstallModalOpen(true)}
              className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-[14px] font-semibold flex items-center gap-2.5 transition-colors"
            >
              <Smartphone className="w-4.5 h-4.5 text-[#007AFF] shrink-0" />
              <span className="truncate">Установить на iPhone</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Mobile Compact Top Safe-Area Bar (only on non-builder mobile views for install action) */}
        {!isInstalled && !activeCategory && (
          <header className="lg:hidden sticky top-0 z-30 pt-safe bg-[#F2F2F7]/85 backdrop-blur-xl border-b border-black/[0.06] no-print">
            <div className="h-12 px-4 flex items-center justify-between">
              <span className="text-[15px] font-bold tracking-tight text-[#1C1C1E] whitespace-nowrap shrink-0">
                Юрист в кармане
              </span>
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                className="min-h-[36px] px-3 rounded-lg bg-[#007AFF]/10 text-[#007AFF] text-[13px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5" />
                На экран iPhone
              </button>
            </div>
          </header>
        )}

        {/* Offline Banner */}
        {!isOnline && (
          <div className="mx-4 mt-3 lg:mx-8 rounded-xl bg-amber-500/15 border border-amber-500/25 px-3.5 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-amber-900 no-print">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Офлайн-режим — шаблоны и история заявлений доступны без сети.</span>
          </div>
        )}

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-10">
          <motion.div
            key={activeCategory ? `builder-${activeCategory.id}-${selectedTemplateId ?? 'default'}` : `tab-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'home' && activeCategory ? (
              <ClaimBuilderView
                key={`${activeCategory.id}-${selectedTemplateId ?? 'default'}`}
                category={activeCategory}
                initialTemplateId={selectedTemplateId}
                profile={profile}
                company={company}
                onBack={() => {
                  haptics.light();
                  setSelectedCategoryId(null);
                  setSelectedTemplateId(undefined);
                }}
                onEditProfile={() => switchTab('profile')}
                onSaveClaim={handleSaveClaim}
                onToast={showToast}
              />
            ) : activeTab === 'home' ? (
              <HomeView
                profile={profile}
                company={company}
                categories={CLAIM_CATEGORIES}
                claims={claims}
                onSelectCategory={handleSelectCategory}
                onEditProfile={() => switchTab('profile')}
                onOpenEmergency={() => setEmergencyOpen(true)}
                onOpenHistory={() => switchTab('history')}
              />
            ) : activeTab === 'history' ? (
              <HistoryView
                claims={claims}
                profile={profile}
                company={company}
                onDeleteClaim={handleDeleteClaim}
                onMarkReminder={handleMarkReminder}
                onUpdateStatus={handleUpdateClaimStatus}
                onCreateNew={() => switchTab('home')}
                onToast={showToast}
              />
            ) : activeTab === 'directory' ? (
              <DirectoryView
                articles={LEGAL_DIRECTORY_ARTICLES}
                onJumpToCategory={handleSelectCategory}
              />
            ) : (
              <ProfileView
                profile={profile}
                company={company}
                isInstalled={isInstalled}
                onSaveProfile={setProfile}
                onSaveCompany={setCompany}
                onOpenInstallModal={() => setInstallModalOpen(true)}
                onToast={showToast}
              />
            )}
          </motion.div>
        </main>
      </div>

      {/* Mobile iOS Translucent Bottom Tab Bar */}
      <nav
        aria-label="Нижняя навигация"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/88 backdrop-blur-xl border-t border-black/[0.08] pb-safe no-print"
      >
        <div className="grid grid-cols-4 h-[58px] max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                {item.icon}
                <span className="text-[10.5px] font-medium tracking-tight leading-none mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals & Action Sheets */}
      <EmergencySheet
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        company={company}
      />

      <PWAInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        isInstallable={isInstallable}
        onNativeInstall={install}
      />

      {/* iOS Floating Spring Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="ios-toast"
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded-2xl bg-[#0F1E3D]/95 backdrop-blur-md text-white px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.28)] ring-1 ring-white/12 flex items-center gap-2.5 text-[13.5px] font-medium no-print"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-[#F5D27A] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
