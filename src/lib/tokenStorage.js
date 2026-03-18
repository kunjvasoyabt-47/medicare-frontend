const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const isValidToken = (value) =>
  typeof value === "string" &&
  value.trim() !== "" &&
  value !== "undefined" &&
  value !== "null";

const getStoredToken = (key) => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(key);
  return isValidToken(token) ? token : null;
};

export const getAccessToken = () => getStoredToken(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => getStoredToken(REFRESH_TOKEN_KEY);

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const saveTokensFromPayload = (payload = {}) => {
  if (typeof window === "undefined") return false;

  const accessToken = payload?.access_token;
  const refreshToken = payload?.refresh_token;
  const hasAccessTokenField = Object.prototype.hasOwnProperty.call(
    payload,
    "access_token",
  );
  const hasRefreshTokenField = Object.prototype.hasOwnProperty.call(
    payload,
    "refresh_token",
  );

  if (hasAccessTokenField) {
    if (isValidToken(accessToken)) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  if (hasRefreshTokenField) {
    if (isValidToken(refreshToken)) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  return isValidToken(accessToken) || isValidToken(refreshToken);
};
