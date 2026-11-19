import React, { useState } from 'react';
import {
  Lock,
  User,
  Home,
  MapPin,
  Phone,
  Mail,
  Building2,
  Save,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { ManagementCompany, OwnerProfile } from '../types';

interface ProfileViewProps {
  profile: OwnerProfile;
  company: ManagementCompany;
  isInstalled: boolean;
  onSaveProfile: (profile: OwnerProfile) => void;
  onSaveCompany: (company: ManagementCompany) => void;
  onOpenInstallModal: () => void;
  onToast: (message: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  company,
  isInstalled,
  onSaveProfile,
  onSaveCompany,
  onOpenInstallModal,
  onToast,
}) => {
  const [form, setForm] = useState<OwnerProfile>(profile);
  const [companyForm, setCompanyForm] = useState<ManagementCompany>(company);
  const [editCompany, setEditCompany] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    if (editCompany) {
      onSaveCompany(companyForm);
    }
    onToast('Данные собственника сохранены на устройстве');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="px-1">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1C1C1E]">
          Профиль собственника
        </h1>
      </div>

      {/* 100% Privacy Notice */}
      <div className="rounded-2xl bg-[#EAF2FF] border border-[#007AFF]/12 p-4 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-[11px] bg-white/80 text-amber-600 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[15.5px] font-bold text-[#1C1C1E]">
            100% Конфиденциальность
          </h2>
          <p className="text-[13.5px] text-[#3C3C43]/80 leading-relaxed mt-0.5">
            Данные хранятся только на вашем смартфоне и автоматически подставляются в шапку заявлений.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Personal Data Form */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-[16px] font-bold text-[#1C1C1E] px-1">
            Личные данные заявителя
          </h2>

          <div className="bg-white rounded-2xl border border-black/[0.05] p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="owner-fullname"
                className="block text-[12.5px] font-medium text-[#3C3C43]/75"
              >
                ФИО собственника
              </label>
              <div className="relative">
                <User className="w-4.5 h-4.5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="owner-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  className="w-full min-h-[48px] rounded-xl bg-[#F2F2F7] pl-10 pr-3.5 text-[15px] text-[#1C1C1E] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label
                  htmlFor="owner-apt"
                  className="block text-[12.5px] font-medium text-[#3C3C43]/75"
                >
                  Номер квартиры
                </label>
                <div className="relative">
                  <Home className="w-4.5 h-4.5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="owner-apt"
                    type="text"
                    value={form.apartment}
                    onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                    placeholder="101"
                    className="w-full min-h-[48px] rounded-xl bg-[#F2F2F7] pl-10 pr-3.5 text-[15px] text-[#1C1C1E] tabular-nums border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="owner-phone"
                  className="block text-[12.5px] font-medium text-[#3C3C43]/75"
                >
                  Контактный телефон
                </label>
                <div className="relative">
                  <Phone className="w-4.5 h-4.5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="owner-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+7 (978) 000-00-00"
                    className="w-full min-h-[48px] rounded-xl bg-[#F2F2F7] pl-10 pr-3.5 text-[15px] text-[#1C1C1E] tabular-nums border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="owner-address"
                className="block text-[12.5px] font-medium text-[#3C3C43]/75"
              >
                Адрес дома (проживания)
              </label>
              <div className="relative">
                <MapPin className="w-4.5 h-4.5 text-[#8E8E93] absolute left-3.5 top-3.5 pointer-events-none" />
                <textarea
                  id="owner-address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="г. Симферополь, ул. Академика Королева, д. 2, к. 1"
                  className="w-full rounded-xl bg-[#F2F2F7] pl-10 pr-3.5 py-2.5 text-[15px] text-[#1C1C1E] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="owner-email"
                className="block text-[12.5px] font-medium text-[#3C3C43]/75"
              >
                Контактный Email (для официального ответа)
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="owner-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@mail.ru"
                  className="w-full min-h-[48px] rounded-xl bg-[#F2F2F7] pl-10 pr-3.5 text-[15px] text-[#1C1C1E] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[52px] rounded-2xl bg-[#1C3D7A] hover:bg-[#163163] text-white text-[16px] font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            <Save className="w-5 h-5" />
            Сохранить данные
          </button>
        </div>

        {/* Right: Management Company & iOS Install */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-black/[0.05] p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-[#1C3D7A]/10 text-[#1C3D7A] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-[16.5px] font-bold text-[#1C1C1E]">
                Управляющая компания дома
              </h2>
            </div>

            <div className="space-y-1 text-[14px] leading-relaxed text-[#3C3C43]">
              <p className="font-semibold text-[#1C1C1E]">
                Организация: {companyForm.name}
              </p>
              <p>{companyForm.directorLine}</p>
              <p>Адрес: {companyForm.address}</p>
              <p className="font-medium text-[#1C3D7A]">
                Email УК: {companyForm.email}
              </p>
            </div>

            <div className="pt-2 border-t border-black/[0.06] space-y-2.5">
              <p className="text-[13px] font-semibold text-[#1C3D7A]">
                Телефоны для быстрой связи
              </p>

              <a
                href={`tel:${companyForm.officePhoneRaw}`}
                className="flex items-center justify-between rounded-xl bg-[#F2F2F7] hover:bg-[#E8E8ED] px-4 py-3 min-h-[58px] transition-colors"
              >
                <div>
                  <div className="text-[14.5px] font-semibold text-[#1C1C1E]">
                    Офис ДУКК
                  </div>
                  <div className="text-[14px] text-[#1C3D7A] tabular-nums">
                    {companyForm.officePhone}
                  </div>
                </div>
                <Phone className="w-4.5 h-4.5 text-[#1C3D7A]" />
              </a>

              <a
                href={`tel:${companyForm.emergencyPhoneRaw}`}
                className="flex items-center justify-between rounded-xl bg-[#FFE5E5] hover:bg-[#FFDADA] px-4 py-3 min-h-[58px] transition-colors"
              >
                <div>
                  <div className="text-[14.5px] font-semibold text-[#9E161C]">
                    Аварийная служба (24/7)
                  </div>
                  <div className="text-[14px] font-medium text-[#9E161C] tabular-nums">
                    {companyForm.emergencyPhone}
                  </div>
                </div>
                <Phone className="w-4.5 h-4.5 text-[#D70015]" />
              </a>
            </div>

            {/* Expandable UK edit */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setEditCompany(!editCompany)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#007AFF] min-h-[36px]"
              >
                <span>Изменить реквизиты УК</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    editCompany ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {editCompany && (
                <div className="mt-3 space-y-3 pt-3 border-t border-black/[0.06]">
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    placeholder="Название УК"
                    className="w-full min-h-[42px] rounded-xl bg-[#F2F2F7] px-3 text-[14px] text-[#1C1C1E]"
                  />
                  <input
                    type="text"
                    value={companyForm.directorLine}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        directorLine: e.target.value,
                      })
                    }
                    placeholder="Кому (руководитель)"
                    className="w-full min-h-[42px] rounded-xl bg-[#F2F2F7] px-3 text-[14px] text-[#1C1C1E]"
                  />
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, email: e.target.value })
                    }
                    placeholder="Email УК"
                    className="w-full min-h-[42px] rounded-xl bg-[#F2F2F7] px-3 text-[14px] text-[#1C1C1E]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* iOS Install Card (hidden when already installed in standalone mode) */}
          {!isInstalled && (
            <div className="bg-white rounded-2xl border border-black/[0.05] p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1C1C1E]">
                    Установить на iPhone (iOS)
                  </h3>
                  <p className="text-[13px] text-[#3C3C43]/75 leading-snug mt-0.5">
                    Работает на весь экран без Safari и сохраняет историю заявлений офлайн.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="w-full min-h-[44px] rounded-xl bg-[#007AFF]/10 hover:bg-[#007AFF]/15 text-[#007AFF] text-[14px] font-semibold transition-colors"
              >
                Инструкция установки на iOS
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
