import os, time, cv2
from pathlib import Path
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key=os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="gemma-3-4b-it")

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
save_dir = Path("캡쳐파일")
save_dir.mkdir(exist_ok=True)

def analyze_with_gemma3(img_path):

    prompt = """
    당신은 얼굴 이미지 인식 AI입니다. 
    사진 속 인물에 대해 다음 항목을 한국어로 설명하세요:

    - 예상 성별
    - 예상 나이대
    - 국적 추정
    - 감정
    """

    img = Image.open(img_path)

    response = model.generate_content(
        [prompt, img],
        generation_config=genai.types.GenerationConfig(
            temperature=0.4,
            max_output_tokens=256,
        )
    )

    print("분석 결과\n")
    print(response.text.strip())

def main():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("카메라를 열 수 없습니다.")
        return

    print("카메라 실행 (Q: 종료)")

    face_frames = 0
    required_frames = 70

    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.2, 5, minSize=(100, 100))

        if len(faces) > 0:
            face_frames += 1
        else:
            face_frames = 0

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

        cv2.imshow("Face Capture", frame)

        if face_frames >= required_frames:
            idx = len(list(save_dir.glob("face*.jpg"))) + 1
            (x, y, w, h) = faces[0]
            face_img = frame[y:y+h, x:x+w]
            path = save_dir / f"face{idx}.jpg"
            cv2.imwrite(str(path), face_img)

            cap.release()
            cv2.destroyAllWindows()

            analyze_with_gemma3(str(path))
            return

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

