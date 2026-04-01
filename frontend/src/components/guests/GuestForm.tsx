import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GuestCreate } from '../../types';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface GuestFormProps {
  initialData?: Partial<GuestCreate>;
  onSubmit: (data: GuestCreate) => Promise<void>;
  onCancel: () => void;
}

export default function GuestForm({ initialData, onSubmit, onCancel }: GuestFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<GuestCreate>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    street: initialData?.street || '',
    city: initialData?.city || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || '',
    intolerances: initialData?.intolerances || '',
    favorites: initialData?.favorites || '',
    dietary_notes: initialData?.dietary_notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('guests.guestInformation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('guests.firstName')}
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            placeholder={t('guests.firstNamePlaceholder')}
          />
          <Input
            label={t('guests.lastName')}
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            placeholder={t('guests.lastNamePlaceholder')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('guests.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={t('guests.emailPlaceholder')}
          />
          <Input
            label={t('guests.phone')}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t('guests.phonePlaceholder')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('guests.address')}</h3>
        <Input
          label={t('guests.street')}
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder={t('guests.streetPlaceholder')}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('guests.postalCode')}
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            placeholder={t('guests.postalCodePlaceholder')}
          />
          <Input
            label={t('guests.city')}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder={t('guests.cityPlaceholder')}
          />
          <Input
            label={t('guests.country')}
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder={t('guests.countryPlaceholder')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('guests.dietaryInformation')}</h3>
        <Textarea
          label={t('guests.intolerances')}
          value={formData.intolerances}
          onChange={(e) => setFormData({ ...formData, intolerances: e.target.value })}
          rows={2}
          placeholder={t('guests.intolerancesPlaceholder')}
        />
        <Textarea
          label={t('guests.favorites')}
          value={formData.favorites}
          onChange={(e) => setFormData({ ...formData, favorites: e.target.value })}
          rows={2}
          placeholder={t('guests.favoritesPlaceholder')}
        />
        <Textarea
          label={t('guests.dietaryNotes')}
          value={formData.dietary_notes}
          onChange={(e) => setFormData({ ...formData, dietary_notes: e.target.value })}
          rows={3}
          placeholder={t('guests.dietaryNotesPlaceholder')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? t('guests.updateGuest') : t('guests.createGuest')}
        </Button>
      </div>
    </form>
  );
}

// Made with Bob