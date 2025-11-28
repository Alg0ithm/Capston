import { useNavigate, useLocation } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

// 1. 요청 타입 
type RecommendRequest = {
  region: string;
  categories: string[];
  gender: string;
  age: string;
  days: number;
  companion_relations: string[];
  companion_age_groups: string[];
};

// 2. 백엔드 응답 타입
type Price = {
  age_type: string;
  price_text: string;
};

type Option = {
  product_id: string;
  option_name: string;
  prices: Price[];
};

type Product = {
  product_id: string;
  region: string;
  product_name: string;
  place_type: string;
  category: string;
  options: Option[];
};

type RecommendResponse = {
  products: Product[];
  report: string;
};

export default function Result() {
  const nav = useNavigate();
  const location = useLocation();
  //  UserInfo3에서 nav("/result", { state: body }) 로 넘긴 값만 사용
  const requestBody = location.state as RecommendRequest | undefined;

 
  if (!requestBody) {
    return (
      <main className="min-h-screen px-6 py-6">
        <h2 className="text-lg font-semibold">추천 결과</h2>
        <p className="mt-4 text-sm text-red-500">
          이전 화면에서 여행 정보를 먼저 입력해주세요.
        </p>
        <button
          type="button"
          onClick={() => nav("/user-info")}
          className="mt-6 w-full h-14 rounded-2xl bg-gray-800 text-white"
        >
          처음으로 이동
        </button>
      </main>
    );
  }

  const {
    data,
    loading,
    error,
    execute: fetchRecommend,
  } = useFetch<RecommendRequest, RecommendResponse>(
    "http://localhost:8000/recommend",
  );

  const handleRecommend = () => {
    fetchRecommend(requestBody).catch(() => {
    });
  };

  const products = data?.products ?? [];
  const report = data?.report ?? "";

  return (
    <main className="min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold">추천 결과</h2>
      <p className="mt-1 text-sm text-gray-500">
        버튼을 누르면 서버에서 추천 결과를 받아옵니다.
      </p>

      <button
        type="button"
        onClick={handleRecommend}
        disabled={loading}
        className="mt-6 w-full h-14 rounded-2xl bg-gray-800 text-white disabled:bg-gray-400"
      >
        {loading ? "추천 불러오는 중..." : "추천 받기"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-500">
          에러가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}

      {/* 상품 카드 리스트 */}
      <section className="mt-6 space-y-3">
        {products.map((item) => (
          <div
            key={item.product_id}
            className="border rounded-xl p-4 text-sm flex flex-col gap-2"
          >
            <div className="font-semibold">{item.product_name}</div>
            <div className="text-gray-500">
              {item.region} · {item.place_type} · {item.category}
            </div>
            <div className="text-xs text-gray-400">
              상품 코드: {item.product_id}
            </div>

            {/* 옵션 + 가격 정보 */}
            {item.options.length > 0 && (
              <div className="mt-2 space-y-1">
                {item.options.map((opt) => (
                  <div key={opt.option_name} className="text-xs">
                    <div className="font-medium">{opt.option_name}</div>
                    <div className="text-gray-500">
                      {opt.prices
                        .map((p) => `${p.age_type}: ${p.price_text}`)
                        .join(" / ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* AI 설명(report) 블록 */}
      {report && (
        <section className="mt-8 p-4 rounded-xl bg-gray-50 text-sm text-gray-700 whitespace-pre-line">
          <h3 className="font-semibold mb-2">추천 설명</h3>
          {report}
        </section>
      )}
      <div className="action-buttons">
      <button
        type="button"
        onClick={() => nav("/user-info3", { state: requestBody })}
        className="mt-10 w-full h-14 rounded-2xl bg-gray-100 text-gray-800"
      >
        이전
      </button>
      </div>
    </main>
  );
}
