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
    const [isOpen, setIsOpen] = useState(false);
    const [adult, setAdult] = useState(0);
    const [child, setChild] = useState(0);
    const [infant, setInfant] = useState(0);
    const total = adult + child + infant;
    const [relations, setRelations] = useState<RelationType[]>([]);
    const [companion, setCompanion] = useState<number | null>(null);
    const [adultGroups, setAdultGroups] = useState<AdultGroup[]>([
    { id: 1, ageBand: "20대", count: 0 },
  ]);
    const handleClose = () => {
    setCompanion(total || null);
    setIsOpen(false);
  };
  const toggleRelation = (rel: RelationType) => {
    setRelations((prev) =>
      prev.includes(rel) ? prev.filter((r) => r !== rel) : [...prev, rel]
    );
  };
  const next = () => {
    if (companion === null) return; 
    nav("/");
  };
    const addAdultGroup = () => {
    setAdultGroups((prev) => [
      ...prev,
      { id: Date.now(), ageBand: "20대", count: 0 },
    ]);
  };
  const rows = [
    { label: "성인", desc: "20세 이상", value: adult, setValue: setAdult },
    { label: "청소년", desc: "13~19세", value: child, setValue: setChild },
    { label: "소아", desc: "13세 미만", value: infant, setValue: setInfant },
  ];
    const relationOptions = [
    "연인·배우자",
    "친구",
    "지인·동료",
    "아이",
    "부모님",
    "친척·형제",
    "기타",
    ] as const;
    type RelationType = (typeof relationOptions)[number];
    const removeAdultGroup = (id: number) => {
        setAdultGroups((prev) =>
        prev.length <= 1 ? prev : prev.filter((g) => g.id !== id)
    );
  };

    const changeAdultAge = (id: number, ageBand: AdultAgeBand) => {
        setAdultGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ageBand } : g))
    );
  };

    const changeAdultCount = (id: number, delta: number) => {
        setAdultGroups((prev) =>
        prev.map((g) =>
        g.id === id ? { ...g, count: Math.max(0, g.count + delta) } : g
      )
    );
  };
  return (
    <main className="min-h-screen px-6 py-6">
      <p className="info-text">
        동반자 정보를 알려주세요.
        Ai가 상세 일정을 제공해드립니다.
        </p>

      <section className="mt-6">
        <h3 className="text-sm font-medium mb-2">여행 동반자수</h3>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            "select-trigger " + (total === 0 ? "placeholder" : "")
          }
        >
          <span>
            {total === 0
              ? "선택하세요"
              : `총 ${total}명 (성인 ${adult} · 소아 ${child} · 유아 ${infant})`}
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>열기 ▼</span>
        </button>
      </section>

    {isOpen && (
        <div className="bottom-sheet-overlay">
            <div className="bottom-sheet">
                <div className="sheet-header">
                    <h3 className="sheet-title">여행 동반자수</h3>
                    <button
                    type="button"
                    className="sheet-close"
                    onClick={handleClose}
            >
            ×
            </button>
        </div>

        {/* 🔹 성인 영역 (사진처럼 여러 줄) */}
        <div className="adult-section">
            <div className="adult-header">
            <span className="adult-header-main">성인</span>
            <span className="adult-header-sub">20세 이상</span>
            </div>

            <div className="adult-rows">
            {adultGroups.map((g) => (
                <div key={g.id} className="adult-row">
                {/* 왼쪽: 나이대 select + X */}
                <div className="adult-select-wrapper">
                    <select
                    className="adult-select"
                    value={g.ageBand}
                    onChange={(e) =>
                        changeAdultAge(
                        g.id,
                        e.target.value as AdultAgeBand
                        )
                    }>
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

                {/* 오른쪽: - 1 + 카운터 */}
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

        {/* + 동반 성인 추가 */}
        <button
          type="button"
          className="adult-add-btn"
          onClick={addAdultGroup}
        >
          + 동반 성인 추가
        </button>
        </div>

      {/* 🔹 소아 */}
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

      {/* 🔹 유아 */}
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

      <button
        type="button"
        className="bottom-close-btn"
        onClick={handleClose}
      >
        완료
      </button>
    </div>
  </div>
)}

      <button onClick={next}>다음</button>
    </main>
  );
}
