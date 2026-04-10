import "server-only";

import { getSanityClient } from "./client";
import { ledaPageQuery } from "./queries";

export const getLedaPage = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(ledaPageQuery);
  } catch (error) {
    console.error("[sanity] ledaPage fetch failed", error);
    return null;
  }
};
