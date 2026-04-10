import "server-only";

import { getSanityClient } from "./client";
import { aboutPageQuery } from "./queries";

export const getAboutPage = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(aboutPageQuery);
  } catch (error) {
    console.error("[sanity] aboutPage fetch failed", error);
    return null;
  }
};
