"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Campaign } from "../lib/campaigns";
import { useCreateCampaignMutation } from "../lib/campaignApi";

type CampaignCreationProps = {
  existingIds: string[];
  onBack: () => void;
};

export default function CampaignCreation({
  existingIds,
  onBack,
}: CampaignCreationProps) {
  const [campaignTitle, setCampaignTitle] = useState("Help Sarah beat cancer");
  const [targetAmount, setTargetAmount] = useState("100000");
  const [description, setDescription] = useState(
    "Sarah is 29 and starting treatment next month. Every contribution helps cover hospital costs.",
  );
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [createError, setCreateError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [createCampaignRequest, { isLoading: isCreating }] =
    useCreateCampaignMutation();

  const campaignLink = createdCampaign?.paymentLink ?? "";

  const createCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    setDetailsError("");

    try {
      const result = await createCampaignRequest({
        title: campaignTitle.trim(),
        amount: Number(targetAmount),
        description: description.trim(),
        imageUrl: coverImageUrl.trim(),
        existingIds,
      }).unwrap();

      setCreatedCampaign(result.campaign);
      setCopied(false);
      setCopyError("");
      setDetailsError(result.updateError ?? "");
    } catch (error) {
      setCreateError(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Could not create campaign.",
      );
    }
  };

  const copyCampaignLink = async () => {
    if (!campaignLink) {
      setCopyError("No payment link was returned. Refresh campaigns and try again.");
      return;
    }

    try {
      await navigator.clipboard.writeText(campaignLink);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("Could not copy. Select and copy the link above instead.");
    }
  };

  const shareCampaign = (network: "whatsapp" | "x") => {
    const message = `Support ${createdCampaign?.title}: ${campaignLink}`;
    const shareUrl =
      network === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(message)}`
        : `https://x.com/intent/post?text=${encodeURIComponent(message)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mx-auto w-[min(610px,calc(100%-32px))] py-9 sm:py-14">
      <button
        className="mb-7 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onBack}
        disabled={isCreating}
      >
        <span aria-hidden="true">←</span> Back to causes
      </button>
      <div className="mb-7">
        <span className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-emerald-800">
          Your story can spark change
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Start your campaign
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
          Tell people what you are raising for. Your campaign link will be ready
          to share after you publish.
        </p>
      </div>

      <form
        className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        onSubmit={createCampaign}
      >
        <label className="grid gap-2 text-xs font-bold text-slate-700">
          Campaign title
          <input
            className="min-h-[46px] rounded-lg border border-slate-200 px-3 text-[13px] font-normal text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={campaignTitle}
            onChange={(event) => setCampaignTitle(event.target.value)}
            placeholder="What are you raising money for?"
            maxLength={90}
            required
          />
        </label>

        <label className="grid gap-2 text-xs font-bold text-slate-700">
          Target amount
          <span className="flex min-h-[46px] items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-500 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
            <span aria-hidden="true">₹</span>
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-[13px] font-normal text-slate-900 outline-none"
              type="number"
              min="1"
              step="1"
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
              aria-label="Target amount in rupees"
              required
            />
          </span>
        </label>

        <label className="grid gap-2 text-xs font-bold text-slate-700">
          Cover image URL <span className="font-normal text-slate-400">(optional)</span>
          <input
            className="min-h-[46px] rounded-lg border border-slate-200 px-3 text-[13px] font-normal text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            type="url"
            value={coverImageUrl}
            onChange={(event) => setCoverImageUrl(event.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </label>

        <div
          className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-emerald-900 via-emerald-700 to-lime-500 bg-cover bg-center px-4 py-4 text-center text-[11px] text-white"
          style={
            coverImageUrl
              ? { backgroundImage: `url("${coverImageUrl}")` }
              : undefined
          }
          role="img"
          aria-label={
            coverImageUrl
              ? "Campaign cover image preview"
              : "Colorful campaign cover preview"
          }
        >
          {!coverImageUrl && (
            <>
              <span className="text-3xl" aria-hidden="true">
                ✦
              </span>
              <span>Without a link, a gradient cover will be used.</span>
            </>
          )}
        </div>

        <label className="grid gap-2 text-xs font-bold text-slate-700">
          Description
          <textarea
            className="min-h-[120px] resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] font-normal leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Share why this cause matters..."
            rows={5}
            maxLength={600}
            required
          />
        </label>

        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
          <span className="text-emerald-700" aria-hidden="true">
            ⓘ
          </span>
          Campaigns are saved to FundFlow and include a Razorpay payment link.
        </p>
        {createError && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800"
            role="alert"
          >
            {createError}
          </p>
        )}
        <button
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-75"
          type="submit"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating your campaign…
            </>
          ) : (
            <>
              Create campaign <span aria-hidden="true">↗</span>
            </>
          )}
        </button>
      </form>

      {createdCampaign && (
        <div
          className="fixed inset-0 z-10 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCreatedCampaign(null);
            }
          }}
        >
          <section
            className="relative my-auto w-full max-w-[480px] rounded-2xl border border-white/80 bg-white p-6 text-center shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <button
              className="absolute right-3 top-3 grid size-[34px] place-items-center rounded-full bg-slate-100 text-2xl leading-none text-slate-500 transition hover:bg-slate-200"
              onClick={() => setCreatedCampaign(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="mx-auto mb-4 grid size-[52px] place-items-center rounded-full bg-emerald-50 text-2xl font-bold text-emerald-700">
              ✓
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-emerald-800">
              The first step is yours
            </span>
            <h2
              className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
              id="success-title"
            >
              Your campaign is live!
            </h2>
            <p className="mx-auto mb-5 mt-2 text-[13px] leading-relaxed text-slate-500">
              Share your campaign and invite people to support{" "}
              <strong className="text-slate-800">{createdCampaign.title}</strong>.
            </p>
            {detailsError && (
              <p
                className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-left text-xs leading-relaxed text-amber-950"
                role="alert"
              >
                Campaign created, but its description or image could not be
                saved: {detailsError}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="min-h-11 min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700"
                aria-label="Campaign link"
                value={campaignLink}
                readOnly
              />
              <button
                className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
                onClick={copyCampaignLink}
                disabled={!campaignLink}
              >
                {copied ? "Copied!" : "Copy payment link"}
              </button>
            </div>
            {copyError && (
              <p className="mt-2 text-left text-xs text-red-700" role="status">
                {copyError}
              </p>
            )}

            <div className="my-4 flex min-h-20 items-center gap-4 rounded-xl border border-slate-200 p-3 text-left">
              <div
                className="grid size-[54px] shrink-0 place-items-center border-[5px] border-white bg-[linear-gradient(90deg,#17241f_50%,transparent_50%)_0_0/10px_10px,linear-gradient(#17241f_50%,transparent_50%)_0_0/10px_10px,#fff] text-xs font-extrabold text-white outline outline-1 outline-slate-200"
                aria-hidden="true"
              >
                F
              </div>
              <div>
                <strong className="text-xs text-slate-800">QR preview</strong>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  QR code generation is not included yet.
                </p>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-2 gap-2">
              <button
                className="min-h-[42px] rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => shareCampaign("whatsapp")}
              >
                Share on WhatsApp
              </button>
              <button
                className="min-h-[42px] rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => shareCampaign("x")}
              >
                Share on X
              </button>
            </div>
            <button
              className="min-h-11 w-full rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800"
              onClick={() => {
                setCreatedCampaign(null);
                onBack();
              }}
            >
              View your campaign
            </button>
            <p className="mt-3 text-[10px] text-slate-500">
              Payment link created by the campaign API
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
