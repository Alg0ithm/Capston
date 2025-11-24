import { useState } from "react";
import { useNavigate } from "react-router-dom";

const themeOptions = [
  "투어/액티비티",
  "스파",
  "티켓&푸드",
  "0.5박&모닝&샌드투어",
] as const;

type ThemeType = (typeof themeOptions)[number];

export default function UserInfo3() {
  const nav = useNavigate();

  const [themes, setThemes] = useState<ThemeType[]>([]);
  const [days, setDays] = useState<number>(3); // 🔹 기본 3일

  const toggleTheme = (theme: ThemeType) => {
    setThemes((prev) =>
      prev.includes(theme)
        ? prev.filter((t) => t !== theme)
        : [...prev, theme],
    );
  };

  const prev = () => {
    nav("/user-info2");
  };

  const next = () => {
    if (days <= 0 || themes.length === 0) return;
    nav("/result");
  };

  return (
    <main className="min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold">여행 정보</h2>

      {/* 🔹 여행 기간 (키오스크용 단순 카운터) */}
      <p className="info-text">
        여행 기간을 선택해주세요.
      </p>
      <section className="mt-4">
        <div className="counter-row">
          <div>
            <div className="counter-label">여행 기간</div>
            <div className="counter-desc">일수를 맞춰주세요</div>
          </div>
          <div className="counter-controls">
            <button
              type="button"
              className="circle-btn"
              onClick={() => setDays((d) => Math.max(1, d - 1))}
              disabled={days <= 1}
            >
              −
            </button>
            <span className="counter-value">
              {days}
            </span>
            <button
              type="button"
              className="circle-btn"
              onClick={() => setDays((d) => Math.min(30, d + 1))}
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* 🔹 여행 테마 선택 */}
      <p className="info-text">
        <br />
        희망하는 여행 테마를 선택해주세요.
      </p>
      <section className="theme-section">
        <div className="theme-header">
          <div className="theme-title-left">
            <span className="theme-title-main">여행 테마</span>
            <span className="theme-title-sub">(복수 선택 가능)</span>
          </div>
        </div>
        <div className="relation-group">
          {themeOptions.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => toggleTheme(theme)}
              className="relation-chip"
              aria-pressed={themes.includes(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
      </section>

      {/* 🔹 이전 / 다음 버튼 */}
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
          disabled={days <= 0 || themes.length === 0}
        >
          다음
        </button>
      </div>
    </main>
  );
}