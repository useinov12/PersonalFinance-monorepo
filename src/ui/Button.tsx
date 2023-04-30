import * as React from "react";

import clsx from "clsx";

enum ButtonVariant {
  "primary",
  "outline",
  "ghost",
  "green-ghost",
  "light",
  "dark",
  "red",
  "green",
  "red-outline",
  "green-outline",
  "theme-dependent",
  "transparent",
}

type ButtonProps = {
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Button background color variant */
  isDarkBg?: boolean;
  /** Button appearance variant */
  variant?: keyof typeof ButtonVariant;
} & React.ComponentPropsWithRef<"button">;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled: buttonDisabled,
      isLoading,
      variant = "primary",
      isDarkBg = false,
      ...rest
    },
    ref
  ) => {
    const disabled = isLoading || buttonDisabled;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={clsx(
          "inline-flex items-center rounded-md px-4 py-1 font-medium whitespace-nowrap",
          "focus-visible:ring-primary-500 focus:outline-none focus-visible:ring",
          "shadow-md",
          //#region  //*=========== Variants ===========
          [
            variant === "transparent" && [
              "bg-transparent",
              "shadow-none",

              "hover:opacity-80",
              "active:opacity-90",
              "disabled:bg-primary-400 disabled:hover:bg-primary-400 ",
            ],
            variant === "primary" && [
              "bg-primary-500 text-white",
              "border-primary-600 border",
              "hover:bg-primary-600 hover:text-white",
              "active:bg-primary-500",
              "disabled:bg-gray-400 disabled:hover:bg-gray-400/90 disabled:border-gray-500",
            ],
            variant === "outline" && [
              // 'text-primary-500',
              "border-primary-500 border",
              "hover:bg-primary-50 active:bg-primary-100 disabled:bg-primary-100",
              isDarkBg &&
                "hover:bg-gray-900 active:bg-gray-800 disabled:bg-gray-800",
            ],
            variant === "ghost" && [
              "shadow-none",
              "border-t border-b border-gray-500/50 md:border",
            ],
            variant === "green-ghost" && [
              "text-green-500",
              "shadow-none",
              "hover:bg-green-200 active:bg-green-100 disabled:bg-green-100",
              isDarkBg &&
                "hover:bg-green-900 active:bg-green-800 disabled:bg-green-800",
            ],
            variant === "light" && [
              "text-dark bg-white ",
              "border border-gray-300",
              "hover:text-dark hover:bg-gray-100",
              "active:bg-white/80 disabled:bg-gray-200",
            ],
            variant === "dark" && [
              "bg-dark/90 text-white",
              "border border-gray-600",
              "hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-700",
            ],
            variant === "red" && [
              "bg-red-500 text-white",
              "border border-red-700",
              "hover:bg-red-700 active:bg-red-600 disabled:bg-gray-700",
            ],
            variant === "green" && [
              "bg-green-500 text-white",
              "border border-green-700",
              "hover:bg-green-700 active:bg-green-600 disabled:bg-gray-700",
            ],
            variant === "red-outline" && [
              // 'text-dark',
              "border border-red-700",
              "hover:bg-red-300 active:bg-red-400 disabled:bg-gray-700",
              isDarkBg &&
                "text-gray-50 hover:bg-red-500 active:bg-red-400 disabled:bg-gray-800",
            ],
            variant === "green-outline" && [
              "text-dark",
              "border border-green-700",
              "hover:bg-green-300 active:bg-green-400 disabled:bg-gray-700",
              isDarkBg &&
                "text-gray-50 hover:bg-green-500 active:bg-green-400 disabled:bg-gray-800",
            ],
          ],
          //#endregion  //*======== Variants ===========
          "disabled:cursor-not-allowed",
          isLoading &&
            "relative text-transparent transition-none hover:text-transparent disabled:cursor-wait",
          className
        )}
        {...rest}
      >
        {isLoading && (
          <div
            className={clsx(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              {
                "text-white": ["primary", "dark"].includes(variant),
                "text-black": ["light"].includes(variant),
                "text-primary-500": ["outline", "ghost"].includes(variant),
              }
            )}
          >
            {/* <ImSpinner2 className='animate-spin' /> */}
            <p>loading</p>
          </div>
        )}
        {children}
      </button>
    );
  }
);

export default Button;
