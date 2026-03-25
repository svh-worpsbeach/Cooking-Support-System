import { useState } from 'react';
import { useLocations } from '../../hooks/useLocations';
import type { CookingToolCreate } from '../../types';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface ToolFormProps {
  initialData?: Partial<CookingToolCreate>;
  onSubmit: (data: CookingToolCreate) => Promise<void>;
  onCancel: () => void;
}

export default function ToolForm({ initialData, onSubmit, onCancel }: ToolFormProps) {
  const { locations } = useLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CookingToolCreate>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    storage_location: initialData?.storage_location || '',
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
        <h3 className="text-lg font-medium text-gray-900">Tool Information</h3>
        <Input
          label="Tool Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter tool name"
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Describe the tool"
        />
        <Input
          label="Storage Location"
          value={formData.storage_location}
          onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
          placeholder="e.g., Top drawer, Cabinet 3"
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
          {initialData ? 'Update Tool' : 'Create Tool'}
        </Button>
      </div>
    </form>
  );
}

// Made with Bob