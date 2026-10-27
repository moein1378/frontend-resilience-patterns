# راهنمای تحویل پروژه دوم به Codex

**نام:** Frontend Resilience Patterns — Concept Lab #02 از مجموعه ۱۷ پروژه.

این ZIP **کد تکمیل‌شدهٔ اپلیکیشن نیست**؛ یک بستهٔ مستقلِ دستور کار، قراردادهای اجرایی، مستندات اصلی، برند واقعی و سناریوهای تست است تا Codex از صفر شروع کند و فازبه‌فاز یک مخزن تولیدی بسازد.

## از کجا شروع کنم؟

1. فایل ZIP را از حالت فشرده خارج کن و پوشهٔ `Frontend-Resilience-Patterns-Codex-Handoff` را **به‌عنوان ریشهٔ ریپوی جدید** در مسیر لینوکسی WSL قرار بده؛ از فولدر Windows-mount مثل `/mnt/c/...` استفاده نکن.
2. در WSL دستورهای `node -v`، `corepack --version` و `pnpm --version` را بررسی کن. مبنا در Blueprint: **Node 24 LTS**؛ نسخهٔ دقیق pnpm و پکیج‌ها در شروع پروژه قفل می‌شوند.
3. در مسیر همین پوشه Codex را اجرا کن و متن فایل [`CODEX-START.md`](CODEX-START.md) را به آن بده.
4. **اول فقط فاز `v0.1.0`**. Codex باید قبل از اعلام پایان فاز، `pnpm verify` و حداقل یک سناریوی Playwright را واقعاً اجرا کند؛ اگر نشد، علت را گزارش کند.
5. پس از تأیید فاز اول، دستور [`CODEX-CONTINUE.md`](CODEX-CONTINUE.md) برای مراحل بعدی استفاده شود.

## محتویات مهم

- `01-blueprint.md` و `02-phases.md` و `phases/`: مستندات **اصلی و دست‌نخوردهٔ پروژه دوم**.
- `03-design-tokens.md` و `brand/`: رنگ‌ها، هویت بصری، لوگوهای SVG و تمام اندازه‌های Favicon واقعی.
- `04-dependencies-and-services.md` تا `11-engineering-policies.md`: تکنولوژی، ساختار، اجرا، دمو، Docker، CI/CD و سیاست‌های مهندسی اصلی.
- `docs/implementation/`: **جزئیات تکمیلی** موردنیاز Codex؛ قرارداد داده و الگوریتم، UX، معماری، تست، قرارداد API، Deployment و معیارهای پذیرش.
- `docs/adr/0001-implementation-clarifications.md`: رفع تعارض‌های داخلی Blueprint بدون پنهان کردنشان.
- `specs/`: سناریوهای نسخه‌دار و دادهٔ JSON اولیه؛ ورودی‌ قطعی تست‌ها.
- `agent/TASK-BRIEF.md` و `AGENTS.md`: شرح کار مرحلهٔ اول و قواعد لازم‌الاجرا برای Codex.
- `reference/portfolio-standards/`: سیاست‌های مشترک مجموعهٔ ۱۷ پروژه که از ZIP اصلی استخراج شده‌اند.
- `reference/original-agent/`: نسخهٔ اولیهٔ دستورهای ایجنت، برای پیگیری تغییرات.

## مرزبندی منابع

`01-...` تا `11-...` و `phases/` و `brand/` از فایل ZIP کاربر عیناً منتقل شده‌اند. `docs/implementation/`، `specs/`، این راهنما، AGENTS تکمیل‌شده و ADR جدید **تفسیر/پیشنهاد اجرایی تکمیلی** هستند و نباید با جزئیات ثابت‌شدهٔ سند اولیه اشتباه شوند. موارد حل‌نشده و تصمیم‌های قابل‌تغییر در `docs/implementation/12-assumptions-and-open-decisions.md` آمده‌اند.

## گزارش دقیق بررسی

فایل [`AUDIT-REPORT-FA.md`](AUDIT-REPORT-FA.md) شامل شرح معماری، فازها، فناوری‌ها، ۹ نوع Route، ۶ سطح UI، مشکلات Blueprint اولیه و تصمیم‌های تکمیلی است. برای اعتبارسنجی بسته قبل از تحویل به Codex می‌توان `python3 scripts/check-handoff.py` و `python3 scripts/validate-specs.py` را اجرا کرد. این دو دستور تست برنامه نیستند؛ فقط اصالت Source و سلامت Fixtureهای پیشنهادی را می‌سنجند.

## نتیجهٔ مطلوب

GitHub ریپوی مستقل با تاریخچهٔ commit تمیز، دمو Fixture قابل‌استفاده بدون Backend، حالت full-local با Hono، مقایسهٔ baseline/protected با seed یکسان، گزارش metrics و timeline، تست‌های deterministic، CI سالم، مستندات انگلیسی قابل‌دفاع و انتشار فازبه‌فاز تا v1.0.0.
