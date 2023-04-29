import Image from "next/image";
import React, { ReactNode, useCallback } from "react";
import clsx from "clsx";

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
    <main className="flex h-screen w-screen flex-col items-start gap-2 bg-gray-100 py-8 px-24 text-gray-800">
      <h1 className="px-2 text-3xl font-extrabold">
        Example of Plaid API flow
      </h1>
      <div className="flex h-full w-full justify-center gap-10">
        <section className="h-full w-1/3 py-5 px-8">
          {[0, 0, 0, 0, 0].map((img, i) => (
            <Image
              src={`/link-token-row-${i + 1}.webp`}
              width={400}
              height={125}
              alt={`plaid-img-${i}`}
            />
          ))}
        </section>
        <section className="flex h-full  w-2/3 flex-col items-start gap-y-5">
          <SignIn />
          <LinkTokenBlock />
          <ProductRequest />
        </section>
      </div>
    </main>
  );
}

function SignIn() {
  const { data: sessionData } = useSession();

  function handleSignIn() {
    sessionData ? signOut() : signIn();
  }

  return (
    <div className="flex w-[70%] items-start 2xl:w-3/5 ">
      <p className="text-md w-2/3 font-medium leading-[1.2]">
        The Plaid flow begins when your user wants to connect their bank account
        to your app
      </p>

      <div className="flex w-1/3  items-end justify-end gap-2 px-1">
        <Button onClick={handleSignIn}>
          {sessionData ? "Sign out" : "Sign in"}
        </Button>
        {sessionData ? (
          sessionData.user.image && (
            <Image
              src={sessionData.user.image}
              alt="user"
              width={66}
              height={66}
              className="rounded-2xl shadow-md"
            />
          )
        ) : (
          <span className="h-16 w-16 rounded-2xl bg-gray-500/50 shadow-md" />
        )}
      </div>
    </div>
  );
}

function LinkTokenBlock() {
  const session = useSession();
  const linkToken = api.plaid.createLinkToken.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });
  function handleFetchToken() {
    linkToken.refetch().catch((e) => console.error(e));
  }
  return (
    <>
      <Block className="h-44">
        <p className="w-2/3 text-sm font-medium leading-[1.2]">
          1. Call <strong>/link/token/create</strong> to create a link_token and
          pass the temporary token to your app's client <br />
        </p>
        <div className="flex w-full items-start gap-4 px-2">
          <Button
            onClick={handleFetchToken}
            disabled={!session.data ? true : false}
          >
            Create Link Token
          </Button>
          {session.status === "authenticated" &&
            linkToken.isFetching &&
            "...fetching"}
          {linkToken.data && linkToken.isSuccess && !linkToken.isFetching && (
            <>
              <code className="w-4/5 break-words text-sm">
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
      </Block>
      <Block className="h-38">
        <p className=" w-2/3 text-sm font-medium leading-[1.2]">
          2. Use the <code>link_token</code> to open Pliad UI for your user. In
          the onSuccess callback, PlaidLink will provide a temporary{" "}
          <code>public_token</code>
        </p>

        <div className="flex w-full items-center gap-3 px-2">
          <span className="w-4/5 text-[0.75rem]"></span>

          <PlaidLink
            linkToken={linkToken.data ? linkToken.data.link_token : undefined}
          />
        </div>

        <p className=" w-2/3 text-sm font-medium leading-[1.2]">
          3. Call <strong>/item/public_token/exchange</strong> to exchange the
          public_token for a permanent <code>access_token</code> and{" "}
          <code>item_id</code> for the new Item
        </p>
      </Block>
    </>
  );
}

function ProductRequest() {
  const session = useSession();
  const banks = api.plaid.getConnectedBanks.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
  });
  function handleGetBanks() {
    banks.refetch().catch((e) => console.error(e));
  }
  return (
    <Block className="h-44">
      <p className="w-2/3 text-sm font-medium leading-[1.2]">
        4. Store the access_token and use it to make product requests for your
        user's Item
      </p>
      <div className="flex w-full items-start gap-3 px-2">
        <Button
          onClick={handleGetBanks}
          disabled={!session.data ? true : false}
        >
          Get Connected Banks
        </Button>
        {banks.data && banks.isSuccess && (
          <code className="w-3/5 break-words text-sm">
            {banks.data.connectedBanks.map(
              (bank, i) =>
                i < 3 && (
                  <div className="truncate hover:text-clip" key={i}>{`id#${
                    i + 1
                  }:${bank}`}</div>
                )
            )}
            {/* ["x8DzxW5Kogfr33E44K5xuee5jDvlGAunyV87V",
          "ylMLj5XpNEUZygJdX8DECJgvjjzb7Wuy1DJdB",
          "bdPoGZLB3LUlq9gjW1RKUowvG5jRX5um1b5zy"] */}
          </code>
        )}
      </div>
    </Block>
  );
}

function Block({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex  w-[70%] flex-col items-start gap-y-3 rounded-xl border border-gray-700/20 bg-gray-100 p-4 shadow-lg 2xl:w-3/5",
        className
      )}
    >
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean | undefined;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-md whitespace-nowrap rounded-md  px-5 py-2 text-white no-underline transition ",
        "shadow-md",
        disabled
          ? "cursor-not-allowed bg-gray-400 hover:bg-gray-400/90"
          : "bg-sky-600 hover:bg-gray-700",
        className
      )}
    >
      {children}
    </button>
  );
}

interface PlaidLinkProps {
  linkToken?: string;
}

function PlaidLink(props: PlaidLinkProps) {
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
    token: props.linkToken ? props.linkToken : null,
    // receivedRedirectUri: env.NEXT_PUBLIC_PLAID_REDIRECT_URI_DEV, // only for link re-initialization
    onSuccess,
    onEvent,
  };
  const plaidUI = usePlaidLink(config);

  function hanldeOpenPlaidUI() {
    plaidUI.open();
  }

  return (
    <Button onClick={hanldeOpenPlaidUI} disabled={!plaidUI.ready}>
      Open Plaid UI
    </Button>
  );
}
