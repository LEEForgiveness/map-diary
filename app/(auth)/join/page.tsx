"use client";

import HeaderIcon from "@/app/images/HeaderIcon";
import React, { useState } from "react";

export default function page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 회원가입 로직 구현
    console.log("formData:", formData);
  };

  return (
    <div className="h-screen px-40 flex flex-1 justify-center py-5 bg-white">
      <div className="layout-content-container flex flex-col w-full py-5 flex-1 justify-center items-center">
        <div className="flex justify-center items-center gap-2 text-[#111418] mb-5">
          <div className="size-8">
            <HeaderIcon />
          </div>
          <h2 className="text-[#111418] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
            Map-Diary 회원가입
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                이름
              </p>
              <input
                placeholder="이름을 입력하세요"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                value={formData.name}
                onChange={handleChange}
                name="name"
              />
            </label>
          </div>
          <div className="flex w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                이메일
              </p>
              <input
                placeholder="you@example.com"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                value={formData.email}
                onChange={handleChange}
                name="email"
              />
            </label>
          </div>
          <div className="flex w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                비밀번호
              </p>
              <input
                placeholder="비밀번호를 입력하세요"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                value={formData.password}
                onChange={handleChange}
                name="password"
              />
            </label>
          </div>
          <div className="flex w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                비밀번호 확인
              </p>
              <input
                placeholder="비밀번호를 입력하세요"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
              />
            </label>
          </div>
          <div className="flex flex-col items-start w-[480px] px-4 py-3">
            {/* <label className="flex gap-x-3 py-3 flex-row">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-[#dce0e5] border-2 bg-transparent text-[#1980e6] checked:bg-[#1980e6] checked:border-[#1980e6] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce0e5] focus:outline-none"
              />
              <p className="text-[#111418] text-base font-normal leading-normal">
                동의
              </p>
            </label> */}
            <div className="flex flex-1 gap-3 flex-wrap py-3 justify-start">
              <button
                onClick={handleSubmit}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#1980e6] text-white text-base font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">가입하기</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
