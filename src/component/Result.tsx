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
const getDisplayPrice = (product: Product): string => {
  const firstOpt = product.options[0];
  const firstPrice = firstOpt?.prices[0];
  return firstPrice?.price_text ?? "";
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
  const reportBlocks = report ? report.split(/\n{2,}/) : [];
  return (
    <main className="min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold">추천 결과</h2>
      <p className="mt-1 text-sm text-gray-500">
        버튼을 누르면 서버에서 추천 결과를 받아옵니다.
      </p>

      {/* 추천 요청 버튼 */}
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

      {/* ─────────────────────────────
          상품 카드 그리드 (최대 5개)
          ───────────────────────────── */}
      <section className="mt-6">
        <h3 className="text-sm font-medium mb-3">
          추천 패키지
          {products.length > 0 && (
            <span className="ml-1 text-xs text-gray-400">
              ({products.length}개)
            </span>
          )}
        </h3>

        {data && products.length === 0 ? (
          <p className="text-sm text-gray-500">
            조건에 맞는 추천 상품을 찾지 못했습니다.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((item, idx) => {
              const displayPrice = getDisplayPrice(item);

              return (
                <article
                  key={item.product_id}
                  className="flex flex-col rounded-2xl border bg-white shadow-sm p-4 gap-2"
                >
                  {/* 상단 메타 정보 */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                      추천 {idx + 1}
                    </span>
                    <span>
                      {item.region} · {item.place_type}
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-semibold leading-snug line-clamp-2">
                    {item.product_name}
                  </h3>
                  <p className="text-[11px] text-gray-500">{item.category}</p>
                  {displayPrice && (
                    <p className="mt-1 text-sm font-semibold">
                      {displayPrice}
                    </p>
                  )}

                  {/* 옵션 요약 (옵션 이름만 간단히 표시) */}
                  {item.options.length > 0 && (
                    <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                      {item.options
                        .map((opt) => opt.option_name)
                        .slice(0, 3)
                        .join(" · ")}
                      {item.options.length > 3 && " · ..."}
                    </p>
                  )}

                  {/* 상품 코드 */}
                  <p className="mt-2 text-[11px] text-gray-400">
                    상품 코드: {item.product_id}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>


      {reportBlocks.length > 0 && (
        <section className="mt-8">
          <h3 className="text-base font-semibold mb-3">추천 설명</h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reportBlocks.map((block, idx) => (
              <article
                key={idx}
                className="rounded-2xl border bg-white p-4 text-sm text-gray-700 shadow-sm leading-relaxed"
              >
                <div className="mb-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  추천 포인트 {idx + 1}
                </div>
                <p className="whitespace-pre-line">{block.trim()}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 이전 버튼 */}
      <div className="mt-10">
        <button
          type="button"
          onClick={() => nav("/user-info3", { state: requestBody })}
          className="w-full h-14 rounded-2xl bg-gray-100 text-gray-800"
        >
          이전
        </button>
      </div>
    </main>
  );
}