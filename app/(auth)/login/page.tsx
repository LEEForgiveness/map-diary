"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import HeaderIcon from "@/app/images/HeaderIcon";
import GoogleLogo from "@/app/images/GoogleLogo";
import KakaoLogo from "@/app/images/KakaoLogo";
import { LoginFormType } from "@/app/types/formType";
import supabase from "@/app/utils/supabaseConfig";
import { loginUser } from "@/app/api/auth";
import { useMessageOverlay } from "@/app/hooks/useMessageOverlay";

export default function LoginForm() {
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
  const param = useSearchParams();
  // console.log(param.get('callbackUrl'))
  const callbackUrl = param.get("callbackUrl");
  // console.log('session:', session);

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
      if (callbackUrl) {
        window.location.href = callbackUrl;
      } else {
        window.location.href = "/";
      }
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
      <div className="h-screen px-40 flex flex-1 justify-center py-5 bg-white items-center">
        <div className="layout-content-container flex flex-col w-lg max-w-lg py-5 flex-1 items-center">
          <form onSubmit={logInSubmit}>
            <div className="flex justify-center items-center gap-4 text-[#111418] mb-5">
              <div className="size-8">
                <HeaderIcon />
              </div>
              <h1 className="text-[#111418] text-3xl font-bold leading-tight tracking-[-0.015em]">
                <Link href={"/"} className="hover:underline">
                  Map-Diary
                </Link>
              </h1>
            </div>
            <div className="flex max-w-lg flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-lg flex-1">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                  이메일
                </p>
                <input
                  placeholder="you@example.com"
                  name="username"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                  value={payload.username}
                  onChange={onChangePayload}
                />
              </label>
            </div>
            <div className="flex max-w-lg flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col w-lg flex-1">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                  비밀번호
                </p>
                <input
                  placeholder="*******"
                  type="password"
                  name="password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                  value={payload.password}
                  onChange={onChangePayload}
                />
              </label>
            </div>
            <p className="text-[#637588] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline">
              비밀번호를 잃어버리셨나요?
            </p>
            <div className="flex px-4 py-3">
              <button
                type="submit"
                className="flex w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#1980e6] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">로그인</span>
              </button>
            </div>
            {/* <div className="flex px-4 py-3">
              <button className="flex w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#f0f2f4] text-[#111418] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]">
                <div
                  className="text-[#111418]"
                  data-icon="GoogleLogo"
                  data-size="20px"
                  data-weight="regular"
                >
                  <GoogleLogo />
                </div>
                <span className="truncate">Google 로그인</span>
              </button>
            </div>
            <div className="flex px-4 py-3">
              <button className="flex w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-yellow-400 text-[#111418] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]">
                <div
                  className="text-[#111418]"
                  data-icon="KakaoLogo"
                  data-size="10px"
                  data-weight="regular"
                >
                  <KakaoLogo />
                </div>
                <span className="truncate">Kakao 로그인</span>
              </button>
            </div> */}
            <p className="text-[#637588] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              계정이 없으신가요?
            </p>
            <div className="flex px-4 py-3">
              <Link
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-transparent text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                href={"/join"}
              >
                <span className="truncate">가입하기</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
      {overlay}
      </>
    </Suspense>
  );
}
