"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function NPprogressWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ProgressBar
        height="10px"
        color="#fffd00"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
