/**
 * Inline SVG data-URI logos for common platforms.
 * Shared across integrations page, assistant connection cards, etc.
 */
export const PLATFORM_LOGOS: Record<string, string> = {
  gmail: "/images/google-gmail-svgrepo-com.svg",
  googlecalendar: "/images/google-calendar-svgrepo-com.svg",
  googlesheets:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%230F9D58' x='2' y='2' width='20' height='20' rx='3'/%3E%3Cpath fill='%23fff' d='M7 6h10v2H7zm0 4h10v2H7zm0 4h10v2H7z'/%3E%3C/svg%3E",
  slack: "/images/slack-svgrepo-com.svg",
  github:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z'/%3E%3C/svg%3E",
  notion:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M4 3.5C4 2.672 4.56 2 5.25 2h9.792L20.25 7v13.5c0 .828-.56 1.5-1.25 1.5H5.25C4.56 22 4 21.328 4 20.5zM6 5.5v15h12v-11h-4.5a.5.5 0 01-.5-.5V5.5zm9 .707V9h2.793zM7.5 12a.5.5 0 01.5-.5h8a.5.5 0 010 1H8a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h8a.5.5 0 010 1H8a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h5a.5.5 0 010 1H8a.5.5 0 01-.5-.5z'/%3E%3C/svg%3E",
  twitter:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E",
  discord:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%235865F2' d='M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z'/%3E%3C/svg%3E",
  linear:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%235E6AD2' d='M3.357 12.652a9.59 9.59 0 00.384 1.57l6.937-6.937A9.59 9.59 0 0012.652 3.357L3.357 12.652zM2.07 9.94a9.632 9.632 0 011.202-3.16l6.948 6.948A9.632 9.632 0 012.07 9.94zm.86-4.29A9.64 9.64 0 0112 2c5.316 0 9.627 4.273 9.64 9.571L2.93 5.65zM21.64 12.43A9.64 9.64 0 0112 22c-5.316 0-9.627-4.273-9.64-9.571L21.64 12.43zm-.71 1.22a9.632 9.632 0 01-1.202 3.16l-6.948-6.948a9.632 9.632 0 018.15 3.788zm-1.573 4.29a9.59 9.59 0 01-6.705 3.703l-5.376-5.376a9.59 9.59 0 013.703-6.705l8.378 8.378z'/%3E%3C/svg%3E",
  airtable: "/images/airtable-svgrepo-com.svg",
  asana: "/images/asana-svgrepo-com.svg",
  hubspot: "/images/hubspot-svgrepo-com.svg",
  stripe: "/images/stripe-v2-svgrepo-com.svg",
  todoist: "/images/todoist-svgrepo-com.svg",
  reddit:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle fill='%23FF4500' cx='12' cy='12' r='10'/%3E%3Cpath fill='%23fff' d='M16.5 13.38c0-1-.81-1.8-1.8-1.8-.5 0-.94.2-1.27.52A7.06 7.06 0 0010 11.14c0-.04.02-.07.03-.1l1.16-3.67 2.55.6a1.2 1.2 0 101.13-.82l-2.84-.67a.6.6 0 00-.7.42l-1.3 4.12c-1.42.1-2.7.56-3.66 1.26A1.79 1.79 0 005.1 11.58c-1 0-1.8.81-1.8 1.8 0 .65.35 1.21.86 1.53-.03.17-.05.34-.05.52 0 2.65 3.08 4.8 6.89 4.8s6.89-2.15 6.89-4.8c0-.18-.02-.35-.05-.52.51-.32.86-.88.86-1.53zM8 14.2a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4zm6.4 2.63c-.78.78-2.26.84-2.4.84s-1.62-.06-2.4-.84a.36.36 0 01.5-.5c.49.49 1.53.66 1.9.66s1.41-.17 1.9-.66a.36.36 0 01.5.5zM16 14.2a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4z'/%3E%3C/svg%3E",
  googledrive:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M15.07 21.5H8.93l-1.5-2.6h8.14z'/%3E%3Cpath fill='%230F9D58' d='M7.43 18.9L4.36 13.6l1.5-2.6 3.07 5.3z'/%3E%3Cpath fill='%23FFCD40' d='M20.64 13.6L12 2.5l-1.5 2.6 7.14 8.5z'/%3E%3C/svg%3E",
  googledocs:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%234285F4' x='4' y='2' width='16' height='20' rx='2'/%3E%3Cpath fill='%23fff' d='M7 7h10v1.5H7zm0 3.5h10V12H7zm0 3.5h7v1.5H7z'/%3E%3C/svg%3E",
  spotify:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle fill='%231DB954' cx='12' cy='12' r='10'/%3E%3Cpath fill='%23fff' d='M16.5 16.32a.62.62 0 01-.86.21c-2.35-1.44-5.3-1.76-8.79-.97a.62.62 0 11-.28-1.22c3.82-.87 7.1-.49 9.72 1.12a.62.62 0 01.21.86zm1.15-2.6a.78.78 0 01-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 11-.45-1.5c3.63-1.1 8.14-.57 11.23 1.33a.78.78 0 01.26 1.08zm.1-2.7C14.6 9.05 9.18 8.85 6.14 9.77a.94.94 0 11-.54-1.8c3.5-1.06 9.3-.85 12.97 1.35a.94.94 0 01-.82 1.7z'/%3E%3C/svg%3E",
  youtube:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23FF0000' d='M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81z'/%3E%3Cpath fill='%23fff' d='M9.75 15.02l6.28-3.02-6.28-3.02v6.04z'/%3E%3C/svg%3E",
  trello:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%230052CC' x='2' y='2' width='20' height='20' rx='3'/%3E%3Crect fill='%23fff' x='5' y='5' width='5.5' height='13' rx='1'/%3E%3Crect fill='%23fff' x='13.5' y='5' width='5.5' height='8' rx='1'/%3E%3C/svg%3E",
  jira: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%232684FF' d='M11.53 2c0 4.97-4.03 9-9 9h-.03a9 9 0 009 9 9 9 0 009-9c0-4.97-4.03-9-9-9h.03z'/%3E%3C/svg%3E",
  dropbox:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%230061FF' d='M7.08 4L2 7.5l5.08 3.5L12 7.5zm9.84 0L12 7.5l4.92 3.5L22 7.5zM2 14.5L7.08 18 12 14.5 7.08 11zm14.92-3.5L12 14.5 16.92 18 22 14.5zM7.08 19.33L12 15.83l4.92 3.5L12 22.83z'/%3E%3C/svg%3E",
  composio:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle fill='%238E24AA' cx='12' cy='12' r='10'/%3E%3Cpath fill='%23fff' d='M8 8h8v8H8z' rx='2'/%3E%3C/svg%3E",
};

const COMPOSIO_LOGO_CDN = "https://logos.composio.dev/api";

/** Slugs that differ from the normalized (lowercase, no dashes) form on the Composio CDN */
const SLUG_TO_COMPOSIO: Record<string, string> = {
  googlemaps: "google_maps",
};

export const DASHBOARD_HOT_LOGO_SLUGS = [
  "gmail",
  "googlecalendar",
  "slack",
  "github",
  "notion",
  "linear",
  "airtable",
  "asana",
  "hubspot",
  "stripe",
  "todoist",
  "trello",
  "discord",
  "googledrive",
  "googlesheets",
  "googledocs",
  "googletasks",
  "googlemeet",
  "jira",
  "confluence",
  "salesforce",
  "mailchimp",
  "outlook",
  "pipedrive",
  "zendesk",
  "zoom",
  "youtube",
  "spotify",
  "box",
  "microsoft_teams",
] as const;

export function normalizeAppSlug(appSlug: string): string {
  return appSlug.toLowerCase().replace(/[\s-_]/g, "");
}

/**
 * Get a logo for an app slug.
 * Tries inline data-URI first, then falls back to Composio's logo CDN.
 */
export function getAppLogo(appSlug: string): string {
  const key = normalizeAppSlug(appSlug);
  if (PLATFORM_LOGOS[key]) return PLATFORM_LOGOS[key];
  // Prefix match: "discordbot" → "discord", "googlecalendarv2" → "googlecalendar"
  for (const k of Object.keys(PLATFORM_LOGOS)) {
    if (key.startsWith(k)) return PLATFORM_LOGOS[k];
  }
  // Fallback to Composio CDN — works for all Composio-supported apps
  const composioSlug = SLUG_TO_COMPOSIO[key] || key;
  return `${COMPOSIO_LOGO_CDN}/${composioSlug}`;
}

export function getDashboardHotLogoUrls(): string[] {
  return DASHBOARD_HOT_LOGO_SLUGS.map((slug) => getAppLogo(slug));
}
