import Image from "next/image";
import { useState } from "react";
import type { Campaign } from "../lib/campaigns";
import { formatRupees } from "../lib/campaigns";
import productLogo from "../../public/ProductLogo.png";

type CampaignListingProps = {
  campaigns: Campaign[];
  isLoading: boolean;
  isFetching: boolean;
  apiError: string | null;
  onRetry: () => void;
  onDonate: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
};

const artworkClasses: Record<Campaign["color"], string> = {
  lavender: "from-slate-950 via-indigo-950 to-violet-700",
  green: "from-teal-950 via-emerald-800 to-lime-500",
  blue: "from-blue-950 via-blue-800 to-sky-500",
  peach: "from-orange-950 via-rose-800 to-orange-400",
  rose: "from-rose-950 via-rose-800 to-pink-400",
  mint: "from-emerald-950 via-emerald-800 to-lime-500",
};

function CampaignCard({
  campaign,
  apiError,
  isLoading,
  onDonate,
  onEdit,
}: {
  campaign: Campaign;
  apiError: string | null;
  isLoading: boolean;
  onDonate: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const percentage =
    campaign.target > 0
      ? Math.round((campaign.raised / campaign.target) * 100)
      : 0;
  const progress = Math.min(100, Math.max(0, percentage));
  const imageUrl = campaign.imageUrl;

  return (
    <article
      className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      id={`campaign-${campaign.id}`}
    >
      <div
        className={`relative h-[180px] flex-none overflow-hidden bg-gradient-to-br ${artworkClasses[campaign.color]}`}
      >
        {imageUrl && failedImageUrl !== imageUrl && (
          <Image
            src={imageUrl}
            alt={`${campaign.title} cover`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            unoptimized
            className="object-cover"
            onError={() => setFailedImageUrl(imageUrl)}
          />
        )}
        <span className="absolute left-3.5 top-3.5 z-10 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-slate-800">
          {campaign.category}
        </span>
        <button
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onEdit(campaign)}
          aria-label="Edit campaign"
          disabled={Boolean(apiError) || isLoading}
          title={
            apiError
              ? "Editing is unavailable while campaigns cannot be loaded"
              : "Edit campaign"
          }
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-[18px]">
        <h3 className="line-clamp-2 min-h-[52px] text-xl font-bold leading-[1.3] tracking-tight text-slate-900">
          {campaign.title}
        </h3>
        <p
          className="mt-2 line-clamp-2 min-h-[70px] text-xs leading-[18px] text-slate-500"
          title={campaign.description}
        >
          {campaign.description}
        </p>

        <div className="mt-auto flex flex-col pt-5">
          <div
            className="h-[7px] overflow-hidden rounded-full bg-emerald-50"
            role="progressbar"
            aria-label={`${progress}% funded`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className="block h-full rounded-full bg-emerald-700 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2.5 flex min-h-6 items-center justify-between gap-2">
            <p className="whitespace-nowrap text-xs text-slate-600">
              <strong className="font-bold text-slate-900">
                {formatRupees(campaign.raised)}
              </strong>{" "}
              raised of{" "}
              <strong className="font-bold text-slate-900">
                {formatRupees(campaign.target)}
              </strong>
            </p>
            {percentage >= 100 && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">
                Goal reached
              </span>
            )}
          </div>
          <button
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onDonate(campaign)}
            disabled={!campaign.paymentLink}
            title={
              campaign.paymentLink
                ? "Continue to Razorpay checkout"
                : "Payment link is unavailable for this campaign"
            }
          >
            Donate Now <span aria-hidden="true">↗</span>
          </button>
          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-600">
            <span className="text-emerald-700" aria-hidden="true">
              ◈
            </span>
            {campaign.paymentLink
              ? "Secure checkout by Razorpay"
              : "Checkout unavailable for this campaign"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function CampaignListing({
  campaigns,
  isLoading,
  isFetching,
  apiError,
  onRetry,
  onDonate,
  onEdit,
}: CampaignListingProps) {
  return (
    <>
      <section className="relative grid min-h-[350px] place-items-center overflow-hidden bg-slate-950 px-6 py-16 text-center text-white sm:min-h-[390px]">
        <div
          className="pointer-events-none absolute -left-24 -top-56 size-[380px] rounded-full border border-emerald-200/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-80 -right-36 size-[490px] rounded-full border border-emerald-200/10"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute right-[15%] top-16 text-3xl text-emerald-200/40"
          aria-hidden="true"
        >
          ✳
        </span>
        <div className="relative z-10 max-w-3xl">
          <span className="text-[11px] font-extrabold uppercase tracking-[1.45px] text-emerald-200">
            Small acts. Lasting impact.
          </span>
          <h1 className="mx-auto my-4 max-w-2xl text-[clamp(2.4rem,5.2vw,3.9rem)] font-bold leading-[1.08] tracking-[-0.055em]">
            Empower causes you care about.
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Give directly to people and projects that matter. Every contribution
            moves a good cause forward.
          </p>
          <div className="mx-auto mt-6 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-800 px-4 py-2 text-[10px] text-slate-200 sm:text-xs">
            <span className="text-lg text-emerald-200" aria-hidden="true">
              ⌑
            </span>
            UPI · Cards · Netbanking
            <span className="size-1 rounded-full bg-slate-400" />
            Checkout powered by Razorpay
          </div>
        </div>
      </section>

      <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-11 sm:w-[min(1120px,calc(100%-48px))] sm:py-16">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-emerald-800">
              Make a difference today
            </span>
            <h2 className="mt-1 text-[26px] font-bold tracking-tight text-slate-900 sm:text-[29px]">
              Explore causes
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            <p className="mb-1 text-xs text-slate-500">
              {apiError
                ? "Campaigns unavailable"
                : isLoading
                  ? "Loading campaigns…"
                  : `${campaigns.length} campaigns looking for a helping hand`}
            </p>
            <button
              className="self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50 sm:self-auto"
              onClick={onRetry}
              disabled={isFetching}
            >
              {isFetching ? "Refreshing…" : apiError ? "Try again" : "Refresh"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid min-h-48 place-items-center rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600"
            role="status"
          >
            <div className="flex items-center gap-3">
              <span
                className="size-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700"
                aria-hidden="true"
              />
              Loading campaigns…
            </div>
          </div>
        ) : apiError ? (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-10 text-center"
            role="alert"
          >
            <h3 className="text-base font-bold text-amber-950">
              We couldn’t load the campaigns
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-amber-900">
              {apiError}
            </p>
            <p className="mt-2 text-xs text-amber-800">
              Check your connection and try again.
            </p>
          </div>
        ) : campaigns.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
            No campaigns are available yet. Start a fundraiser to add one.
          </p>
        ) : (
          <div className="grid items-stretch grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                campaign={campaign}
                apiError={apiError}
                isLoading={isLoading}
                onDonate={onDonate}
                onEdit={onEdit}
                key={campaign.id}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="flex flex-col gap-2 border-t border-slate-200 bg-white px-5 py-5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-[max(6.2vw,calc((100vw-1200px)/2))]">
        <a
          className="inline-flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900"
          href="#top"
        >
          <Image src={productLogo} width={26} height={26} alt="" />
          FundFlow
        </a>
        <span>A little kindness can change everything.</span>
        <span>Payments open securely through Razorpay</span>
      </footer>
    </>
  );
}
