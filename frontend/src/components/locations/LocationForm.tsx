import { useState } from 'react';
import type { LocationCreate } from '../../types';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface LocationFormProps {
  initialData?: Partial<LocationCreate>;
  onSubmit: (data: LocationCreate) => Promise<void>;
  onCancel: () => void;
}

export default function LocationForm({ initialData, onSubmit, onCancel }: LocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LocationCreate>({
    name: initialData?.name || '',
    description: initialData?.description || '',
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
        <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
        <Input
          label="Location Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter location name"
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Describe the location"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Location' : 'Create Location'}
        </Button>
      </div>
    </form>
  );
}

// Made with Bob