import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  LinkTokenCreateRequest,
  CountryCode,
  Products,
} from "plaid";
import { env } from "../env/client.mjs";

// https://plaid.com/docs/quickstart/#how-it-works
class PlaidClient {
  // default configuration
  private config = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": env.NEXT_PUBLIC_PLAID_SANDBOX_CLIENT_ID,
        "PLAID-SECRET": env.NEXT_PUBLIC_PLAID_SANDBOX_CLIENT_SECRET,
      },
    },
  });
  public currentEnvironment: "sandbox" | "development" | "production" =
    "development";
  // singleton
  public instance = new PlaidApi(this.config);
  setConfigEnvironment = (
    environment: "sandbox" | "development" | "production"
  ) => {
    this.currentEnvironment = environment;
    this.config = new Configuration({
      basePath:
        environment === "sandbox"
          ? PlaidEnvironments.sandbox
          : environment === "development"
          ? PlaidEnvironments.development
          : PlaidEnvironments.production,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID":
            environment === "sandbox"
              ? env.NEXT_PUBLIC_PLAID_SANDBOX_CLIENT_ID
              : environment === "development"
              ? env.NEXT_PUBLIC_PLAID_DEVELOPMENT_CLIENT_SECRET
              : env.NEXT_PUBLIC_PLAID_PRODUCTION_CLIENT_ID,
          "PLAID-SECRET":
            environment === "sandbox"
              ? env.NEXT_PUBLIC_PLAID_SANDBOX_CLIENT_SECRET
              : environment === "development"
              ? env.NEXT_PUBLIC_PLAID_DEVELOPMENT_CLIENT_SECRET
              : env.NEXT_PUBLIC_PLAID_PRODUCTION_CLIENT_SECRET,
        },
      },
    });
    this.instance = new PlaidApi(this.config);
  };
}

export const plaidClient = new PlaidClient();

export const createPlaidRequestConfig = (userId: string) => {
  const request: LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: userId,
    },
    client_name: "Plaid Test App",
    products: [Products.Auth],
    language: "en",
    // webhook: "",
    // redirect_uri: "http://localhost:3000/oauth",
    country_codes: [CountryCode.Us],
  };
  return request;
};
