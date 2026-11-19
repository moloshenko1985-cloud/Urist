import React from 'react';
import {
  Flame,
  Droplets,
  Wallet,
  Gauge,
  Wrench,
  Sparkles,
  ShieldCheck,
  Trees,
  Store,
  FileEdit,
} from 'lucide-react';
import { ClaimCategoryId } from '../types';

interface CategoryIconProps {
  categoryId: ClaimCategoryId;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryId,
  className = 'w-5 h-5',
}) => {
  switch (categoryId) {
    case 'heating':
      return <Flame className={className} strokeWidth={2} />;
    case 'water':
      return <Droplets className={className} strokeWidth={2} />;
    case 'tariffs':
      return <Wallet className={className} strokeWidth={2} />;
    case 'meters':
      return <Gauge className={className} strokeWidth={2} />;
    case 'maintenance':
      return <Wrench className={className} strokeWidth={2} />;
    case 'cleaning':
      return <Sparkles className={className} strokeWidth={2} />;
    case 'security':
      return <ShieldCheck className={className} strokeWidth={2} />;
    case 'yard':
      return <Trees className={className} strokeWidth={2} />;
    case 'common_property':
      return <Store className={className} strokeWidth={2} />;
    case 'universal':
    default:
      return <FileEdit className={className} strokeWidth={2} />;
  }
};
