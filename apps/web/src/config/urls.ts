import config from ".";

export const baseBackendURL =
    config.NODE_ENV === "development"
        ? `${window.location.protocol}//${window.location.hostname}:${config.SERVER_PORT}`
        : config.NODE_ENV === "test"
          ? "test url"
          : config.NODE_ENV === "production"
            ? "production url"
            : "invalid url";
