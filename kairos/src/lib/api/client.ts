import {
  AuthenticationApi,
  DefaultApi,
  UsersApi,
  Configuration,
} from "kairos-api-client-ts";
import { getAuthToken } from "./auth";

export class KairosApiClient {
  private config: Configuration;
  private _auth?: AuthenticationApi;
  private _default?: DefaultApi;
  private _users?: UsersApi;

  constructor(token?: string) {
    console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
    this.config = new Configuration({
      basePath:
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://7zpmbpgf7d.execute-api.eu-west-2.amazonaws.com",
      baseOptions: {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    });
  }

  // Lazy getters for each API
  get auth(): AuthenticationApi {
    if (!this._auth) {
      this._auth = new AuthenticationApi(this.config);
    }
    return this._auth;
  }

  get default(): DefaultApi {
    if (!this._default) {
      this._default = new DefaultApi(this.config);
    }
    return this._default;
  }

  get users(): UsersApi {
    if (!this._users) {
      this._users = new UsersApi(this.config);
    }
    return this._users;
  }

  // Method to update token
  updateToken(token: string) {
    this.config.baseOptions = {
      ...this.config.baseOptions,
      headers: {
        ...this.config.baseOptions?.headers,
        Authorization: `Bearer ${token}`,
      },
    };
    // Reset instances so they pick up new config
    this._auth = undefined;
    this._default = undefined;
    this._users = undefined;
  }

  // Method to clear auth
  clearAuth() {
    if (this.config.baseOptions?.headers) {
      delete this.config.baseOptions.headers.Authorization;
    }
    this._auth = undefined;
    this._default = undefined;
    this._users = undefined;
  }
}

// Client-side singleton
let clientInstance: KairosApiClient | null = null;

export const getApiClient = (): KairosApiClient => {
  if (typeof window === "undefined") {
    // Server-side: always create new instance
    return new KairosApiClient();
  }

  // Client-side: reuse instance
  if (!clientInstance) {
    const token = getAuthToken();
    clientInstance = new KairosApiClient(token || ""); // TODO: Should '' be here?
  }

  return clientInstance;
};

// Server-side factory
export const createServerApiClient = (token?: string) => {
  return new KairosApiClient(token);
};
