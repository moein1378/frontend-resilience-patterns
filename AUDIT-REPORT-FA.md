# گزارش بررسی فایل پورتفلیو و استخراج پروژهٔ ۲

**فایل مبنا:** `Moein-Frontend-Portfolio-Blueprints-v3.zip` — مخزن Blueprint نسخهٔ ۳ برای **۱۷ پروژه**.

**پروژهٔ هدف:** `projects/02-concept-lab-frontend-resilience-patterns/`، نام اصلی: **Frontend Resilience Patterns**، نوع: **Concept Lab**، رتبهٔ پیاده‌سازی: **۲ از ۱۷**. طبق ترتیب برنامه، پروژهٔ ۱ «Frontend Concurrency Lab» است و پروژهٔ ۳ «Tern» به‌عنوان پکیج جدا مطرح شده؛ پروژهٔ ۲ قرار نیست جای Tern به‌عنوان کتابخانهٔ Production را بگیرد.

## ۱. ماهیت پروژه

هدف این است که برنامه‌نویس بتواند «رفتار خراب» و «رفتار محافظت‌شده» را با **سناریو، seed و workload معادل** اجرا کند و اثر تصمیمات مهندسی را روی نتیجهٔ قابل‌مشاهدهٔ کاربر و هزینهٔ upstream ببیند. آزمایش‌ها آموزشی‌اند؛ داده‌ها و زمان‌های Fixture، متریک واقعیِ API شرکتی یا بنچمارک SLA نیستند.

زیرسیستم‌های اساسی بر اساس Blueprint: Chaos Profile Engine، Workload Generator، Pattern Implementations، Metrics Collector، Timeline Visualizer، Experiment Persistence و Decision Matrix. مفاهیم: Circuit Breaker؛ Retry با Full Jitter؛ Timeout Budget؛ Bulkhead/Per-resource Concurrency؛ Token-bucket Rate Limiter؛ Load Shedding؛ Stale Fallback و Stale-While-Revalidate. Hedged GET فقط به‌صورت اختیاری و همراه با توضیح خطر است.

## ۲. انتخاب فناوری قطعیِ فایل اصلی

- **Quasar CLI با Vite، حالت SPA** (نه Vue/Vite خام، نه Nuxt، نه SSR)
- Vue 3 و TypeScript؛ Quasar 2.x و `@quasar/app-vite` 3.x طبق baseline فایل ZIP
- SCSS semantic tokens با رنگ برند `#F97316`، Accent `#06B6D4`، صفحهٔ تاریک و کامپوننت‌های متراکم
- Node 24 LTS؛ pnpm workspace و lockfile دقیق هنگام شروع پیاده‌سازی
- Hono برای Chaos API محلی، Zod برای اعتبارسنجی مرزها؛ Vitest، Playwright، fast-check برای کیفیت
- GitHub Pages برای Demo کاملاً Fixture بدون نیاز به بک‌اند، هزینه و اکانت جانبی؛ Worker ابری اختیاری
- Docker فقط در صورت توجیه واقعی برای سرویس محلی؛ نه برای نمایش مهارت ظاهری

نسخهٔ دقیق patch packageها داخل فایل اولیه برای این پروژه قفل نشده و هنگام Scaffolding توسط Codex باید با مستندات رسمی کنترل، resolve و داخل lockfile ثبت شود. هیچ dependency نصب‌شده‌ای در فایل اولیه وجود ندارد.

## ۳. معماری اصلی

Monorepo با `apps/lab` (Quasar)، `apps/chaos-api` (Hono)، و `packages/{resilience-core,failure-scenarios,telemetry,contracts}`. دامنه و الگوریتم باید مستقل از UI باشد. ارتباط با سرور از Adapter/Port عبور می‌کند؛ Provider فقط یک پیاده‌سازی جایگزین است. تستِ محدودیتِ import باید در CI قابل اجرا باشد.

**تضاد شناسایی‌شده:** در بخش عمومیِ `10-repository-map.md` مسیر `apps/web` دیده می‌شود، ولی در نقشهٔ معتبر و جدول مسؤولیت‌ها `apps/lab` تعریف شده است. در ADR-0001 این تضاد رفع شده و Codex باید **فقط apps/lab** بسازد.

## ۴. صفحات و نمایش‌های مورد انتظار

۹ خانواده Route از سورس: `/`، `/simulator`، `/patterns`، چهار مسیر داینامیکِ `/patterns/:slug/{unprotected,protected,compare,state}`، `/workloads` و `/results`. در کنار آن شش Surface مطرح شده: Pattern Catalog، Circuit Breaker Console، Retry/Jitter Lab، Bulkhead/Load-shedding Lab، Telemetry Dashboard و Failure Timeline. مسیرهای داینامیک چند URL واقعی تولید خواهند کرد؛ به معنی دقیقاً ۹ URL نیستند.

Desktop-first است؛ تبلت نمایش پشته‌ای پنل‌ها دارد و موبایل طبق Blueprint حالت read-only replay دارد. Accessibility، نشان دادن خطا با متن و آیکون، Keyboard و Reduced Motion از شروط کار است.

## ۵. هفت فاز رسمی

| فاز | نسخه | محور مشخص‌شده در سورس |
|---|---|---|
| ۱ | v0.1.0 | Quasar/Hono + Fault Model + Chaos Harness + Telemetry Contract + Reset |
| ۲ | v0.2.0 | Timeout Budget، طبقه‌بندی Retry، Backoff و Full Jitter |
| ۳ | v0.3.0 | Circuit Breaker سه‌حالته، Rolling Window، Probe و Recovery |
| ۴ | v0.4.0 | Bulkhead، Token Bucket، Queue و Load Shedding |
| ۵ | v0.5.0 | Stale Cache، SWR، Read-only/Partial-data Degraded UX |
| ۶ | v0.9.0 | GitHub Pages/اختیاری Worker، Fault Matrix، امنیت و عملیات |
| ۷ | v1.0.0 | ثبات قراردادها، Decision Guide و انتشار نهایی |

فازها در Blueprint باید به ترتیب و به‌صورت Vertical Slice منتشر شوند؛ هر فاز `pnpm verify`، تست، مستندات، خطای قابل‌تکرار و قابلیت Demo دارد. پکیج، فازهای بعدی را هم توضیح می‌دهد ولی پرامپت شروع برای Codex **فاز ۱** است.

## ۶. جزئیات مهمی که سورس نداشت و در این تحویل پیشنهاد شده

- فرم مشخص قراردادهای عملیات، Attempt، Trace و نتیجه و تفکیک منطقی Operation از HTTP Attempt
- قواعد مشخص Seed و جلوگیری از تغییر نتایج به دلیل تعداد Retryهای متفاوت
- الگوی دقیق Portها: Clock، RandomSource، Transport و TelemetrySink
- تعریف محاسبهٔ Success Rate، p95، Retry Amplification، Queue Depth و Freshness
- قانون ایمنی Unsafe Mutation با الزام اثبات واقعی Idempotency/Deduplication
- Defaults عددی پیشنهادی برای Deadline، Jitter، Breaker Threshold، Queue و Cache TTL
- قرارداد پیشنهادی `/healthz` و `/v1/execute` برای Hono و Adapter Parity
- جدول تست‌های فازبه‌فاز شامل Reset Race، Probe Concurrency، Queue Leak، Stale Data و GitHub Pages
- راهبرد Hash Router و Base Path برای GitHub Pages و هشدار Templateهای GitHub Actions/Docker
- Fixtureهای JSON ثابت شامل هشت سناریو و چهار Workload به‌علاوهٔ JSON Schema و Test Vectors

همهٔ این موارد **افزودهٔ پیشنهادیِ اجرایی** هستند. به‌عنوان جملات موجود در Blueprint اصلی جا زده نشده‌اند و Codex در صورت تغییر باید تصمیم را در ADR ثبت کند.

## ۷. خطاها و ابهامات اولیه که عمداً پنهان نشده‌اند

- فاز ۱ در بخش UI از Circuit Breaker Console نام می‌برد، ولی منطق Circuit Breaker در فاز ۳ فعال می‌شود. تا آن زمان فقط Preview با برچسب روشن مجاز است.
- فاز ۳ پنل Bulkhead را نام می‌برد، ولی منطق Bulkhead فاز ۴ است؛ عملکرد مصنوعی نمایش داده نمی‌شود.
- فهرست Modules بعضی فایل‌های فاز تکراری و کلی است؛ Deliverable همان فاز ملاک اصلی است.
- بعضی tokenها در متن «light» نام‌گذاری شده‌اند، ولی مقدارشان Dark است؛ برای خروجی اولیه از مقادیر واقعی Dark استفاده می‌شود.
- Workflow اولیه `dist` را برای deploy فرض کرده و Dockerfile ورودی عمومی `dist/server.js` دارد؛ خروجی Quasar/Hono باید واقعاً بررسی و اصلاح شود.
- اسکریپت `pnpm install --frozen-lockfile` پیش از ساخت Lockfile ممکن نیست؛ در اولین Scaffold باید Lockfile ایجاد شود.

## ۸. استاندارد خروجی نهایی

ریپوی قابل‌دفاع Senior Front-End با README فنی، لوگو و Favicon اصلی، دموی آنلاین واقعی، Story/Diagramهای تولیدشده از رویداد واقعی، تست‌های Unit/Integration/E2E/Contract، خطا و Recovery قابل‌تکرار، CI سبز، انتشار نسخه‌ها، مستندات Trade-off و Runbook. کد شرکت یا دادهٔ مالکیتی نباید داخل آن باشد.

## ۹. اعتبارسنجی این ZIP

در ساخت این تحویل، فایل‌های اصلی پروژه دوم با SHA-256 نسخهٔ ZIP اولیه تطبیق داده شدند و فایل‌های Source دست‌نخورده در ریشه یا نسخهٔ Backup نگهداری شده‌اند. فایل‌های JSON از نظر Syntax و لینک‌های نسبی مستندات تحویل بررسی شده‌اند. **اپلیکیشن هنوز Scaffold نشده و تست نرم‌افزاری اجرای Quasar/Hono انجام نشده است.** این موضوع باید با مرحلهٔ اول Codex تکمیل شود.
