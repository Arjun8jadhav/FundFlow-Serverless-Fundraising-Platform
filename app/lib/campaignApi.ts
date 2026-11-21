import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Campaign } from "./campaigns";

function getCampaignsEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL?.replace(/\/+$/, "");
  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_CAMPAIGNS_API_URL is not configured. Set it in .env.local.",
    );
  }
  return endpoint;
}

const campaignPresentation = [
  { category: "Medical", color: "lavender", symbol: "＋" },
  { category: "Education", color: "green", symbol: "✳" },
  { category: "Animals", color: "peach", symbol: "♡" },
  { category: "Environment", color: "mint", symbol: "✿" },
  { category: "Community", color: "blue", symbol: "≈" },
] as const;

export type CreateCampaignInput = {
  title: string;
  amount: number;
  description: string;
  imageUrl: string;
  existingIds: string[];
};

export type CampaignDetails = {
  description?: string;
  imageUrl?: string;
};

export type CreateCampaignResult = {
  campaign: Campaign;
  updateError?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapResponse(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return unwrapResponse(JSON.parse(value) as unknown);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("The campaign API returned invalid JSON.");
      }
      throw error;
    }
  }

  if (!isRecord(value)) return value;
  if ("campaign" in value) return unwrapResponse(value.campaign);
  if ("data" in value) return unwrapResponse(value.data);
  if (typeof value.body === "string") return unwrapResponse(value.body);
  return value;
}

function getCategory(title: string, description: string) {
  const content = `${title} ${description}`.toLowerCase();
  if (/cancer|surgery|medical|treatment|health/.test(content)) {
    return campaignPresentation[0];
  }
  if (/student|school|book|education|college|fee/.test(content)) {
    return campaignPresentation[1];
  }
  if (/dog|animal|shelter|pet/.test(content)) return campaignPresentation[2];
  if (/tree|river|environment|plant|forest/.test(content)) {
    return campaignPresentation[3];
  }
  return campaignPresentation[4];
}

function toCampaign(value: unknown, fallback?: { title: string; amount: number }) {
  const record = unwrapResponse(value);
  if (!isRecord(record)) {
    throw new Error("The campaign API returned an invalid campaign.");
  }

  const id =
    typeof record.campaignId === "string"
      ? record.campaignId
      : typeof record.id === "string"
        ? record.id
        : "";
  const title =
    typeof record.title === "string" ? record.title : fallback?.title ?? "";
  const target = Number(record.targetAmount ?? record.amount ?? fallback?.amount);
  const raised = Number(record.raisedAmount ?? record.raised ?? 0);
  const description =
    typeof record.description === "string" ? record.description : "";
  const imageUrl = typeof record.imageUrl === "string" ? record.imageUrl : "";
  const paymentLink =
    typeof record.paymentLink === "string" ? record.paymentLink : "";

  if (!id || !title || !Number.isFinite(target) || target <= 0) {
    throw new Error("The campaign API returned incomplete campaign details.");
  }

  const presentation = getCategory(title, description);
  return {
    id,
    title,
    category: presentation.category,
    raised: Number.isFinite(raised) ? raised : 0,
    target,
    description,
    symbol: presentation.symbol,
    color: presentation.color,
    imageUrl: imageUrl || undefined,
    paymentLink: paymentLink || undefined,
  } satisfies Campaign;
}

async function checkResponse(response: Response, action: string) {
  if (response.ok) return;

  const detail = await response.text();
  throw new Error(
    `${action} failed (${response.status})${detail ? `: ${detail}` : ""}`,
  );
}

async function readJson(response: Response): Promise<unknown> {
  const body = await response.text();
  if (!body) return null;

  try {
    return JSON.parse(body) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("The campaign API returned invalid JSON.");
    }
    throw error;
  }
}

export async function fetchCampaigns(signal?: AbortSignal): Promise<Campaign[]> {
  const response = await fetch(getCampaignsEndpoint(), {
    cache: "no-store",
    signal,
  });
  await checkResponse(response, "Loading campaigns");

  const payload = unwrapResponse(await readJson(response));
  if (!Array.isArray(payload)) {
    throw new Error("The campaign API response was not a campaign list.");
  }

  return payload.map((campaign) => toCampaign(campaign));
}

async function updateCampaignDetails(
  campaignId: string,
  details: CampaignDetails,
): Promise<void> {
  const response = await fetch(
    `${getCampaignsEndpoint()}/${encodeURIComponent(campaignId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    },
  );
  await checkResponse(response, "Updating campaign details");
}

async function createCampaign(
  input: CreateCampaignInput,
): Promise<CreateCampaignResult> {
  const response = await fetch(getCampaignsEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.title, amount: input.amount }),
  });
  await checkResponse(response, "Creating campaign");

  const payload = unwrapResponse(await readJson(response));
  let created: Campaign | undefined;

  if (isRecord(payload)) {
    try {
      created = toCampaign(payload, {
        title: input.title,
        amount: input.amount,
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
    }
  }

  if (!created?.paymentLink) {
    const refreshedCampaigns = await fetchCampaigns();
    const existingIds = new Set(input.existingIds);
    created = refreshedCampaigns.find(
      (campaign) =>
        !existingIds.has(campaign.id) &&
        campaign.title === input.title &&
        campaign.target === input.amount,
    );
  }

  if (!created) {
    throw new Error(
      "The campaign was submitted, but its payment details could not be loaded. Refresh the campaign list before retrying.",
    );
  }

  const details = {
    description: input.description,
    imageUrl: input.imageUrl,
  };
  if (!details.description && !details.imageUrl) return { campaign: created };

  try {
    await updateCampaignDetails(created.id, details);
    return { campaign: { ...created, ...details } };
  } catch (error) {
    return {
      campaign: created,
      updateError:
        error instanceof Error
          ? error.message
          : "Campaign created, but the description and image could not be saved.",
    };
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const campaignApi = createApi({
  reducerPath: "campaignApi",
  baseQuery: fakeBaseQuery<string>(),
  tagTypes: ["Campaign"],
  endpoints: (builder) => ({
    getCampaigns: builder.query<Campaign[], void>({
      async queryFn(_arg, { signal }) {
        try {
          return { data: await fetchCampaigns(signal) };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Could not load campaigns."),
          };
        }
      },
      providesTags: ["Campaign"],
    }),
    updateCampaignDetails: builder.mutation<
      void,
      { campaignId: string; details: CampaignDetails }
    >({
      async queryFn({ campaignId, details }) {
        try {
          await updateCampaignDetails(campaignId, details);
          return { data: undefined };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Could not update this campaign."),
          };
        }
      },
      invalidatesTags: ["Campaign"],
    }),
    createCampaign: builder.mutation<CreateCampaignResult, CreateCampaignInput>({
      async queryFn(input) {
        try {
          return { data: await createCampaign(input) };
        } catch (error) {
          return {
            error: getErrorMessage(error, "Could not create campaign."),
          };
        }
      },
      invalidatesTags: ["Campaign"],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useUpdateCampaignDetailsMutation,
  useCreateCampaignMutation,
} = campaignApi;
