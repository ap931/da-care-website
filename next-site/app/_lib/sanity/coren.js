import "server-only";

import { getSanityClient } from "./client";
import { corenPageQuery } from "./queries";

export const getCorenPage = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(corenPageQuery);
  } catch (error) {
    console.error("[sanity] corenPage fetch failed", error);
    return null;
  }
};
