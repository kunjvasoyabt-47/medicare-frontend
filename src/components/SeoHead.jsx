import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const FALLBACK_ORIGIN = "https://example.com";

const normalizeUrl = (value) => {
  if (!value) return FALLBACK_ORIGIN;
  return value.replace(/\/+$/, "");
};

const SITE_URL = normalizeUrl(
  import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : FALLBACK_ORIGIN),
);
const SITE_NAME = "Medicare";
const DEFAULT_IMAGE = "/og-preview-v2.png";

const routeMeta = [
  {
    match: (path) => path === "/login" || path === "/",
    title: "Login | Medicare",
    description:
      "Securely log in to Medicare and access your healthcare dashboard.",
    robots: "index,follow",
  },
  {
    match: (path) => path === "/register",
    title: "Register | Medicare",
    description:
      "Create your Medicare account to manage health records and post-discharge support.",
    robots: "index,follow",
  },
  {
    match: (path) => path.startsWith("/admin/") || path === "/welcome-admin",
    title: "Admin Portal | Medicare",
    description:
      "Secure administrative area for Medicare healthcare operations.",
    robots: "noindex,nofollow",
  },
  {
    match: (path) => path.startsWith("/patient/") || path === "/welcome-patient",
    title: "Patient Portal | Medicare",
    description: "Secure patient area for records, discharge history, and profile.",
    robots: "noindex,nofollow",
  },
  {
    match: (path) => path.startsWith("/admin/patient/") || path.startsWith("/admin/discharge/") || path.startsWith("/patient/discharge/"),
    title: "Medical Details | Medicare",
    description: "Protected medical details in the Medicare portal.",
    robots: "noindex,nofollow",
  },
];

const getMetaForPath = (pathname) => {
  const hit = routeMeta.find((entry) => entry.match(pathname));
  if (hit) return hit;

  return {
    title: "Medicare | Secure Healthcare Portal",
    description:
      "Medicare portal for secure access to healthcare data and discharge summaries.",
    robots: "noindex,nofollow",
  };
};

export default function SeoHead() {
  const location = useLocation();
  const meta = getMetaForPath(location.pathname);
  const canonical = `${SITE_URL}${location.pathname}`;
  const ogImage = `${SITE_URL}${DEFAULT_IMAGE}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={meta.robots} />

      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Medicare activity icon and healthcare portal"
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImage} />
      <meta
        name="twitter:image:alt"
        content="Medicare activity icon and healthcare portal"
      />
    </Helmet>
  );
}
