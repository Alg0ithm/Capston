// src/Result.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ---------- 타입 (백엔드 main.py 기준) ----------

interface RecommendRequest {
  region: string;
  categories: string[];
  gender: string;
  age: number;
  days: number;
  companion_relations: string[];
  companion_age_groups: string[];
}

interface PriceOut {
  age_type: string;
  price_text: string;
}

interface OptionOut {
  product_id: string;
  option_name: string;
  prices: PriceOut[];
}

interface ProductOut {
  product_id: string;
  region: string;
  product_name: string;
  place_type: string;
  category: string;
  options: OptionOut[];
  description?: string | null;
}

interface RecommendResponse {
  products: ProductOut[];
  report: string;
}

export default function Result() {
  const nav = useNavigate();

  const [data, setData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommend = async () => {
      setLoading(true);
      setError(null);

      // TODO: 나중에 UserInfo / UserInfo2 / UserInfo3에서 받은 값으로 교체
      const payload: RecommendRequest = {
        region: "푸꾸옥",
        categories: ["투어/액티비티"], // themes
        gender: "female",
        age: 25, // 나이대 → 대표 숫자로 변환
        days: 3, // UserInfo3에서 받은 여행 기간
        companion_relations: ["친구"], // UserInfo2
        companion_age_groups: ["20대"], // UserInfo2
      };

      try {
        const res = await fetch("http://localhost:8000/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`서버 오류 (${res.status})`);
        }

        const json = (await res.json()) as RecommendResponse;
        setData(json);
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommend();
  }, []);

  const goHome = () => nav("/");
  const goBack = () => nav("/user-info3");

  return (
    <main className="min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold">추천 결과</h2>
      <p className="mt-1 text-sm text-gray-500">
        입력하신 정보를 바탕으로 AI가 추천한 여행 패키지입니다.
      </p>

      {/* 로딩 */}
      {loading && (
        <p className="mt-6 text-sm text-gray-500">
          추천 결과를 불러오는 중입니다...
        </p>
      )}

      {/* 에러 */}
      {error && (
        <p className="mt-6 text-sm text-red-500">
          추천 요청 중 오류가 발생했습니다: {error}
        </p>
      )}

      {/* 결과 없음 */}
      {!loading && !error && data && data.products.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          조건에 맞는 패키지를 찾지 못했습니다. 조건을 바꿔 다시 시도해 주세요.
        </p>
      )}

      {/* 결과 있을 때 */}
      {data && data.products.length > 0 && (
        <>
          {/* AI 요약 텍스트 */}
          <section className="mt-6 p-4 rounded-2xl bg-gray-100">
            <h3 className="text-base font-semibold mb-2">AI 요약</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {data.report}
            </p>
          </section>

          {/* 패키지 카드 리스트 */}
          <section className="mt-6 space-y-4">
            {data.products.map((p) => (
              <article
                key={p.product_id}
                className="border border-gray-200 rounded-2xl p-4 shadow-sm"
              >
                <h3 className="text-base font-semibold">{p.product_name}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {p.region} · {p.category} · {p.place_type}
                </p>

                {p.options.map((opt) => (
                  <div
                    key={opt.option_name}
                    className="mt-3 rounded-xl bg-gray-50 p-3"
                  >
                    <div className="text-sm font-medium">
                      {opt.option_name}
                    </div>
                    <ul className="mt-1 text-xs text-gray-600 space-y-1">
                      {opt.prices.map((price) => (
                        <li
                          key={price.age_type + price.price_text}
                          className="flex justify-between"
                        >
                          <span>{price.age_type}</span>
                          <span>{price.price_text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </article>
            ))}
          </section>
        </>
      )}

      {/* 하단 버튼들 */}
      <div className="action-buttons">
        <button
          type="button"
          onClick={goBack}
          className="nav-btn nav-btn--secondary"
        >
          이전
        </button>
        <button
          type="button"
          onClick={goHome}
          className="nav-btn nav-btn--primary"
        >
          처음으로
        </button>
      </div>
    </main>
  );
}
