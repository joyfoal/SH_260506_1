# CSV 데이터 분석 자동화 (EDA 웹 앱)

CSV 파일을 브라우저에 올리면 **컬럼 요약(EDA)**, **자동 시각화**, **AI·규칙 기반 인사이트**까지 한 화면에서 처리하는 단일 페이지 앱입니다. 상세 설계·API·데이터 모델은 **[기술명세서.md](./기술명세서.md)** 를 기준으로 합니다. 제품 범위·시나리오는 **[기획서.md](./기획서.md)** 를 참고하세요.

---

## 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| UI | React 19, TypeScript |
| 빌드 | Vite 8, `@vitejs/plugin-react` |
| CSV | Papa Parse (`header`, `skipEmptyLines`, `dynamicTyping`) |
| 차트 | Recharts |
| 클라이언트 상태 | Zustand |
| 서버 요청 | TanStack React Query, Axios |

---

## 동작 개요

1. **CSV 업로드** — `.csv`만 허용, 최대 **10MB**. 파싱 후 행 데이터가 스토어에 저장됩니다.
2. **EDA 요약** — 컬럼별 타입(`numeric` / `categorical` / `datetime`), 결측·고유값, 수치 기초통계 또는 범주 상위 빈도를 표로 표시합니다.
3. **자동 차트** — 데이터 구성에 따라 히스토그램·막대·산점·라인 등을 생성하며, 스펙은 최대 **6개**까지 사용합니다. (`y` / `target` 수치 컬럼은 히스토그램에서 99분위 클리핑 등 노트북과 유사한 처리가 있습니다.)
4. **인사이트** — `인사이트 생성` 클릭 시 `POST /api/insights`로 요약·차트 메타를 보내 OpenAI(`gpt-4o-mini`) 기반 문구를 받습니다. API 오류·키 미설정 시에는 클라이언트 **휴리스틱** 인사이트로 대체됩니다.

아키텍처 다이어그램·모듈별 책임은 기술명세서 **§1 시스템 개요**, **§3 디렉터리 구조**를 보시면 됩니다.

---

## 로컬 실행

```bash
npm install
npm run dev
```

기본 개발 서버: **`http://127.0.0.1:3000`** (`vite.config.ts`의 `server.port` 기준)

| 명령 | 설명 |
|------|------|
| `npm run build` | `tsc -b` 후 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint |

---

## 환경 변수 (AI 인사이트)

| 변수 | 설명 |
|------|------|
| `API_SECRET_KEY` | OpenAI API 키. **서버(Edge 함수)에서만** 사용하며, 프런트 번들에 넣지 않습니다. |

로컬·배포 환경에 설정합니다. 예시는 `.env.example`을 참고하세요. 키가 없으면 Edge API는 안내 메시지를 담은 응답을 돌려주고, UI는 휴리스틱 결과로 보완합니다.

---

## 배포 (Vercel)

- `api/insights.ts`는 **Edge 런타임**으로 동작합니다 (`vercel.json`의 `api/*.ts` 설정과 기술명세서 **§1.2**).
- 프로덕션에서는 CORS·인증·요청 크한 등을 정책에 맞게 검토하는 것이 좋습니다(기술명세서 **§12**).

---

## 저장소·문서

- 상세 타입 정의(`DataRow`, `ColumnSummary`, `ChartSpec` 등): 기술명세서 **§4**
- 파싱·통계·차트·인사이트 알고리즘: 기술명세서 **§5 ~ §8**
- Zustand 스토어 필드·액션: 기술명세서 **§9**

참고 노트북: `REF/simple-exploration-notebook-mercedes.ipynb`

---

## 원격 저장소

```text
https://github.com/joyfoal/SH_260506_1.git
```

`git clone` 후 위 **로컬 실행** 절차를 따르면 됩니다.
