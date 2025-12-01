import pickle
import numpy as np
import os
from pathlib import Path
from typing import Dict, Any
from sentence_transformers import SentenceTransformer
from db import *


BASE_DIR = Path(__file__).parent
PICKLE_PATH = BASE_DIR / "embeddings.pkl"

model = SentenceTransformer("nlpai-lab/KURE-v1")


def log_format(data: dict) -> str:
    return (
        f"여행자는 {data['place']} 지역으로 {data['days']}일동안 여행을 갔다. "
        f"함께 간 여행 동행자와는 {data['companion_relation']}관계이다. "
        f"동행자의 나이는 {data['companion_age_group']}이다. "
        f"여행자의 성별은 {data['gender']}이며, 나이는 {data['age']}대이다. "
        f"전반적으로 여행자의 만족도는 {data.get('satisfaction_score', '')}점이다. "
        f"여행자의 여행 테마는 {data['category']}이다."
    )

def user_format(data: dict) -> str:
    return (
        f"여행자는 {data['place']} 지역으로 {data['days']}일동안 여행을 갈 예정이다. "
        f"함께 갈 여행 동행자와는 {data['companion_relation']}관계이다. "
        f"동행자의 나이는 {data['companion_age_group']}이다. "
        f"여행자의 성별은 {data['gender']}이며, 나이는 {data['age']}대이다. "
        f"여행자가 원하는 여행 테마는 {data['category']}이다."
    )

def build_pickle():
    logs = logs_from_db()
    total = len(logs)
    print(f"총 {total}개의 여행로그를 불러왔습니다.")

    # 🔸 개발용: 임베딩 돌릴 로그 개수 제한
    MAX_LOGS = 30  # 너무 오래 걸리면 10, 20 이런 식으로 더 줄여도 됨
    if total > MAX_LOGS:
        print(f"개발 편의를 위해 상위 {MAX_LOGS}개만 임베딩 생성합니다.")
        logs = logs[:MAX_LOGS]

    trip_ids = []
    docs = []
    vectors = []

    for idx, log in enumerate(logs, start=1):
        tid = str(log["trip_id"])

        text = log_format(log)
        vec = model.encode(text, normalize_embeddings=True)

        trip_ids.append(tid)
        docs.append(text)
        vectors.append(vec)

        # 진행 상황 찍기 (선택)
        if idx % 10 == 0 or idx == len(logs):
            print(f"[임베딩 진행] {idx}/{len(logs)} 개 완료")

    embeddings = np.array(vectors, dtype="float32")

    data = {
        "trip_ids": trip_ids,
        "texts": docs,
        "embeddings": embeddings
    }

    with open(PICKLE_PATH, "wb") as f:
        pickle.dump(data, f)

    print("여행로그 임베딩 및 vector 저장 완료")


def load_embeddings():
    if not os.path.exists(PICKLE_PATH):
        print("임베딩 파일 새로 생성")
        build_pickle()

    with open(PICKLE_PATH, "rb") as f:
        data = pickle.load(f)

    print(f"임베딩 로딩 완료 ({len(data['trip_ids'])}개)")
    return data

def embedding_query(query_dict: Dict[str, Any]):
    text = user_format(query_dict)
    vec = model.encode(text, normalize_embeddings=True)
    return text, vec