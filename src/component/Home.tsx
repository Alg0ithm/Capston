import { Link } from "react-router-dom";
export default function Home() {
  return (
    <main className="min-h-screen flex items-center bg-white">
      <div className="w-full max-w-md mx-auto px-6">
        <h1 className="text-[28px] leading-snug font-extrabold text-gray-800">
          당신의 여행,<br />
          나트랑부터 푸꾸옥까지,<br />
          딱 맞는 여행지를 찾아드려요
        </h1>

        <p className="mt-3 text-[15px] text-gray-500">
          간단한 선택으로 시작하세요
        </p>

        <Link
          to="/user-info"
          className="block mt-10 w-full h-14 rounded-2xl bg-gray-100 text-gray-800
                     font-semibold text-center leading-[56px] shadow-sm
                     hover:bg-gray-200 active:scale-[0.99] transition"
          aria-label="시작하기"
        >
          시작하기
        </Link>
      </div>
    </main>
  );
}