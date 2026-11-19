# Lab 29: The whole record went to the model and the log: send the minimum
> Day 2 · Topic 5: Governance, Safety & Risk Management · Task statement 5.4 · Simulator 3: Meridian Clinical Notes · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 5.4: **Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP).** You answer one exam-style question, then run the Meridian Clinical Notes simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=29](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=29), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 29` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-29.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-29.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Meridian Health, a US hospital group, uses Claude to draft discharge summaries and referral letters from clinicians' visit notes. The notes contain protected health information (PHI) under HIPAA, and every draft is signed off by a clinician before it leaves the hospital. Accuracy, privacy and an audit trail matter more than speed.

## Key concepts
- **Minimum necessary.** HIPAA's standard: use or disclose only the PHI needed for the purpose. Write it per purpose as an allow-list in code, so every field that leaves is a visible decision.
- **Every hop is in scope.** The model provider, the log service and any trace store that receives PHI must sit inside the agreements that cover it (a BAA for HIPAA). A debug log is a hop.
- **Tokenise, then re-identify.** Replace direct identifiers with tokens such as [PATIENT] before the call, and map them back in your own code afterwards. Claude still writes the letter; it never sees the name.
- **Log metadata; keep audit evidence.** Operations need request ids, token counts and field names, not prompt text. An audit record of user, purpose, fields sent and fields withheld shows the control ran.
- **Frameworks differ.** HIPAA covers US health data, GDPR the personal data of people in the EU, FedRAMP cloud services for US federal agencies. One certification doesn't satisfy another regime.

## The question
Meridian Health's referral-drafting prototype sends each patient's full record to Claude and copies every prompt and response to a third-party log service for debugging. Before go-live, the compliance lead asks for a design that meets HIPAA's minimum-necessary standard and produces evidence for audits. Which design best meets the requirement?

- **A.** Keep sending the full record so that letters stay accurate, sign a BAA with the model provider, and restrict log access with role-based permissions.
- **B.** Send only the fields each purpose needs with identifiers tokenised, restore them in code after the call, and log metadata plus an audit record.
- **C.** Tell Claude in the system prompt to ignore identifiers it does not need and never to repeat them, and encrypt the log store at rest.
- **D.** Move the workload to a FedRAMP High authorised cloud region, and keep the full prompts in its logs, since that authorisation covers them.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=29](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=29). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 29
```

## What you will see
What to look for: Phase 1 sends 9 identifiers and 3 unneeded history items and logs them; Phase 2 sends none and logs metadata plus an audit record.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Dr K. Osei, Meridian Primary Care → Meridian Endocrinology Clinic · purpose: endocrinology referral: treatment intensification for type 2 diabetes. The record holds 17 …
== Phase 1 · send the whole record: the full record goes to Claude, and a third-party debug log copies every prompt and response
    Draft the referral: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  request scan: 9/9 direct identifiers (name, MRN, date of birth, address, phone, email, SSN, insurance id, next of kin) · unneeded history: termination of pregnancy, H…
  debug log: 1 entry, full prompt and letter · identifiers in the log: 9

== PAUSE · Phase 1 finished: the whole record reached the model and the log
   outcome: **The request carried 9 of 9 direct identifiers** (name, MRN, date of birth, address, phone, email, SSN, insurance id, next of kin) and 3 sensitive history …
   proceed: Phase 2: an allow-list for the purpose, tokenised identifiers, a metadata log and an audit record

== Phase 2 · minimum necessary, with evidence: allow-list the fields, tokenise identifiers, log metadata, write an audit record
  minimise(): sent 8 keys (patient, mrn, sex, age, problems, medications, results, visit) · withheld 10 (dob, address, phone, email, ssn, insurance_id, next_of_kin, occ…
    Draft the referral: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  request scan: 0/9 direct identifiers · unneeded history: none
  reidentify(): [PATIENT] found and replaced · clinical facts kept: HbA1c 9.1%, metformin, gliclazide
  debug log: {"service":"third-party debug log","request_id":"req-29-0002","purpose":"endocrinology referral","fields":["patient","mrn","sex","age","problems","medicati…
  audit record: {"at":"2026-11-19T10:42:00","user":"dr.k.osei","patient_ref":"MRN 00-4452","purpose":"endocrinology referral: treatment intensification for type 2 diabe…

== Turns
Draft the referral turn 1: stop_reason=end_turn
Draft the referral turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the request to Claude carried direct identifiers and sensitive history the referral does not need
PASS  Phase 1: the third-party debug log holds a full copy, identifiers included
PASS  Phase 2: the request carried no direct identifiers and none of the unneeded history
PASS  Phase 2: the letter keeps the clinical facts, and the patient's name was put back in code after the call
PASS  Phase 2: the log holds metadata only, and an audit record lists the user, purpose, fields sent and fields withheld

== Side by side
[trap] Phase 1: send the whole record: The request carried **9 direct identifiers** and 3 unneeded history items; the debug log keeps a full copy outside the agreement.…
[fix] Phase 2: minimum necessary, with evidence: The request carried **no identifiers and no unneeded history**. The letter still has HbA1c 9.1% and both diabetes medic…
  Direct identifiers in the request | 9: name, MRN, date of birth, address, phone, email, SSN, insurance id, next of kin (bad) | 0 (good)
  Unneeded sensitive history in the request | termination of pregnancy, HIV test, psychiatric admission (bad) | none (good)
  How the patient is named to Claude | full name and MRN | [PATIENT] and [MRN], mapped back in code (good)
  What the debug log keeps | full prompt and letter (9 identifiers) (bad) | ids, field names, token counts, fingerprint (0 identifiers) (good)
  Audit evidence | none (bad) | dr.k.osei · 6 sent · 10 withheld · purpose recorded (good)
  Request size | 1864 characters | 1560 characters

2 Claude calls · 1654 in / 1639 out tokens · about US$0.0010 · 8.4 s
```

## Check your answer
**Answer: B.** Minimum necessary is decided before the call: an allow-list per purpose controls which fields leave, identifiers become tokens that only your code maps back, and the log keeps metadata instead of PHI. The audit record (user, purpose, fields sent and withheld) is the evidence that the control ran. The other options leave the full record flowing to the model or the log.

Why the other answers fall short:

- **A.** A BAA is needed, but it doesn't make sending the whole record 'minimum necessary', and the third-party log still holds full PHI.
- **C.** By the time the model reads the instruction the PHI has already been disclosed; encrypting the log doesn't reduce what it holds.
- **D.** FedRAMP authorises cloud services for US federal agencies; it doesn't satisfy HIPAA's minimum-necessary standard or cover a third-party log.

## Why it happens
HIPAA's minimum-necessary standard asks for the least PHI needed for the purpose, and an audit has to show it. In Phase 1 the prototype meets neither: the whole record, including identifiers and sensitive history the endocrinologist doesn't need, goes to the model, and a debug log copies it to a service outside the agreement that covers the model provider. Nothing records why. Phase 2 makes the obligation a control in code. An allow-list for the purpose decides which fields leave; identifiers become tokens that only your code can map back; the log keeps what operations need (ids, token counts, field names, a fingerprint) and no content; and an audit record names the user, the purpose, and the fields sent and withheld. Asking the model to ignore what it doesn't need would not help: by then the data has already been sent.

## Exam tip
Compliance answers are usually about what data reaches which processor, and what evidence you keep. Prefer the option that removes data before the call (minimisation, tokenisation) and leaves an audit trail, over options that rely on the model ignoring data, on encryption alone, or on a certification meant for a different regime.

## Try this next
Add "history_sensitive" to NEEDED in sims/shared/d5-clinical.js and rerun: Phase 2's scan now finds the three history items in the request, and the audit record shows them as sent. An allow-list makes every field you add a decision you can see.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
