import "server-only";

import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2026-03-01";
const token = process.env.SANITY_TOKEN || undefined;
const useCdnEnv = process.env.SANITY_USE_CDN;
const useCdn =
  typeof useCdnEnv === "string"
    ? useCdnEnv.toLowerCase() !== "false"
    : true;

let client = null;

if (projectId && dataset) {
  client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: token ? false : useCdn,
    token,
  });
}

export function getSanityClient() {
  return client;
}
