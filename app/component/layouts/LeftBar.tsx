import FeedbackBlackIcon from "@/app/images/FeedbackBlackIcon";
import FeedbackWhiteIcon from "@/app/images/FeedbackWhiteIcon";
import HomeIcon from "@/app/images/HomeIcon";
import NoteIcon from "@/app/images/NoteIcon";
import PhotoIcon from "@/app/images/PhotoIcon";
import Plus from "@/app/images/Plus";
import React from "react";

export default function LeftBar() {
  return (
    <div className="layout-content-container flex flex-col w-64 sm:w-50">
      <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="text-[#111418]"
                data-icon="House"
                data-size="24px"
                data-weight="regular"
              >
                <HomeIcon />
              </div>
              <p className="text-[#111418] text-sm font-medium leading-normal">
                Home
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="text-[#111418]"
                data-icon="Image"
                data-size="24px"
                data-weight="regular"
              >
                <PhotoIcon />
              </div>
              <p className="text-[#111418] text-sm font-medium leading-normal">
                Photos
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="text-[#111418]"
                data-icon="Note"
                data-size="24px"
                data-weight="regular"
              >
                <NoteIcon />
              </div>
              <p className="text-[#111418] text-sm font-medium leading-normal">
                Notes
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#f0f2f4]">
              <div
                className="text-[#111418]"
                data-icon="ChatCircleDots"
                data-size="24px"
                data-weight="fill"
              >
                <FeedbackBlackIcon />
              </div>
              <p className="text-[#111418] text-sm font-medium leading-normal">
                Feedback
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="text-[#111418]"
                data-icon="ChatCircleDots"
                data-size="24px"
                data-weight="regular"
              >
                <FeedbackWhiteIcon />
              </div>
              <p className="text-[#111418] text-sm font-medium leading-normal">
                Feedback
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="text-[#111418]"
                data-icon="ChatCircleDots"
                data-size="24px"
                data-weight="regular"
              >
                <FeedbackWhiteIcon />
              </div>
              <p className="text-[#111418] text-sm font-medium leading-normal">
                Feedback
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className="text-[#111418]"
                data-icon="ChatCircleDots"
                data-size="24px"
                data-weight="regular"
              >
                <Plus />
              </div>
              <p className="text-[#111418] text-sm font-medium leading-normal overflow-hidden text-ellipsis whitespace-nowrap">
                카테고리 추가
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
