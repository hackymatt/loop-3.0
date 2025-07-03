// next.config.mjs

import pkg from "./next-i18next.config.mjs";
const { i18n } = pkg;

export default {
  trailingSlash: false,
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
    "@mui/lab": {
      transform: "@mui/lab/{{member}}",
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  i18n,
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/pl",
      },
    ];
  },
};
