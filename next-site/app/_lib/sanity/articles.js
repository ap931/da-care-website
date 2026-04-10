import "server-only";

import { getSanityClient } from "./client";
import { articlesQuery } from "./queries";

export const getArticles = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(articlesQuery);
  } catch (error) {
    console.error("[sanity] articles fetch failed", error);
    return null;
  }
};
