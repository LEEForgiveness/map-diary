import InstgramIcon from "@/app/images/InstgramIcon";
import TwitterIcon from "@/app/images/TwitterIcon";
import Link from "next/link";
import React from "react";

export default function MainFooter() {
  return (
    <footer className="flex justify-center bg-white">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
          <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
            <Link
              className="text-[#637588] text-base font-normal leading-normal min-w-40"
              href="#"
            >
              About
            </Link>
            <Link
              className="text-[#637588] text-base font-normal leading-normal min-w-40"
              href="#"
            >
              Blog
            </Link>
            <Link
              className="text-[#637588] text-base font-normal leading-normal min-w-40"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-[#637588] text-base font-normal leading-normal min-w-40"
              href="#"
            >
              Terms of Service
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#">
              <div
                className="text-[#637588]"
                data-icon="InstagramLogo"
                data-size="24px"
                data-weight="regular"
              >
                <InstgramIcon />
              </div>
            </Link>
            <Link href="#">
              <div
                className="text-[#637588]"
                data-icon="TwitterLogo"
                data-size="24px"
                data-weight="regular"
              >
                <TwitterIcon />
              </div>
            </Link>
          </div>
          <p className="text-[#637588] text-base font-normal leading-normal">
            © 2024 Map-Diary. All rights reserved.
          </p>
        </footer>
      </div>
    </footer>
  );
}
