import { useState } from "react";
import { useNavigate } from "react-router-dom";

const relationOptions = [
  "연인·배우자",
  "친구",
  "지인·동료",
  "아이",
  "부모님",
  "친척·형제",
  "기타",
] as const;
const themeOptions = [
  "#휴양&힐링",
  "#비치&선셋",
  "#스노클링",
  "#스쿠버다이빙",
  "#해양액티비티",
  "#럭셔리리조트",
  "#풀빌라",
  "#로컬맛집",
  "#아시장투어",
  "#사진핫플",
  "#선셋바",
  "#야외트로드핑",
  "#프라이빗비치",
  "#커플여행",
] as const;
type RelationType = (typeof relationOptions)[number];
type ThemeType = (typeof themeOptions)[number];
export default function UserInfo3() {
    const nav = useNavigate();
    const [relations, setRelations] = useState<RelationType[]>([]);
    const [themes, setThemes] = useState<ThemeType[]>([]);
    const toggleRelation = (rel: RelationType) => {
        setRelations((prev) =>
        prev.includes(rel) ? prev.filter((r) => r !== rel) : [...prev, rel]
        );
    };
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
    if (relations.length === 0 && themes.length === 0) return;
        nav("/result"); // 결과 페이지 경로로 나중에 바꾸기
    };

    return (
        <main className="min-h-screen px-6 py-6">
        <p className="info-text">
            여행 동반자와의 관계를 선택해주세요.
        </p>
        <section className="relation-section">
            <div className="relation-title">
            <span className="relation-title-main">여행 동반자 관계</span>
            <span className="relation-title-sub">(선택, 복수가능)</span>
            </div>

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
            <p className="info-text">
            <br/>희망하는 여행 테마를 선택해주세요.
            </p>
        <section className="theme-section">
        <div className="theme-header">
            <div className="theme-title-left">
                <span className="theme-title-main">여행 테마</span>
                <span className="theme-title-sub">(복수가능)</span>
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
            disabled={relations.length === 0}
            className="mt-4 w-full h-14 rounded-2xl bg-gray-800 text-white disabled:bg-gray-300"
        >
            다음
        </button>
        </main>
    );
    }
