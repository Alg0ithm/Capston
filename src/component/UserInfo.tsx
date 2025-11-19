import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserInfo() {
    const nav = useNavigate();
    const [gender, setGender] = useState<"male"|"female"|"prefer_not_to_say" | null>(null);
    const [ageBand, setAgeBand] = useState<"10s"|"20s"|"30s"|"40s"|"50s"|"60s+" | null>(null);
    const [destination, setDestination] = useState<"푸꾸옥"|"나트랑" | null>(null);

    const next = () => {
    nav("/user-info2");
    };
    const prev =() =>{
        nav("/");
    }

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
            <h3 className="text-sm font-medium mb-2">나이대</h3>
            <select
            className="w-full h-12 rounded-xl bg-gray-100 px-4"
            value={ageBand ?? ""}
            onChange={(e)=>setAgeBand(e.target.value as any)}
            >
            <option value="" disabled>나이대를 선택하세요</option>
            <option value="10s">10대</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대</option>
            <option value="50s">50대</option>
            <option value="60s+">60대 이상</option>
            </select>
        </section>
       
        <button
            onClick={prev}
            className="mt-8 w-full h-14 rounded-2xl bg-gray-800 text-white disabled:bg-gray-300"
            >
            이전
        </button>
        <button
            disabled={!gender || !ageBand || !destination}
            onClick={next}
            className="mt-8 w-full h-14 rounded-2xl bg-gray-800 text-white disabled:bg-gray-300"
            >
            다음
        </button>
    </main>
  );
}