"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Campaign } from "../lib/campaigns";

export type CampaignDetailsInput = {
  description: string;
  imageUrl: string;
};

type CampaignEditDialogProps = {
  campaign: Campaign;
  onClose: () => void;
  onSave: (campaignId: string, details: CampaignDetailsInput) => Promise<void>;
};

export default function CampaignEditDialog({
  campaign,
  onClose,
  onSave,
}: CampaignEditDialogProps) {
  const [description, setDescription] = useState(campaign.description);
  const [imageUrl, setImageUrl] = useState(campaign.imageUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await onSave(campaign.id, { description, imageUrl });
      onClose();
    } catch (saveError) {
      setError(
        typeof saveError === "string"
          ? saveError
          : saveError instanceof Error
            ? saveError.message
            : "Could not update this campaign.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        className="relative my-auto w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-campaign-title"
      >
        <button
          className="absolute right-3 top-3 grid size-[34px] place-items-center rounded-full bg-slate-100 text-2xl leading-none text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
          onClick={onClose}
          aria-label="Close"
          disabled={isSaving}
        >
          ×
        </button>
        <span className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-emerald-800">
          Campaign details
        </span>
        <h2
          className="mt-2 pr-8 text-2xl font-bold tracking-tight text-slate-900"
          id="edit-campaign-title"
        >
          Edit campaign
        </h2>
        <p className="mb-5 mt-2 text-sm text-slate-500">{campaign.title}</p>
        <form className="grid gap-4" onSubmit={save}>
          <label className="grid gap-2 text-xs font-bold text-slate-700">
            Cover image URL
            <input
              className="min-h-[46px] rounded-lg border border-slate-200 px-3 text-[13px] font-normal text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </label>
          <label className="grid gap-2 text-xs font-bold text-slate-700">
            Description
            <textarea
              className="min-h-[140px] resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] font-normal leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={600}
            />
          </label>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800" role="alert">
              {error}
            </p>
          )}
          <p className="text-[11px] leading-relaxed text-slate-500">
            Only the image and description can be changed.
          </p>
          <button
            className="min-h-11 w-full rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
