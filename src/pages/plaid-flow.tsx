import Image from "next/image";
import React, { ReactNode, useCallback } from "react";

import {
  usePlaidLink,
  PlaidLinkOptionsWithLinkToken,
  PlaidLinkOnSuccess,
  PlaidLinkOnEvent,
} from "react-plaid-link";

import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";

export default function PlaidFlowPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center gap-8 bg-gray-100 py-8 px-24 text-gray-800">
      <h1 className="px-2 text-3xl">Plaid API flow example</h1>
      <section className="flex h-full w-full justify-center gap-10">
        <div className="h-full w-1/2  items-end justify-start gap-3 py-5">
          <div className="flex flex-col items-end">
            <SignIn />
            <LinkTokenBlock />
            <ProductRequest />
          </div>
        </div>
        <div className="h-full w-1/2 py-5 px-8">
          {[0, 0, 0, 0, 0].map((img, i) => (
            <Image
              src={`/link-token-row-${i + 1}.webp`}
              width={400}
              height={150}
              alt={`plaid-img-${i}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SignIn() {
  const { data: sessionData } = useSession();

  function handleSignIn() {
    sessionData ? signOut() : signIn();
  }

  return (
    <div className="flex w-2/3 flex-col items-start gap-1  p-2">
      <p className=" text-lg">
        1. Call <strong>/link/token/create</strong> to create a link_token and
        pass the temporary token to your app's client
      </p>
      <div className="flex w-full items-center justify-end gap-4 px-8">
        <Button onClick={handleSignIn}>
          {sessionData ? "Sign out" : "Sign in"}
        </Button>
        {sessionData ? (
          sessionData.user.image && (
            <Image
              src={sessionData.user.image}
              alt="user"
              width={60}
              height={60}
              className="rounded-full"
            />
          )
        ) : (
          <span className="h-14 w-14 rounded-full bg-gray-400" />
        )}
      </div>
    </div>
  );
}

function LinkTokenBlock() {
  const linkToken = api.plaid.createLinkToken.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });
  function handleFetchToken() {
    linkToken.refetch().catch((e) => console.error(e));
  }
  return (
    <>
      <section className="flex h-56 w-2/3  flex-col items-start gap-1 p-2">
        <p className=" text-lg">
          2. Use the link_token to open Link for your user. In the onSuccess
          callback, Link will provide a temporary public_token
        </p>
        <div className="flex w-full items-start gap-4 px-2">
          <Button onClick={handleFetchToken}>
            {linkToken.isFetching ? "...fetching" : "Create Link Token"}
          </Button>
          {linkToken.data && linkToken.isSuccess && (
            <>
              <code className="w-4/5 break-words text-[0.75rem]">
                {/* {JSON.stringify(linkToken.data)} */}
                <div>"expiration" : {linkToken.data.expiration}</div>
                <div>"link_token" : {linkToken.data.link_token}</div>
                <div>"request_id" : {linkToken.data.request_id}</div>

                {/* "expiration":"2023-04-22T22:51:37Z", <br />
                  "link_token":"link-sandbox-53b50685-0 <br />{" "}
                  dc3-4db9-bd4e-e5b5f13cbc79",
                  <br />
                  "request_id":"AbUcba2WxQl7KTP" */}
              </code>
            </>
          )}
        </div>
      </section>
      <section className="flex h-36 w-2/3  flex-col items-start gap-1 p-2">
        <p className=" text-lg">
          3. Call <strong>/item/public_token/exchange</strong> to exchange the
          public_token for a permanent <code>access_token</code> and{" "}
          <code>item_id</code> for the new Item
        </p>
        <div className="flex w-full items-center gap-3 px-2">
          <span className="w-4/5 text-[0.75rem]"></span>
          {linkToken.data && linkToken.isSuccess && (
            <PliadLink linkToken={linkToken.data.link_token} />
          )}
        </div>
      </section>
    </>
  );
}

function ProductRequest() {
  const banks = api.plaid.getConnectedBanks.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });
  function handleGetBanks() {
    banks.refetch().catch((e) => console.error(e));
  }
  return (
    <div className="flex w-2/3  flex-col items-start gap-1 p-2">
      <p className="text-lg">
        4. Store the access_token and use it to make product requests for your
        user's Item
      </p>
      <div className="flex w-full items-start gap-3 px-2">
        <Button onClick={handleGetBanks}>Get Connected Banks</Button>
        {banks.data && banks.isSuccess && (
          <code className="w-2/3  break-words text-[0.75rem]">
            {JSON.stringify(banks.data.connectedBanks)}
            {/* ["x8DzxW5Kogfr33E44K5xuee5jDvlGAunyV87V",
          "ylMLj5XpNEUZygJdX8DECJgvjjzb7Wuy1DJdB",
          "bdPoGZLB3LUlq9gjW1RKUowvG5jRX5um1b5zy"] */}
          </code>
        )}
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-md bg-gray-900/80 px-5 py-1 text-white no-underline transition hover:bg-gray-900/70"
    >
      {children}
    </button>
  );
}

interface LinkProps {
  linkToken: string;
}

function PliadLink(props: LinkProps) {
  const mutation = api.plaid.exchangeTokens.useMutation();

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    (public_token, metadata) => {
      // send public-token to the server to exchange it for access_token and save in DB
      mutation.mutate({ publicToken: public_token });
    },
    []
  );
  const onEvent = useCallback<PlaidLinkOnEvent>((public_token, metadata) => {
    console.log("event", public_token, metadata);
  }, []);

  const config: PlaidLinkOptionsWithLinkToken = {
    token: props.linkToken,
    // receivedRedirectUri: env.NEXT_PUBLIC_PLAID_REDIRECT_URI_DEV, // only for link re-initialization
    onSuccess,
    onEvent,
  };

  function hanldeOpenPlaidUI() {
    plaidUI.open();
  }

  const plaidUI = usePlaidLink(config);
  return (
    <Button
      onClick={hanldeOpenPlaidUI}
      // disabled={!plaidUI.ready}
    >
      Open Plaid UI
    </Button>
  );
}
