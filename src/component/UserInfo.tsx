import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserInfo() {
  const nav = useNavigate();
  const [gender, setGender] = useState<"male"|"female"|"prefer_not_to_say" | null>(null);
  const [ageBand, setAgeBand] = useState<"10s"|"20s"|"30s"|"40s"|"50s"|"60s+" | null>(null);

  const next = () => {
    // TODO: 전역상태/컨텍스트/쿼리로 저장 후 다음 단계 이동
    nav("/onboarding/preferences");
  };

  return (
    <main className="min-h-screen px-6 py-6">
      <h2 className="text-lg font-semibold">여행자 정보</h2>
      <p className="mt-1 text-sm text-gray-500">
        AI가 최적의 여행을 설계할 수 있도록 기본 정보를 알려주세요.
      </p>

      <section className="mt-6">
        <h3 className="text-sm font-medium mb-2">성별</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {key:"male",label:"남성"},
            {key:"female",label:"여성"},
          ].map(opt=>(
            <button
              key={opt.key}
              onClick={()=>setGender(opt.key as typeof gender)}
              className={`h-12 rounded-xl border text-sm font-semibold
                ${gender===opt.key ? "bg-gray-300 border-gray-400" : "bg-gray-100 border-gray-200"}`}
              aria-pressed={gender===opt.key}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={()=>setGender("prefer_not_to_say")}
          className="mt-2 text-xs text-gray-500 underline"
        >
          선택 안 함
        </button>
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
        disabled={!ageBand}
        onClick={next}
        className="mt-8 w-full h-14 rounded-2xl bg-gray-800 text-white disabled:bg-gray-300"
      >
        다음
      </button>
    </main>
  );
}