import axios from "axios";
import https from "https";

import { paths } from "src/routes/paths";

import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

import { defaultUser } from "src/components/user/user-config";
import { SETTINGS_STORAGE_KEY } from "src/components/settings";

import { URLS } from "./urls";

export const createAxiosInstance = (endpoint: string) => {
  const instance = axios.create({
    baseURL: endpoint,
    withCredentials: true,
    ...(endpoint.startsWith("https")
      ? {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        }
      : {}),
  });

  instance.interceptors.request.use((config) => {
    const settingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const settings = settingsRaw ? JSON.parse(settingsRaw) : null;
    const currentLanguage = settings?.language || LANGUAGE.PL;
    config.headers["Accept-Language"] = currentLanguage;
    return config;
  });

  return instance;
};

export const Api = createAxiosInstance(CONFIG.api);

const PlainApi = createAxiosInstance(CONFIG.api);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, tokenRefreshed: boolean) => {
  failedQueue.forEach((prom) => {
    if (tokenRefreshed) {
      prom.resolve();
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => Api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await PlainApi.post(URLS.REFRESH_TOKEN);
        processQueue(null, true);
        return Api(originalRequest);
      } catch (err) {
        processQueue(err, false);
        document.cookie = `user=${JSON.stringify(defaultUser)}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        window.location.href = paths.login;
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
