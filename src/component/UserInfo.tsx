import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserInfo() {
    const nav = useNavigate();
    const [gender, setGender] = useState<"male"|"female"|"prefer_not_to_say" | null>(null);
    const [ageBand, setAgeBand] = useState<"10대"|"20대"|"30대"|"40대"|"50대"|"60대" | "">("");
    const [destination, setDestination] = useState<"푸꾸옥"|"나트랑" | null>(null);

    const next = () => {
    nav("/user-info2");
    };
    const prev =() =>{
        nav("/");
    }
    type AgeBand = "10대" | "20대" | "30대" | "40대" | "50대" | "60대";
  return (
        <main className="min-h-screen px-6 py-6 ">
        <h2 className="text-lg font-semibold">여행자 정보</h2>
        <p className="mt-1 text-sm text-gray-500">
            AI가 최적의 여행을 설계할 수 있도록 기본 정보를 알려주세요.
        </p>

        <section className="mt-6">
        <h3 className="text-sm font-medium mb-2">성별</h3>
        <div className="option-group">
            {([
            { value: "male", label: "남성" },
            { value: "female", label: "여성" },
            ] as const).map(({ value, label }) => (
            <button
                type="button"
                key={value}
                onClick={() => setGender(value)}
                className="option-btn"
                aria-pressed={gender === value}
            >
                {label}
            </button>
            ))}
        </div>
        </section>

        <section className="mt-6">
            <h3 className="text-sm font-medium mb-2">관광지</h3>
            <div className="option-group">
            {(["푸꾸옥", "나트랑"] as const).map((d) => (
            <button
                type="button"
                key={d}
                onClick={() => setDestination(d)}
                className="option-btn"
                aria-pressed={destination === d}
                >
              {d}
            </button>
            ))}
            </div>
        </section>
        <section className="mt-6">
            <h3 className="age-label">나이대</h3>
                <div className="age-select-wrapper">
                    <select
                    className="age-select"
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value as AgeBand)}
                    >
                    <option value="">나이대를 선택하세요</option>
                    <option value="10대">10대</option>
                    <option value="20대">20대</option>
                    <option value="30대">30대</option>
                    <option value="40대">40대</option>
                    <option value="50대">50대</option>
                    <option value="60대">60대</option>
                    </select>
                </div>
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
          disabled={gender === null || ageBand === null || destination === null}
        >
          다음
        </button>
      </div>
    </main>
  );
}