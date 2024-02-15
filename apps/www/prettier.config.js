import baseConfig from "../../prettier.config.mjs";

/**
 * @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options
 */
const config = {
    ...baseConfig,
    plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
