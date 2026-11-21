"use client";

import type { Campaign } from "../lib/campaigns";
import { formatRupees } from "../lib/campaigns";

type DonationDialogProps = {
  campaign: Campaign | null;
  onClose: () => void;
};

export default function DonationDialog({
  campaign,
  onClose,
}: DonationDialogProps) {
  if (!campaign) return null;

  return (
    <div
      className="fixed inset-0 z-10 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="relative my-auto w-full max-w-[440px] rounded-2xl border border-white/80 bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
      >
        <button
          className="absolute right-3 top-3 grid size-[34px] place-items-center rounded-full bg-slate-100 text-2xl leading-none text-slate-500 transition hover:bg-slate-200"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <span className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-emerald-800">
          {campaign.category} campaign
        </span>
        <h2
          className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
          id="donation-title"
        >
          Support this cause
        </h2>
        <p className="mb-5 mt-2 text-[13px] leading-relaxed text-slate-500">
          {campaign.title}
        </p>
        <div className="mb-5 rounded-xl bg-emerald-50 p-4">
          <p className="text-xs leading-relaxed text-emerald-950">
            You’ll continue to Razorpay’s secure checkout. Your contribution
            will be reflected here after payment is confirmed.
          </p>
        </div>
        <p className="mb-5 flex items-center justify-between text-xs text-slate-500">
          <span>Campaign goal</span>
          <strong className="text-slate-900">
            {formatRupees(campaign.target)}
          </strong>
        </p>
        <a
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          href={campaign.paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
        >
          Continue to secure checkout <span aria-hidden="true">↗</span>
        </a>
        <p className="mt-3 text-center text-[10px] text-slate-500">
          Payment status is updated by the campaign webhook.
        </p>
      </section>
    </div>
  );
}
