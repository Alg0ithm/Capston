import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

type RecommendRequest = {
  region: string;
  categories: string[];
  gender: string;
  age: string;
  days: number;
  companion_relations: string[];
  companion_age_groups: string[];
};

// 백엔드 응답 타입
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

// 카드에 보여줄 대표 가격
const getDisplayPrice = (product: Product): string => {
  const firstOpt = product.options[0];
  const firstPrice = firstOpt?.prices[0];
  return firstPrice?.price_text ?? "";
};

export default function Result() {
  const nav = useNavigate();
  const location = useLocation();
  const requestBody = location.state as RecommendRequest | undefined;

  // 어떤 카드가 선택돼 있는지 (인덱스)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    fetchRecommend(requestBody).catch(() => {});
  };

  const products = data?.products ?? [];
  const report = data?.report ?? "";

  // 보고서 텍스트를 문단 단위로 쪼갬 (빈 줄 기준)
  const reportBlocks = report ? report.split(/\n{2,}/) : [];

  // 상위 5개만 사용
  const topProducts = products.slice(0, 5);

  // 선택된 패키지
  const selectedProduct =
    selectedIndex !== null ? topProducts[selectedIndex] : null;

  // 선택된 패키지에 매칭되는 설명(있으면)
  const selectedReport =
    selectedIndex !== null ? reportBlocks[selectedIndex] ?? "" : "";

  return (
    <main className="page-main min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold text-center">추천 결과</h2>
      <p className="mt-1 text-sm text-gray-500 text-center">
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
          상품 카드 그리드 (최대 5개, 한 줄)
          ───────────────────────────── */}
      <section className="mt-8">
        <h3 className="text-sm font-medium mb-3 text-center">
          추천 패키지
          {topProducts.length > 0 && (
            <span className="ml-1 text-xs text-gray-400">
              ({topProducts.length}개)
            </span>
          )}
        </h3>

        {data && topProducts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            조건에 맞는 추천 상품을 찾지 못했습니다.
          </p>
        ) : (
          <div className="result-grid">
            {topProducts.map((item, idx) => {
              const displayPrice = getDisplayPrice(item);
              const isSelected = idx === selectedIndex;

              return (
                <article
                  key={item.product_id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`result-card cursor-pointer transition-shadow ${
                    isSelected ? "shadow-md ring-2 ring-gray-400" : ""
                  }`}
                >
                  <h3 className="text-sm font-semibold leading-snug">
                    {item.product_name}
                  </h3>

                  {displayPrice && (
                    <p className="mt-3 text-base font-bold text-gray-800">
                      {displayPrice}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-500">
                    {item.region} · {item.place_type} · {item.category}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────────────────────
          선택한 패키지 상세 + 설명
          ───────────────────────────── */}
      {selectedProduct && (
        <section className="mt-10">
          <h3 className="text-base font-semibold mb-3 text-center">
            추천 설명
          </h3>

          <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-700 leading-relaxed">
            <h4 className="text-base font-semibold mb-2 text-center">
              {selectedProduct.product_name}
            </h4>

            {/* 옵션 / 가격 요약 */}
            {selectedProduct.options.length > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                {selectedProduct.options.map((opt) => (
                  <div key={opt.option_name} className="mt-1">
                    <span className="font-medium">{opt.option_name}</span>{" "}
                    <span>
                      {opt.prices
                        .map((p) => `${p.age_type}: ${p.price_text}`)
                        .join(" / ")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* LLM이 만든 설명 매칭 */}
            {selectedReport && (
              <>
                <div className="mt-4 mb-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  추천 포인트 {selectedIndex! + 1}
                </div>
                <p className="whitespace-pre-line mt-1">{selectedReport.trim()}</p>
              </>
            )}

            {!selectedReport && (
              <p className="mt-4 text-xs text-gray-500">
                이 패키지에 대한 추가 설명이 없습니다. 위 기본 정보를 참고해주세요.
              </p>
            )}
          </div>
        </section>
      )}

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
