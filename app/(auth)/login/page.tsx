"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";

import { LoginFormType } from "@/app/types/formType";
import supabase from "@/app/utils/supabaseConfig";
import { loginUser } from "@/app/api/auth";
import { useMessageOverlay } from "@/app/hooks/useMessageOverlay";

export default function LoginForm() {
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

  const [payload, setPayload] = useState<LoginFormType>({
    username: "",
    password: "",
  });

  const logInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payload.username && !payload.password) {
      showMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    const { data, error } = await loginUser(payload.username, payload.password);
    if (error) {
      showMessage("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      return;
    } else {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("session after login:", session);
      window.location.href = "/";
    }
  };

  const onChangePayload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayload({
      ...payload,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Suspense>
      <>
        {/* 배경 */}
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ background: "var(--color-cream)" }}
        >
          {/* 배경 장식 원 */}
          <div
            className="pointer-events-none fixed inset-0 overflow-hidden"
            aria-hidden
          >
            <div
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
              style={{ background: "var(--color-sand)" }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-20"
              style={{ background: "var(--color-coral-light)" }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
              style={{ background: "var(--color-sky-light)" }}
            />
          </div>

          {/* 카드 */}
          <div
            className="glass-panel animate-fade-in-up w-full max-w-md rounded-3xl px-8 py-10 relative z-10"
          >
            {/* 헤더 */}
            <div className="flex flex-col items-center mb-8">
              {/* 지도 핀 아이콘 */}
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
                지도 위의 나의 추억
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={logInSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-navy)" }}
                >
                  이메일
                </label>
                <input
                  placeholder="you@example.com"
                  name="username"
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
                  value={payload.username}
                  onChange={onChangePayload}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--color-navy)" }}
                >
                  비밀번호
                </label>
                <input
                  placeholder="비밀번호를 입력하세요"
                  type="password"
                  name="password"
                  autoComplete="current-password"
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
                  value={payload.password}
                  onChange={onChangePayload}
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-bold text-white mt-2 transition-all active:scale-95 hover:opacity-90"
                style={{ background: "var(--color-coral)" }}
              >
                로그인
              </button>
            </form>

            {/* 하단 링크 */}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm">
              <span style={{ color: "var(--color-warm-gray)" }}>
                계정이 없으신가요?
              </span>
              <Link
                href="/join"
                className="font-semibold hover:underline transition-opacity"
                style={{ color: "var(--color-coral)" }}
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
        {overlay}
      </>
    </Suspense>
  );
}
