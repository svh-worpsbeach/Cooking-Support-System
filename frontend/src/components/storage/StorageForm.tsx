import { useState } from 'react';
import { useLocations } from '../../hooks/useLocations';
import type { StorageItemCreate } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';

interface StorageFormProps {
  initialData?: Partial<StorageItemCreate>;
  onSubmit: (data: StorageItemCreate) => Promise<void>;
  onCancel: () => void;
}

export default function StorageForm({ initialData, onSubmit, onCancel }: StorageFormProps) {
  const { locations } = useLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StorageItemCreate>({
    name: initialData?.name || '',
    category: initialData?.category || '',
    quantity: initialData?.quantity,
    unit: initialData?.unit || '',
    expiry_date: initialData?.expiry_date || '',
    location_id: initialData?.location_id,
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Storage Item Information</h3>
        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter item name"
        />
        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          placeholder="e.g., Herbs, Spices, Oils"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            step="0.01"
            value={formData.quantity || ''}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="Amount"
          />
          <Input
            label="Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., grams, ml, pieces"
          />
        </div>
        <Input
          label="Expiry Date"
          type="date"
          value={formData.expiry_date}
          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            value={formData.location_id || ''}
            onChange={(e) => setFormData({ ...formData, location_id: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}

// Made with Bob