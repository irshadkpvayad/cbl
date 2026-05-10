import { Helmet } from "react-helmet-async";

export default function SEO({ title = "Grid Journal", description = "Modern blog platform for thoughtful articles.", image = "/icon.svg", type = "website" }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}
