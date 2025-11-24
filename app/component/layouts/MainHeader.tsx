import BellIcon from "@/app/images/BellIcon";
import HeaderIcon from "@/app/images/HeaderIcon";
import QuestionIcon from "@/app/images/QuestionIcon";
import Search2 from "@/app/images/Search2";
import Link from "next/link";
import React from "react";
import ProfileButton from "./ProfileButton";

export default function MainHeader() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] px-10 py-3 bg-white">
      <Link href="/">
        <div className="flex items-center gap-4 text-[#111418]">
          <div className="size-4">
            <HeaderIcon />
          </div>
          <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">
            Map-Diary
          </h2>
        </div>
      </Link>
      <div className="flex flex-1 justify-end gap-4">
        <label className="flex flex-col min-w-40 h-10! max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div
              className="text-[#637588] flex border-none bg-[#f0f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0"
              data-icon="MagnifyingGlass"
              data-size="24px"
              data-weight="regular"
            >
              <Search2 />
            </div>
            <input
              placeholder="Search"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f4] focus:border-none h-full placeholder:text-[#637588] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value=""
            />
          </div>
        </label>
        <div className="flex gap-2">
          <Link
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            href="/addstudygroup"
          >
            <span className="truncate">만들기</span>
          </Link>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f2f4] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
            <div
              className="text-[#111418]"
              data-icon="MagnifyingGlass"
              data-size="20px"
              data-weight="regular"
            >
              <BellIcon />
            </div>
          </button>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f2f4] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
            <div
              className="text-[#111418]"
              data-icon="ChatCircle"
              data-size="20px"
              data-weight="regular"
            >
              <QuestionIcon />
            </div>
          </button>
        </div>
        <ProfileButton />
      </div>
    </header>
  );
}
