# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional

import numpy as np
import markdown2

from embeddings import load_embeddings, embedding_query
from db import *
from rag_pipeline import create_report
 
app = FastAPI(title="Travel Kiosk API")

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 임베딩 저장소
embedding_store = None


@app.on_event("startup")
def startup_event():
    init_db()

    load_logs_from_csv()
    load_products_from_csv()
    load_prices_from_csv()

    # 🔸 전역 변수로 embedding_store 사용
    global embedding_store
    embedding_store = load_embeddings()

    print("서버 로딩 완료")


# ----------------------------------------------------------
# 요청/응답 모델 정의
# ----------------------------------------------------------
class RecommendRequest(BaseModel):
    region: str
    categories: List[str]
    gender: str
    age: str
    days: int
    companion_relations: List[str]
    companion_age_groups: List[str]


class PriceOut(BaseModel):
    age_type: str
    price_text: str


class OptionOut(BaseModel):
    product_id: str
    option_name: str
    prices: List[PriceOut]


class ProductOut(BaseModel):
    product_id: str
    region: str
    product_name: str
    place_type: str
    category: str
    options: List[OptionOut]
    # 👇 LLM이 만들어준 상품 설명(마크다운)이 들어갈 자리
    description: Optional[str] = None



@app.post("/recommend")
def recommend(req: RecommendRequest):

    # 1) 쿼리 임베딩 만들기
    query_text, query_vec = embedding_query({
        "place": req.region,
        "days": req.days,
        "companion_relation": ", ".join(req.companion_relations),
        "companion_age_group": ", ".join(req.companion_age_groups),
        "gender": req.gender,
        "age": req.age,
        "category": ", ".join(req.categories)
    })

    db_vectors = embedding_store["embeddings"]
    trip_ids = embedding_store["trip_ids"]

    # 코사인 유사도 분석 (cosine = dot, normalize_embeddings=True 상태)
    scores = np.dot(db_vectors, query_vec)

    # 상위 N개의 trip_id 추출
    N = 50
    top_idx = np.argsort(scores)[::-1][:N]
    similar_trip_ids = [trip_ids[i] for i in top_idx]

    # 2) 유사한 여행로그 가져오기
    logs = logs_from_trip_ids(similar_trip_ids)

    # 🔸 여기서 "나중에" 지역 필터 적용
    logs = [log for log in logs if log["place"] == req.region]

    if not logs:
        return []

    # 3) product_id별 평균 만족도 점수 계산
    product_scores: Dict[str, float] = {}
    product_counts: Dict[str, int] = {}

    for log in logs:
        pid = log["product_id"]
        satis = log["satisfaction_score"]
        score = float(satis) if satis else 0.0

        if pid not in product_scores:
            product_scores[pid] = 0.0
            product_counts[pid] = 0

        product_scores[pid] += score
        product_counts[pid] += 1

    avg_scores = [
        {
            "product_id": pid,
            "avg_score": product_scores[pid] / product_counts[pid]
        }
        for pid in product_scores
    ]

    # 평균 만족도 높은 순으로 정렬
    avg_scores.sort(key=lambda x: x["avg_score"], reverse=True)

    results: List[ProductOut] = []

    # 4) 상위 N개 상품만 가져오기
    for item in avg_scores[:5]:
        ppdata = products_prices(item["product_id"])
        if not ppdata:
            continue

        # ProductOut 형식으로 구성
        # 옵션 묶기: 같은 option_name끼리 묶어서 prices 리스트로 만들기
        options_map: Dict[str, Dict] = {}

        for opt in ppdata["options"]:
            opt_name = opt["option_name"]

            if opt_name not in options_map:
                options_map[opt_name] = {
                    "product_id": ppdata["product_id"],
                    "option_name": opt_name,
                    "prices": []
                }

            options_map[opt_name]["prices"].append({
                "age_type": opt["age_type"],
                "price_text": opt["price_text"]
            })

        option_out_list: List[OptionOut] = []
        for opt_name, data in options_map.items():
            option_out_list.append(
                OptionOut(
                    product_id=data["product_id"],
                    option_name=opt_name,
                    prices=[
                        PriceOut(
                            age_type=p["age_type"],
                            price_text=p["price_text"]
                        )
                        for p in data["prices"]
                    ]
                )
            )

        p_out = ProductOut(
            product_id=ppdata["product_id"],
            region=ppdata["region"],
            product_name=ppdata["product_name"],
            place_type=ppdata["place_type"],
            category=ppdata["category"],
            options=option_out_list,
        )

        results.append(p_out)

    # 6) LLM 보고서 생성 (마크다운 문자열 한 덩어리)
    report_markdown = create_report([p.dict() for p in results])

    # 6-1) SPLIT 기준으로 쪼개기
    split_blocks = [
        block.strip()
        for block in report_markdown.split("<<<SPLIT>>>")
        if block.strip()
    ]

    # 6-2) HTML 변환
    html_blocks = [markdown2.markdown(block) for block in split_blocks]

    # 🔥 핵심: 상품명 기반 매칭
    assigned = set()  # 이미 사용한 블록 index 기록

    for product in results:
        matched_html = None
        pname = product.product_name.replace("[예약금상품] ", "").strip()

        for idx, html in enumerate(html_blocks):
            if idx in assigned:
                continue

            # 상품명이 들어있으면 해당 블록 매칭
            if pname in html:
                matched_html = html
                assigned.add(idx)
                break

        # 설명 매칭 성공 시
        if matched_html:
            product.description = matched_html
        else:
            # 매칭 실패 시 fallback 메시지
            product.description = f"<p><strong>{product.product_name}</strong> 관련 설명을 생성하지 못했습니다.</p>"


    # 7) 이제 report는 안 쓰고, 상품 리스트만 반환
    return {
        "products": results
    }

