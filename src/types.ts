export type TabId = 'home' | 'history' | 'directory' | 'profile';

export type ClaimCategoryId =
  | 'heating'
  | 'water'
  | 'tariffs'
  | 'meters'
  | 'maintenance'
  | 'cleaning'
  | 'security'
  | 'yard'
  | 'common_property'
  | 'universal';

export interface OwnerProfile {
  fullName: string;
  apartment: string;
  address: string;
  phone: string;
  email: string;
}

export interface ManagementCompany {
  name: string;
  directorLine: string;
  address: string;
  email: string;
  officePhone: string;
  officePhoneRaw: string;
  emergencyPhone: string;
  emergencyPhoneRaw: string;
  complexName: string;
}

export interface ClaimField {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea' | 'date';
  defaultValue?: string;
}

export interface ClaimTemplate {
  id: string;
  categoryId: ClaimCategoryId;
  title: string;
  shortDescription: string;
  legalBasis: string;
  subject: string;
  fields: ClaimField[];
  bodyBuilder: (values: Record<string, string>) => {
    facts: string;
    demands: string[];
  };
}

export interface ClaimCategory {
  id: ClaimCategoryId;
  title: string;
  shortLabel: string;
  description: string;
  accentBg: string;
  accentText: string;
  templates: ClaimTemplate[];
}

export type ClaimStatus = 'draft' | 'sent' | 'resolved' | 'escalated';

export interface SavedClaim {
  id: string;
  categoryId: ClaimCategoryId;
  categoryLabel: string;
  templateId: string;
  title: string;
  subject: string;
  documentText: string;
  createdAt: string; // ISO date string
  deadlineAt: string; // ISO date string (10 business days)
  reminderAdded?: boolean;
  status?: ClaimStatus;
}

export interface LegalArticle {
  id: string;
  title: string;
  topic: string;
  keyRule: string;
  categoryId: ClaimCategoryId;
  summary: string;
  lawCitations: string[];
  steps: string[];
}
