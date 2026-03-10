"use client";

import { registerUser } from "@/app/api/auth";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/app/utils/supabaseConfig";
import { useMessageOverlay } from "@/app/hooks/useMessageOverlay";

export default function page() {
  const router = useRouter();
  const { showMessage, overlay } = useMessageOverlay();

  useEffect(() => {
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
      "가입 확인 메일을 보냈습니다. 만약 이미 가입된 이메일이라면 인증 메일이 발송되지 않습니다. 로그인을 시도해 보세요.",
      () => router.push("/login")
    );
  };

  return (
    <Suspense>
      <>
        {/* 배경 */}
        <div
          className="min-h-screen flex items-center justify-center px-4 py-10"
          style={{ background: "var(--color-cream)" }}
        >
          {/* 배경 장식 원 */}
          <div
            className="pointer-events-none fixed inset-0 overflow-hidden"
            aria-hidden
          >
            <div
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-25"
              style={{ background: "var(--color-sky-light)" }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-20"
              style={{ background: "var(--color-coral-light)" }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10"
              style={{ background: "var(--color-sand)" }}
            />
          </div>

          {/* 카드 */}
          <div className="glass-panel animate-fade-in-up w-full max-w-md rounded-3xl px-8 py-10 relative z-10">
            {/* 헤더 */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                style={{ background: "var(--color-coral)" }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="white"
                  />
                </svg>
              </div>
              <Link href="/" className="group">
                <h1
                  className="text-2xl font-bold tracking-tight group-hover:opacity-75 transition-opacity"
                  style={{ color: "var(--color-deep-navy)" }}
                >
                  Map Diary
                </h1>
              </Link>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-warm-gray)" }}
              >
                나만의 추억 지도를 시작해보세요
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* 이름 */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-navy)" }}
                >
                  이름
                </label>
                <input
                  placeholder="이름을 입력하세요"
                  name="name"
                  autoComplete="name"
                  className="w-full rounded-xl h-12 px-4 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid var(--color-sand)",
                    color: "var(--color-deep-navy)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.border =
                      "1px solid var(--color-coral)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.border =
                      "1px solid var(--color-sand)")
                  }
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* 이메일 */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-navy)" }}
                >
                  이메일
                </label>
                <input
                  placeholder="you@example.com"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl h-12 px-4 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid var(--color-sand)",
                    color: "var(--color-deep-navy)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.border =
                      "1px solid var(--color-coral)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.border =
                      "1px solid var(--color-sand)")
                  }
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* 비밀번호 */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-navy)" }}
                >
                  비밀번호
                </label>
                <input
                  placeholder="영문+숫자 포함 8자 이상"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  className="w-full rounded-xl h-12 px-4 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border:
                      formData.password.length > 0 && !isPasswordValid
                        ? "1px solid #e85b5b"
                        : "1px solid var(--color-sand)",
                    color: "var(--color-deep-navy)",
                  }}
                  onFocus={(e) => {
                    if (!(formData.password.length > 0 && !isPasswordValid)) {
                      e.currentTarget.style.border =
                        "1px solid var(--color-coral)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!(formData.password.length > 0 && !isPasswordValid)) {
                      e.currentTarget.style.border =
                        "1px solid var(--color-sand)";
                    }
                  }}
                  value={formData.password}
                  onChange={handleChange}
                />
                {formData.password.length > 0 && !isPasswordValid && (
                  <p className="text-xs mt-1" style={{ color: "#e85b5b" }}>
                    비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.
                  </p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-navy)" }}
                >
                  비밀번호 확인
                </label>
                <input
                  placeholder="비밀번호를 다시 입력하세요"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  className="w-full rounded-xl h-12 px-4 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: showPasswordError
                      ? "1px solid #e85b5b"
                      : "1px solid var(--color-sand)",
                    color: "var(--color-deep-navy)",
                  }}
                  onFocus={(e) => {
                    if (!showPasswordError) {
                      e.currentTarget.style.border =
                        "1px solid var(--color-coral)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!showPasswordError) {
                      e.currentTarget.style.border =
                        "1px solid var(--color-sand)";
                    }
                  }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {showPasswordError && (
                  <p className="text-xs mt-1" style={{ color: "#e85b5b" }}>
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>

              {/* 가입 버튼 */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-12 rounded-xl text-sm font-bold text-white mt-2 transition-all active:scale-95"
                style={{
                  background: canSubmit
                    ? "var(--color-coral)"
                    : "var(--color-sand)",
                  color: canSubmit ? "white" : "var(--color-warm-gray)",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                가입하기
              </button>
            </form>

            {/* 하단 링크 */}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm">
              <span style={{ color: "var(--color-warm-gray)" }}>
                이미 계정이 있으신가요?
              </span>
              <Link
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: "var(--color-coral)" }}
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
        {overlay}
      </>
    </Suspense>
  );
}
