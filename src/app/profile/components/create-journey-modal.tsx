"use client";

import { useState } from "react";
import { Modal } from "@/lib/components/ui/modal";
import { useModal } from "@/lib/hooks/ui/use-modal";
import {
  FormField,
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/lib/components/ui/form";

interface CreateJourneyModalProps {
  onConfirm: (journeyData: {
    name: string;
    description: string;
  }) => Promise<void>;
}

export function CreateJourneyModal({ onConfirm }: CreateJourneyModalProps) {
  const { closeModal } = useModal();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Journey name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Journey name must be at least 3 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Journey name must be less than 50 characters";
    }
    if (formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await onConfirm({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      closeModal(); // ✅ close modal after success
    } catch (error) {
      console.error("Error creating journey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true}>
      <Modal.Header onClose={closeModal}>Create New Journey</Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <FormField>
            <FormLabel htmlFor="name" required>
              Journey Name
            </FormLabel>
            <FormInput
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Give your journey a name"
              disabled={isSubmitting}
              error={!!errors.name}
            />
          </FormField>

          {/* Description Field */}
          <FormField>
            <FormLabel htmlFor="description">Description</FormLabel>
            <FormTextarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description of your journey"
              disabled={isSubmitting}
              error={!!errors.description}
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={closeModal}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Journey"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
