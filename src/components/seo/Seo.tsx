import { Helmet } from "react-helmet-async";

const SITE_ORIGIN = "https://agent.studio.fluxrow.space";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  /** Defaults to "website". Use "article" for blog posts, etc. */
  ogType?: "website" | "article";
  /** Override OG image (absolute URL). Falls back to the sitewide one in index.html. */
  image?: string;
  noindex?: boolean;
}

/**
 * Per-route head tags. Sets a unique <title>, <meta description>,
 * canonical, and og:* for the current route. Keeps the sitewide
 * og:* in index.html as fallback for non-JS social crawlers.
 */
export function Seo({ title, description, path, ogType = "website", image, noindex }: SeoProps) {
  const url = `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}
    </Helmet>
  );
}
