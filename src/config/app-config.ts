import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Post Dominator",
  version: packageJson.version,
  copyright: `© ${currentYear}, Post Dominator.`,
  meta: {
    title: "Post Dominator - Social Media Scheduling App",
    description:
      "Post Dominator is a modern social media scheduling app built with Next.js 16, Tailwind CSS v4, and shadcn/ui—optimized for planning, publishing, and analyzing content.",
  },
  brand: {
    logo: {
      light: "/brand/logo-light.svg",
      dark: "/brand/logo-dark.svg",
    },
    favicon: {
      light: "/brand/favicon-light.svg",
      dark: "/brand/favicon-dark.svg",
    },
  },
};
