"use client";

import { Modal } from "@/lib/components/ui/modal";
import { useModal } from "@/lib/hooks/ui/use-modal";
import { useState } from "react";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { Journey } from "kairos-api-client-ts";
import { ActiveJourneyCard } from "./active-journey-card";
import { FormField } from "@/lib/components/ui/form";

interface ActiveJourneyModalProps {
  onConfirm: (journeyId: string) => Promise<void>;
}

export function ActiveJourneyModal({ onConfirm }: ActiveJourneyModalProps) {
  const { closeModal } = useModal();
  const [selected, setSelected] = useState<Journey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { journeys } = useJourneys();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?._id) return;

    try {
      setSubmitting(true);
      await onConfirm(selected._id);
      closeModal();
    } catch (err) {
      console.error("Failed to set active journey:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true}>
      <Modal.Header onClose={closeModal}>Set Active Journey</Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField>
            {journeys.length > 0 ? (
              <div className="grid gap-4">
                {journeys.map((journey) => (
                  <ActiveJourneyCard
                    key={journey._id}
                    journey={journey}
                    selected={selected?._id === journey._id}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No journeys found.
              </p>
            )}
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={closeModal}
          className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selected || submitting}
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </Modal.Footer>
    </Modal>
  );
}
