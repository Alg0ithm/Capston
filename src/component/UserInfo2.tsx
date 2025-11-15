import { useState } from "react";
import { useNavigate } from "react-router-dom";

type AdultAgeBand = "20대" | "30대" | "40대" | "50대" | "60대 이상";

interface AdultGroup {
  id: number;
  ageBand: AdultAgeBand;
  count: number;
}

const adultAgeOptions: AdultAgeBand[] = [
  "20대",
  "30대",
  "40대",
  "50대",
  "60대 이상",
];

export default function UserInfo2() {
  const nav = useNavigate();
  const [adultGroups] = useState<AdultGroup[]>([
    { id: 1, ageBand: "20대", count: 0 },
  ]);
  const [adultGroupsState, setAdultGroups] = useState<AdultGroup[]>(adultGroups);
  const [child, setChild] = useState(0);
  const [infant, setInfant] = useState(0);

  const totalAdult = adultGroupsState.reduce((sum, g) => sum + g.count, 0);
  const total = totalAdult + child + infant;

  const prev = () => {
    nav("/user-info");
  };

  const next = () => {
    if (total === 0) return;
    nav("/user-info3");
  };

  const addAdultGroup = () => {
    setAdultGroups((prev) => [
      ...prev,
      { id: Date.now(), ageBand: "20대", count: 0 },
    ]);
  };

  const removeAdultGroup = (id: number) => {
    setAdultGroups((prev) =>
      prev.length <= 1 ? prev : prev.filter((g) => g.id !== id),
    );
  };

  const changeAdultAge = (id: number, ageBand: AdultAgeBand) => {
    setAdultGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ageBand } : g)),
    );
  };

  const changeAdultCount = (id: number, delta: number) => {
    setAdultGroups((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, count: Math.max(0, g.count + delta) } : g,
      ),
    );
  };

  return (
    <main className="min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold">여행자 정보</h2>
      <p className="info-text">
        동반자 정보를 알려주세요.
        Ai가 상세 일정을 제공해드립니다.
      </p>

      <section className="mt-6">
        <h3 className="text-sm font-medium mb-2">여행 동반자수</h3>
        <div style={{ marginBottom: 8, fontSize: 13, color: "#6b7280" }}>
          총 {total}명 (성인 {totalAdult} · 소아 {child} · 유아 {infant})
        </div>
        <div className="adult-section">
          <div className="adult-header">
            <span className="adult-header-main">성인</span>
            <span className="adult-header-sub">20세 이상</span>
          </div>

          <div className="adult-rows">
            {adultGroupsState.map((g) => (
              <div key={g.id} className="adult-row">
                <div className="adult-select-wrapper">
                  <select
                    className="adult-select"
                    value={g.ageBand}
                    onChange={(e) =>
                      changeAdultAge(g.id, e.target.value as AdultAgeBand)
                    }
                  >
                    {adultAgeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="adult-remove"
                    onClick={() => removeAdultGroup(g.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="counter-controls">
                  <button
                    type="button"
                    className="circle-btn"
                    onClick={() => changeAdultCount(g.id, -1)}
                    disabled={g.count === 0}
                  >
                    −
                  </button>
                  <span className="counter-value">{g.count}</span>
                  <button
                    type="button"
                    className="circle-btn"
                    onClick={() => changeAdultCount(g.id, +1)}
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
            onClick={addAdultGroup}
          >
            + 동반 성인 추가
          </button>
        </div>
        <div className="counter-row">
          <div>
            <div className="counter-label">소아</div>
            <div className="counter-desc">2~12세</div>
          </div>
          <div className="counter-controls">
            <button
              type="button"
              className="circle-btn"
              onClick={() => setChild((v) => Math.max(0, v - 1))}
              disabled={child === 0}
            >
              −
            </button>
            <span className="counter-value">{child}</span>
            <button
              type="button"
              className="circle-btn"
              onClick={() => setChild((v) => v + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* ---- 유아 ---- */}
        <div className="counter-row">
          <div>
            <div className="counter-label">유아</div>
            <div className="counter-desc">2세 미만</div>
          </div>
          <div className="counter-controls">
            <button
              type="button"
              className="circle-btn"
              onClick={() => setInfant((v) => Math.max(0, v - 1))}
              disabled={infant === 0}
            >
              −
            </button>
            <span className="counter-value">{infant}</span>
            <button
              type="button"
              className="circle-btn"
              onClick={() => setInfant((v) => v + 1)}
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/*  이전 / 다음 버튼 */}
      <button
        type="button"
        onClick={prev}
        className="mt-8 w-full h-14 rounded-2xl bg-gray-800 text-white disabled:bg-gray-300"
      >
        이전
      </button>
      <button
        type="button"
        onClick={next}
        className="mt-4 w-full h-14 rounded-2xl bg-gray-800 text-white disabled:bg-gray-300"
      >
        다음
      </button>
    </main>
  );
}
