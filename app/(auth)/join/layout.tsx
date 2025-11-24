import MainFooter from "@/app/component/layouts/MainFooter";
import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <MainFooter />
    </>
  );
}
