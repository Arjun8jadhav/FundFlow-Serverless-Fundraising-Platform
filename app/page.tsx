"use client";

import Image from "next/image";
import { useState } from "react";
import CampaignEditDialog, {
  type CampaignDetailsInput,
} from "./components/CampaignEditDialog";
import CampaignCreation from "./components/CampaignCreation";
import CampaignListing from "./components/CampaignListing";
import DonationDialog from "./components/DonationDialog";
import StoreProvider from "./StoreProvider";
import {
  useGetCampaignsQuery,
  useUpdateCampaignDetailsMutation,
} from "./lib/campaignApi";
import type { Campaign } from "./lib/campaigns";
import productLogo from "../public/ProductLogo.png";

const noAction = () => {};
const noCampaignAction = () => {};

export default function Home() {
  const [screen, setScreen] = useState<"explore" | "create">("explore");

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex h-[66px] items-center justify-between border-b border-slate-100 bg-white px-[max(18px,6.2vw)] sm:h-[76px]">
        <button
          className="inline-flex items-center gap-2.5 rounded-lg text-[17px] font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 sm:text-[19px]"
          onClick={() => setScreen("explore")}
          aria-label="FundFlow home"
        >
          <Image
            src={productLogo}
            className="size-[30px] rounded-lg sm:size-[34px]"
            width={34}
            height={34}
            alt=""
            priority
          />
          <span className="font-bold">FundFlow</span>
        </button>
        {screen === "explore" && (
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:min-h-[46px] sm:px-5 sm:text-sm"
            onClick={() => setScreen("create")}
          >
            Start a fundraiser <span aria-hidden="true">↗</span>
          </button>
        )}
      </header>

      <StoreProvider
        fallback={
          <CampaignListing
            campaigns={[]}
            isLoading
            isFetching
            apiError={null}
            onRetry={noAction}
            onDonate={noCampaignAction}
            onEdit={noCampaignAction}
          />
        }
      >
        <CampaignExperience screen={screen} onScreenChange={setScreen} />
      </StoreProvider>
    </div>
  );
}

function CampaignExperience({
  screen,
  onScreenChange,
}: {
  screen: "explore" | "create";
  onScreenChange: (screen: "explore" | "create") => void;
}) {
  const {
    data: liveCampaigns,
    error: campaignError,
    isLoading,
    isFetching,
    refetch,
  } = useGetCampaignsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const campaigns = liveCampaigns ?? [];
  const apiError = campaignError
    ? typeof campaignError === "string"
      ? campaignError
      : "Could not load campaigns."
    : null;
  const [donatingTo, setDonatingTo] = useState<Campaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [updateCampaignDetails] = useUpdateCampaignDetailsMutation();

  const saveCampaignDetails = async (
    campaignId: string,
    details: CampaignDetailsInput,
  ) => {
    await updateCampaignDetails({ campaignId, details }).unwrap();
    setEditingCampaign(null);
  };

  return (
    <>
      {screen === "explore" ? (
        <CampaignListing
          campaigns={campaigns}
          isLoading={isLoading}
          isFetching={isFetching}
          apiError={apiError}
          onRetry={() => void refetch()}
          onDonate={setDonatingTo}
          onEdit={setEditingCampaign}
        />
      ) : (
        <CampaignCreation
          existingIds={campaigns.map((campaign) => campaign.id)}
          onBack={() => onScreenChange("explore")}
        />
      )}

      {editingCampaign && (
        <CampaignEditDialog
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSave={saveCampaignDetails}
        />
      )}

      <DonationDialog campaign={donatingTo} onClose={() => setDonatingTo(null)} />
    </>
  );
}
