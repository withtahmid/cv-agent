export const getBackendBaseURL = () => {
    console.log({ Hostname: window.location.hostname });
    if (
        window.location.hostname.includes("github.io") ||
        window.location.hostname.includes("githubusercontent.com")
    ) {
        return "https://mailreadreceipts.vercel.app";
    }
    if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("192.168")
    ) {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
    return "https://mailreadreceipts.vercel.app";
};
