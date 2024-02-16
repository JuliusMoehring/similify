import {
    adjectives,
    animals,
    colors,
    uniqueNamesGenerator,
    type Config,
} from "unique-names-generator";

const config: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: "-",
};

export function generateRandomUsername() {
    return uniqueNamesGenerator(config);
}
