import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { plaidClient, createPlaidRequestConfig } from "../../plaidConfig";


export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure.query(async ({ ctx }) => {
    const session = ctx.session;
    const userId = session.user.id;
    const request = createPlaidRequestConfig(userId)
    try {
      const createTokenResponse = await plaidClient.linkTokenCreate(request);
      return createTokenResponse.data
    //   createTokenResponse.json(createTokenResponse.data);
    } catch (error) {
      // handle error
      console.error(error);
    }
    // make Plaid API request here
    return "plaidLinkToken";
  })
});
