import "server-only";

import { getSanityClient } from "./client";
import { homePageQuery } from "./queries";

export const getHomePage = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(homePageQuery);
  } catch (error) {
    console.error("[sanity] homePage fetch failed", error);
    return null;
  }
};
