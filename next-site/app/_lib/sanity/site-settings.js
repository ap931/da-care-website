import "server-only";

import { getSanityClient } from "./client";
import { siteSettingsQuery } from "./queries";

export const getSiteSettings = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(siteSettingsQuery);
  } catch (error) {
    console.error("[sanity] siteSettings fetch failed", error);
    return null;
  }
};
