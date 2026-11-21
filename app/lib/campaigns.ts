export type Campaign = {
  id: string;
  title: string;
  category: string;
  raised: number;
  target: number;
  description: string;
  symbol: string;
  color: "lavender" | "green" | "blue" | "peach" | "rose" | "mint";
  imageUrl?: string;
  paymentLink?: string;
};

export function formatRupees(amount: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(amount)}`;
}

export function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
