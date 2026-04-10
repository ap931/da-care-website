import "server-only";

import { getSanityClient } from "./client";
import { contactPageQuery } from "./queries";

export const getContactPage = async () => {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(contactPageQuery);
  } catch (error) {
    console.error("[sanity] contactPage fetch failed", error);
    return null;
  }
};
