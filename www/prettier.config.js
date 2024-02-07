/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions & import("@ianvs/prettier-plugin-sort-imports").PluginConfig} */
const config = {
    arrowParens: "always",
    printWidth: 80,
    singleQuote: false,
    jsxSingleQuote: false,
    semi: true,
    trailingComma: "all",
    tabWidth: 4,
    plugins: [
        "prettier-plugin-tailwindcss",
        "@ianvs/prettier-plugin-sort-imports",
    ],
    importOrder: ["<THIRD_PARTY_MODULES>", "", "^~/", "^[.][.]/", "^[.]/"],
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    importOrderTypeScriptVersion: "4.4.0",
};

export default config;
