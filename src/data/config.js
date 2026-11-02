// Tiers = the NOW passes/memberships. Edit to match what you actually pay for.
export const TIERS = [
  { id: "entertainment", label: "Entertainment" },
  { id: "cinema", label: "Cinema" },
  { id: "sports", label: "Sports" },
  { id: "hbomax", label: "HBO Max" },
  { id: "kids", label: "Kids" },
];

// Channels and the tier needed to watch them.
export const CHANNELS = [
  { id: "atlantic", label: "Sky Atlantic", tier: "entertainment" },
  { id: "max", label: "Sky Max", tier: "entertainment" },
  { id: "witness", label: "Sky Witness", tier: "entertainment" },
  { id: "crime", label: "Sky Crime", tier: "entertainment" },
  { id: "comedy", label: "Sky Comedy", tier: "entertainment" },
  { id: "documentaries", label: "Sky Documentaries", tier: "entertainment" },
  { id: "cinema", label: "Sky Cinema", tier: "cinema" },
  { id: "sports", label: "Sky Sports", tier: "sports" },
  { id: "hbomax", label: "HBO Max", tier: "hbomax" },
];

// Where "Open in NOW" sends you. {title} is replaced with the encoded title.
// Change this if NOW's search URL changes.
export const NOW_SEARCH_URL = "https://www.nowtv.com/search?q={title}";
