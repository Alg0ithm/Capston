import sqlite3
import csv
from pathlib import Path
from typing import List, Dict, Optional

BASE_DIR = Path(__file__).parent               
DB_PATH = BASE_DIR / "travel.db"               
CSV_DIR = BASE_DIR / "csv"                     

LOG_CSV_PATH   = CSV_DIR / "log_table.csv"     
PROD_CSV_PATH  = CSV_DIR / "products.csv"      
PRICE_CSV_PATH = CSV_DIR / "prices.csv"     

def init_db():
    """travel.db 파일을 만들고, 필요한 테이블(4개)을 생성한다."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1) 여행 로그 테이블 (log_table.csv)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS log_table(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id TEXT,
            place TEXT,
            days TEXT,
            companion_relation TEXT,
            companion_age_group TEXT,
            gender TEXT,
            age TEXT,
            product_id TEXT,
            satisfaction_score TEXT,
            category TEXT
        )
    """)

    # 2) 상품 기본 테이블 (products.csv)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT,
            region TEXT,
            product_name TEXT,
            place_type TEXT,
            category TEXT
        )
    """)

    # 3) 가격 정보 테이블 (prices.csv)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS prices(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT,
            option_name TEXT,
            option_name_en TEXT,
            age_type TEXT,
            price_text TEXT
        )
    """)

    conn.commit()
    conn.close()

# ─────────────────────────────
# CSV → 각 테이블로 적재하는 함수들
# ─────────────────────────────
def normalize_multi_value(text: str) -> str:
    """
    '형제/자매, 친인척, 친인척' 같이 쉼표로 구분된 문자열을
    - 앞뒤 공백 제거
    - 중복 제거(처음 나온 순서만 유지)
    해서 '형제/자매, 친인척' 처럼 정리해준다.
    """
    if not text:
        return text  # None 이거나 빈 문자열이면 그대로 반환

    parts = [p.strip() for p in text.split(",") if p.strip()]
    seen = set()
    result = []
    for p in parts:
        if p not in seen:
            seen.add(p)
            result.append(p)
    return ", ".join(result)

def load_logs_from_csv():
    """log_table.csv → log_table 테이블로 적재"""
    if not LOG_CSV_PATH.exists():
        print(f"⚠️ log CSV 없음: {LOG_CSV_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM log_table")
    count = cur.fetchone()[0]

    if count > 0:
        print("log_table 이미 데이터 존재")
        conn.close()
        return

    with LOG_CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            trip_id             = row.get("여행 ID")
            place               = row.get("관광지")
            days                = row.get("여행일수")
            companion_relation_raw  = row.get("여행 동반자 관계")
            companion_age_group_raw = row.get("여행 동반자 연령대")
            # 쉼표로 여러 값 들어있는 문자열 정리 (중복 제거 + 공백 정리)
            companion_relation  = normalize_multi_value(companion_relation_raw)
            companion_age_group = normalize_multi_value(companion_age_group_raw)
            gender              = row.get("성별")
            age                 = row.get("나이")
            product_id          = row.get("product_id")
            satisfaction_score  = row.get("전반적 만족도 점수")
            try:
                satisfaction = float(satisfaction_score)
            except:
                satisfaction = None
    
            category            = row.get("카테고리")

            cur.execute(
                """
                INSERT INTO log_table(
                    trip_id, place, days,
                    companion_relation, companion_age_group,
                    gender, age, product_id,
                    satisfaction_score, category
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    trip_id, place, days,
                    companion_relation, companion_age_group,
                    gender, age, product_id,
                    satisfaction_score, category,
                )
            )


    conn.commit()
    conn.close()
    print("✅ log_table.csv → log_table 적재 완료")


def load_products_from_csv():
    """products.csv → products 테이블로 적재"""
    if not PROD_CSV_PATH.exists():
        print(f"⚠️ products CSV 없음: {PROD_CSV_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM products")
    count = cur.fetchone()[0]

    if count > 0:
        print("products 이미 데이터 존재")
        conn.close()
        return
    
    with PROD_CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            region       = row.get("관광지")
            product_id   = row.get("product_id")
            product_name = row.get("상품명")
            place_type   = row.get("방문지 유형")
            category     = row.get("카테고리")

            cur.execute(
                """
                INSERT INTO products(
                    product_id, region, product_name,
                    place_type, category
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (product_id, region, product_name, place_type, category)
            )

    conn.commit()
    conn.close()
    print("✅ products.csv → products 적재 완료")


def load_prices_from_csv():
    """prices.csv → prices 테이블로 적재"""
    if not PRICE_CSV_PATH.exists():
        print(f"⚠️ prices CSV 없음: {PRICE_CSV_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM prices")
    count = cur.fetchone()[0]

    if count > 0:
        print("prices 이미 데이터 존재")
        conn.close()
        return

    with PRICE_CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            product_id     = row.get("product_id")
            option_name    = row.get("옵션명")
            option_name_en = row.get("옵션영어명")
            age_type       = row.get("나이")
            price_text     = row.get("가격")

            cur.execute(
                """
                INSERT INTO prices(
                    product_id, option_name, option_name_en,
                    age_type, price_text
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (product_id, option_name, option_name_en,
                 age_type, price_text)
            )

    conn.commit()
    conn.close()
    print("✅ prices.csv → prices 적재 완료")


def logs_from_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM log_table")
    rows = cur.fetchall()

    result = [dict(row) for row in rows]

    conn.close()
    return result

# trip_id에 맞는 로그데이터 가져오기
def logs_from_trip_ids(trip_ids):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    placeholders = ",".join("?" * len(trip_ids))
    query = f"SELECT * FROM log_table WHERE trip_id IN ({placeholders})"

    cur.execute(query, trip_ids)
    rows = cur.fetchall()

    result = [dict(row) for row in rows]

    conn.close()
    return result


def products_prices(product_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM products WHERE product_id = ?", (product_id,))
    prod = cur.fetchone()

    if not prod:
        conn.close()
        return None

    prod = dict(prod)

    # price 옵션 붙이기
    cur.execute("SELECT * FROM prices WHERE product_id = ?", (product_id,))
    price_rows = cur.fetchall()
    price_rows = [dict(r) for r in price_rows]

    conn.close()

    prod["options"] = price_rows
    return prod
