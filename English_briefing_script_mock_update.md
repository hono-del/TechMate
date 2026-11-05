# Speaking script — TechMate mock update

Use this to explain the latest mock in English. Speak the **Script** lines. *Italics* are stage directions. Do not say “we implemented every requirement.”

- Date: 30 October 2026
- Repo: https://github.com/hono-del/TechMate (`master`, commit `8c3c309`)
- Run: `cd app` → `npm install` → `npm run dev` → http://localhost:3000
- Language: switch EN / JA in the header. All data is fictional.

---

## 1. Opening (about 1 minute)

**Script**

Thank you. I will walk through the latest update of the TechMate concept mock — that is the Next Generation E-library UI.

Two points up front.

First: this is **not** the production product. It is a clickable mock so we can read the requirement workbook together and see the intended screens.

Second: we did **not** try to close every open issue. The Issue List items owned by me — rework, multiple symptoms, TS escalation, TIE operating model, customer report rules, KPI definitions — are **on hold**. I will collect real use cases from people with field knowledge before we decide those.

What we *did* do is take the **16 October missing-items list** and put on screen the items that can be understood from the UI.

Login is still persona cards: Kenji as Technician, Mika as Dealer Admin, A. Chen as CMC.

---

## 2. What was already there (about 30 seconds)

**Script**

Before this update, the mock already had the six-step job, AI Search with citations and refuse-to-answer, the Q&A forum, manual browsing, content ingest, AI review, governance, and prompt versions.

The 16 October list said some of those were missing. Forum and manual upload were already in. We did not rebuild them.

---

## 3. Technician screens (about 2 minutes)

*Log in as Kenji Yamamoto, or stay on Home as CMC — Home is shared.*

**Script**

On Home you now see **New Job** and **Submit TIE**.

**New Job** is the missing vehicle-information intake. You can enter VIN, decode it, pick model and year, mileage, and the customer concern. You also choose the input source: manual entry, file import, or DMS / reception. In the mock, Create Job does not add a real row. It shows the screen so developers know this form exists. Then you continue on the Corolla Cross demo job.

Bottom-right, three buttons stay on every screen: **AI Search**, **Contact Us**, and **How to use**.

**AI Search** is available at any time, including while a manual PDF is open. Open Browse Manuals, pick Corolla Cross 2022, open the Service Manual. The PDF toolbar has AI Search. The same button is at the bottom right. The search dialog sits in front of the PDF. That was the gap: AI had to work while reading a manual.

On the PDF you will also see a watermark: dealer internal, do not copy, and a “no print / no share” label. That is the dealer request for a visible restriction. The real permission matrix is still an open topic on Jimmy’s side. We only show the imagery.

**Contact Us** is a help-desk ticket — hours, access, documents. It is **not** Technical Support escalation for an unsolved diagnosis. That flow is one of the on-hold issues.

**How to use** is five short steps for the current role. That is the “easy instructions” item.

**Submit TIE** is the technician report form. It uses a CMC template. Required fields include model, year, system, fault type, DTC, and manual chapter. After submit, status is “Submitted — waiting for dealer review.”

The Q&A forum is unchanged: Knowledge Improvement.

---

## 4. Dealer admin (about 1 minute)

*Switch to Mika Sato, or stay as CMC and open Admin → TIE Approvals.*

**Script**

Dealer Admin can now open **TIE Approvals**.

The path is: technician submits → dealer approves, requests changes, or rejects → CMC publishes.

I will say this clearly: this is a **screen concept** so the team can see a two-step approval. It is not a decided operating model. Who officially owns TIE candidates is still on hold.

We did **not** split Dealer Admin and manufacturer admin into Level 1 and Level 2. That is a role-design decision, not a screen we should invent.

Confidentiality and leakage rules are also not a mock feature. Platform already shows PII masking as an image. The real document-class matrix is still open.

---

## 5. CMC admin (about 1.5 minutes)

*Log in as A. Chen.*

**Script**

For CMC, four screens were added, plus one tab.

**Accounts** — create users, roles, last login, search usage, active or disabled. Concept UI only. Real login is still the persona cards. Production will use an identity provider.

**Feedback** — an inbox to receive and reply to customer or dealer issues. This is CMC’s channel, not a consumer app.

**TIE Templates** — the templates that drive the technician Submit TIE form. If you deactivate a template, it disappears from the submit screen.

**TIE Approvals** — CMC publishes after dealer approval. If the item is still “Submitted,” CMC sees a wait message.

**Quality & Audit → Usage capture** — this shows the data items from the missing list: user name, date and time, model, year, faulty system, fault type, manual chapter, and follow-up questions. It is a log *picture*, not a signed-off KPI definition.

Manual upload was already in Content Catalog. We did not duplicate it.

---

## 6. What we did not put on screen (about 45 seconds)

**Script**

Please do not take away that “every gap is closed.”

Not in this update:

- Rework and re-diagnosis rules
- Whether one job holds several symptoms, and how history is kept
- Unresolved cases handed to Technical Support
- Official TIE candidate criteria and who approves in production
- Customer-facing report format and channel
- Official KPI definitions
- Level 1 / Level 2 admin split
- Real encryption, SSO, and document licence controls

Those are decisions first, screens second. The mock is for imagery, not for locking the data model.

---

## 7. Suggested demo order (about 3 minutes if you click)

1. Home as Technician or CMC — New Job → fill VIN / concern → Create (demo).
2. Browse Manuals → Corolla Cross 2022 → open SM PDF → point at watermark → open AI Search from the PDF toolbar.
3. Contact Us and How to use from the bottom-right.
4. Submit TIE → submit for dealer review.
5. Admin → TIE Approvals → show Submitted vs Dealer approved → Publish as CMC.
6. Accounts, Feedback, TIE Templates.
7. Quality & Audit → Usage capture.

Repo: github.com/hono-del/TechMate, branch `master`.

---

## 8. Closing line (use this)

**Script**

So, to summarise: the 16 October missing items that can be shown as screens are now in the mock. Process issues that need field use cases stay on hold. The mock is a reading aid next to the requirement workbook, not a finished system.

Happy to take questions.

---

## One-slide cheat sheet (if you need a backup)

| Role | New in this update | Path |
|---|---|---|
| Technician | Vehicle / job intake | `/job/new` |
| Technician | TIE submit | `/tie/submit` |
| All | AI Search while reading manuals | FAB + PDF toolbar |
| All | Contact Us, How to use | Bottom-right |
| All | Document watermark | PDF / drawers |
| Dealer / CMC | TIE approval | `/admin/tie-approvals` |
| CMC | Accounts | `/admin/accounts` |
| CMC | Customer feedback inbox | `/admin/feedback` |
| CMC | TIE templates | `/admin/templates` |
| CMC | Usage capture fields | `/admin/quality` → Usage capture |

Already present before this update: Q&A forum, Content Catalog (manual ingest), six-step job, AI refuse-to-answer.
