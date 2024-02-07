import {
    adjectives,
    animals,
    colors,
    Config,
    uniqueNamesGenerator,
} from "unique-names-generator";

const config: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: "-",
};

export function generateRandomUsername() {
    return uniqueNamesGenerator(config);
}
