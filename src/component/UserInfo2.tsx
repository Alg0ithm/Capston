import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
// -----------------------------
// 타입 정의
// -----------------------------
type AgeBand =
  | "0~9세"
  | "10대"
  | "20대"
  | "30대"
  | "40대"
  | "50대"
  | "60대";

interface AgeGroup {
  id: number;
  ageBand: AgeBand;
  count: number;
}

const ageBandOptions: AgeBand[] = [
  "0~9세",
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대",
];

const relationOptions = [
  "형제/자매",
  "친인척",
  "배우자",
  "자녀",
  "친구",
  "연인",
  "동료",
  "부모",
  "친목 단체/모임",
  "기타",
] as const;

type RelationType = (typeof relationOptions)[number];

export default function UserInfo2() {
  const nav = useNavigate();
  const location = useLocation();
  const base = (location.state ?? {}) as {
    region?: string;
    gender?: string;
    age?: string;
  };

  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([
    { id: 1, ageBand: "20대", count: 0 }, // 🔹 기본값: 20대
  ]);
  const [relations, setRelations] = useState<RelationType[]>([]);
  const total = ageGroups.reduce((sum, g) => sum + g.count, 0);

  // -----------------------------
  // 핸들러
  // -----------------------------
  const prev = () => {nav("/user-info", { state: base });}
  const next = () => {
    if (total === 0) return; 
    const companion_relations = relations;
    const companion_age_groups = ageGroups
      .filter((g) => g.count > 0)
      .flatMap((g) => Array(g.count).fill(g.ageBand));

    nav("/user-info3", {
      state: {
        ...base,                 // region, gender, age 그대로 전달
        companion_relations,     // RelationType[]
        companion_age_groups,    // AgeBand[] (인원 수만큼)
      },
    });
  };

  const addAgeGroup = () => {
    setAgeGroups((prev) => [
      ...prev,
      { id: Date.now(), ageBand: "20대", count: 0 },
    ]);
  };

  const removeAgeGroup = (id: number) => {
    setAgeGroups((prev) =>
      prev.length <= 1 ? prev : prev.filter((g) => g.id !== id),
    );
  };
  const changeAgeBand = (id: number, ageBand: AgeBand) => {
    setAgeGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ageBand } : g)),
    );
  };

  // 인원 수 +/- 변경
  const changeCount = (id: number, delta: number) => {
    setAgeGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, count: Math.max(0, g.count + delta) }
          : g,
      ),
    );
  };
  const toggleRelation = (rel: RelationType) => {
    setRelations((prev) =>
      prev.includes(rel) ? prev.filter((r) => r !== rel) : [...prev, rel],
    );
  };

  return (
    <main className="min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold">동반자 정보</h2>
      <p className="info-text">
        동반자 정보를 알려주세요.
        Ai가 상세 일정을 제공해드립니다.
      </p>

      <section className="mt-6">
        <h3 className="text-sm font-medium mb-2">여행 동반자수 총 {total}명</h3>

        {/* 연령대 + 인원 수 */}
        <div className="adult-section">
          <div className="adult-rows">
            {ageGroups.map((g) => (
              <div key={g.id} className="adult-row">
                <div className="adult-select-wrapper">
                  <select
                    className="adult-select"
                    value={g.ageBand}
                    onChange={(e) =>
                      changeAgeBand(g.id, e.target.value as AgeBand)
                    }
                  >
                    {ageBandOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="adult-remove"
                    onClick={() => removeAgeGroup(g.id)}
                  >
                    ×
                  </button>
                </div>

                <div className="counter-controls">
                  <button
                    type="button"
                    className="circle-btn"
                    onClick={() => changeCount(g.id, -1)}
                    disabled={g.count === 0}
                  >
                    −
                  </button>
                  <span className="counter-value">{g.count}</span>
                  <button
                    type="button"
                    className="circle-btn"
                    onClick={() => changeCount(g.id, +1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="adult-add-btn"
            onClick={addAgeGroup}
          >
            + 동반자 연령대 추가
          </button>
        </div>

        {/* 동반자 관계 선택 */}
        <p className="info-text mt-8">
          여행 동반자와의 관계를 선택해주세요. (복수 선택 가능)
        </p>
        <section className="relation-section">
          <div className="relation-group">
            {relationOptions.map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => toggleRelation(rel)}
                className="relation-chip"
                aria-pressed={relations.includes(rel)}
              >
                {rel}
              </button>
            ))}
          </div>
        </section>
      </section>

      {/* 이전 / 다음 버튼 */}
      <div className="action-buttons">
        <button
          type="button"
          onClick={prev}
          className="nav-btn nav-btn--secondary"
        >
          이전
        </button>
        <button
          type="button"
          onClick={next}
          className="nav-btn nav-btn--primary"
          disabled={total === 0}
        >
          다음
        </button>
      </div>
    </main>
  );
}
