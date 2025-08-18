import config from ".";

export const getBackendBaseURL = (): string => {
    if (
        window.location.hostname.includes("github.io") ||
        window.location.hostname.includes("githubusercontent.com")
    ) {
        return "https://mailreadreceipts.vercel.app";
    }
    return `${window.location.protocol}//${window.location.hostname}:${config.SERVER_PORT}`;
};
