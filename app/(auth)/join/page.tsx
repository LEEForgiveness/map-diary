"use client";

import { registerUser } from "@/app/api/auth";
import HeaderIcon from "@/app/images/HeaderIcon";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/app/utils/supabaseConfig";
import { useMessageOverlay } from "@/app/hooks/useMessageOverlay";

export default function page() {
  const router = useRouter();
  const { showMessage, overlay } = useMessageOverlay();
  useEffect(() => {
    // 세션 확인
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/";
      }
    };
    checkSession();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const isPasswordValid = /^(?=.*[A-z])(?=.*\d).{8,}$/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showPasswordError =
    formData.confirmPassword.length > 0 &&
    formData.password.length > 0 &&
    !passwordsMatch;
  const canSubmit = passwordsMatch && isPasswordValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    const { data, error } = await registerUser(formData);

    if (error) {
      let message = "회원가입에 실패했습니다.";
      if (error.message?.includes("Password should be at least 8 characters")) {
        message =
          "비밀번호는 8자 이상, 영문 대소문자/숫자를 각각 하나 이상 포함해야 합니다.";
      } else if (error.message?.includes("Email address")) {
        message = `회원가입에 실패했습니다: 다른 이메일 주소를 사용해 주세요.`;
      }

      showMessage(message);
      return;
    }

    if (!data?.user) {
      showMessage("회원가입 정보를 확인할 수 없습니다. 다시 시도해주세요.");
      return;
    }
    showMessage(
      "가입 확인 메일을 보냈습니다.만약 이미 가입된 이메일이라면 인증 메일이 발송되지 않습니다. 로그인을 시도해 보세요.",
      () => router.push("/login")
    );
    return;
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
                placeholder="비밀번호를 입력하세요(영어/숫자 포함 8자 이상)"
                type="password"
                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border bg-white h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal ${
                  formData.password.length > 0 && !isPasswordValid
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#dce0e5] focus:border-[#dce0e5]"
                }`}
                value={formData.password}
                onChange={handleChange}
                name="password"
              />
              {formData.password.length > 0 && !isPasswordValid && (
                <p className="text-sm text-red-500 mt-2">
                  비밀번호는 8자 이상이며 영어 대/소문자와 숫자를 포함해야
                  합니다.
                </p>
              )}
            </label>
          </div>
          <div className="flex w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                비밀번호 확인
              </p>
              <input
                placeholder="비밀번호를 입력하세요"
                type="password"
                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border bg-white h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal ${
                  showPasswordError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#dce0e5] focus:border-[#dce0e5]"
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
              />
              {showPasswordError && (
                <p className="text-sm text-red-500 mt-2">
                  비밀번호와 비밀번호 확인이 일치하지 않습니다.
                </p>
              )}
            </label>
          </div>
          <div className="flex flex-col items-start w-[480px] px-4 py-3">
            <div className="flex flex-1 gap-3 flex-wrap py-3 justify-start">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-xl h-12 px-5 text-base font-bold leading-normal tracking-[0.015em] ${
                  canSubmit
                    ? "cursor-pointer bg-[#1980e6] text-white"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
              >
                <span className="truncate">가입하기</span>
              </button>
            </div>
          </div>
        </form>
      </div>
      {overlay}
    </div>
  );
}
