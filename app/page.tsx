import KakaoMap from "./component/KakaoMap";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50">
      <KakaoMap />
    </div>
  );
}
