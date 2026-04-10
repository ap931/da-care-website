import "server-only";

import { getSanityClient } from "./client";
import { ledaBusinessPageQuery } from "./queries";

export const getLedaBusinessPage = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(ledaBusinessPageQuery);
  } catch (error) {
    console.error("[sanity] ledaBusinessPage fetch failed", error);
    return null;
  }
};
