import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { plaidClient, createPlaidRequestConfig } from "../../plaidConfig";

export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure.query(async ({ ctx }) => {
    const session = ctx.session;
    const userId = session.user.id;
    const request = createPlaidRequestConfig(userId);
    try {
      const createTokenResponse = await plaidClient.linkTokenCreate(request);
      return createTokenResponse.data;
      //   createTokenResponse.json(createTokenResponse.data);
    } catch (error) {
      // handle error
      console.error(error);
    }
  }),

  exchangeTokens: protectedProcedure
    .input(z.object({ publicToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: input.publicToken,
      });

      // ! need to encrypt the response
      const accessToken = response.data.access_token;
      const itemID = response.data.item_id;

      await prisma.bankItem.create({
        data: {
          userId: session.user.id,
          itemId: itemID,
          accessToken: accessToken,
        },
      });

      const bankItemCreated = await prisma.bankItem.findUnique({
        where: { itemId: itemID },
      });

      return {
        itemId: bankItemCreated?.itemId,
        message: bankItemCreated ? "Iteem created" : "No item in db",
      };
    }),

  getConnectedBanks: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;

    const bankItems = await prisma.bankItem.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return {
      connectedBanks: bankItems.map((bankItem) => bankItem.itemId),
      message: "Connected bank item Ids",
    };
  }),
});
