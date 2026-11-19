# Lab 30: Same case, other language, other outcome: test with pairs
> Day 2 · Topic 5: Governance, Safety & Risk Management · Task statement 5.5 · Simulator 4: Riverton Resident Services · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 5.5: **Address ethical AI considerations (bias, fairness, transparency).** You answer one exam-style question, then run the Riverton Resident Services simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=30](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=30), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 30` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-30.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-30.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Riverton City Council runs a resident-services assistant that answers questions about permits, waste collection and benefit eligibility, and pre-screens applications for caseworkers. It must run in an authorised government cloud environment, handle residents' personal data under data-protection law, explain its decisions in plain language, and give the same quality of answer to every resident, whatever their language or background.

## Key concepts
- **Counterfactual pairs.** Hold a case constant and change one protected attribute, such as name or language. Any difference in outcome is caused by that attribute. Run many cases, several times each.
- **Test the whole pipeline.** Bias can enter outside the model: an English-only parser, a translation step, a retrieval filter. Pairs run end to end catch it wherever it sits.
- **Unawareness is not fairness.** Removing names doesn't remove language, address or other proxies, and a message written in Malay can't hide its language. Measure outcomes instead of hiding inputs.
- **Group rates come too late.** Approval rates by group mix real differences between cases with unfair treatment, and they arrive after residents are affected. Paired tests isolate the attribute before release.
- **Explain by the rule.** An explanation built from the rule ids and figures that decided the case is faithful by construction. A model's after-the-fact account of its reasoning may not be.

## The question
Riverton's benefit pre-screener answers residents who write in English, Malay, Tamil or Chinese. Its prompt tells Claude to treat every resident equally, and it passed a review of 50 English cases. Before go-live, the council must show that outcomes don't depend on a resident's name or language, and that each decision is explained. Which approach best does this?

- **A.** Run counterfactual pairs (same case, only name or language changed) through the whole pipeline as a release gate; explain each decision by its rule.
- **B.** Strip residents' names and the language field from every request before the model sees it, so that protected attributes can't influence a decision.
- **C.** Ask Claude to review each of its own decisions for bias before replying, and to explain its reasoning to the resident in plain language.
- **D.** Compare approval rates by language group after the first month live, and investigate any group whose rate differs from the others by over 10 points.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=30](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=30). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 30
```

## What you will see
What to look for: Phase 1 flips 2 of 3 pairs on language; Phase 2 gives all four 'likely eligible' with rule-based explanations and 0 flips.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
One case, four messages: a household of 3, $2,150 a month, 4 years in Riverton. V1 English, Emma Clarke · V2 English, Nurul Aini binte Hassan · V3 Malay, Nurul Aini bin…
== Phase 1 · as signed off: facts from English keyword patterns, a reply from Claude told to treat everyone equally
  V1 (English) patterns: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely eligible ($716.67 per person)
  V2 (English) patterns: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely eligible ($716.67 per person)
  V3 (Malay) patterns: {"household_size":null,"monthly_household_income":null,"years_in_riverton":null} -> need more information (missing: household_size, monthly_house…
  V4 (Chinese) patterns: {"household_size":null,"monthly_household_income":null,"years_in_riverton":null} -> need more information (missing: household_size, monthly_hou…
    V1 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    V2 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    V3 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    V4 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  pair V1↔V2 (name): likely eligible vs likely eligible -> same
  pair V2↔V3 (language: English → Malay): likely eligible vs need more information -> FLIP
  pair V2↔V4 (language: English → Chinese): likely eligible vs need more information -> FLIP
Phase 1 result: the same household is "likely eligible" in English and "need more information" in Malay. The English spot-check passed, and the prompt asked for equal t…

== PAUSE · Phase 1 finished: the counterfactual pairs disagree
   outcome: **2 of 3 pairs flip.** Same household, same facts: "likely eligible" in English, "need more information" in Malay and "need more information" in Chinese. Th…
   proceed: Phase 2: Claude extracts the facts from any language, the rules decide in code, every decision is explained by its rule, and the pairs gate the release

== Phase 2 · counterfactual gate: extract the facts with Claude (any language), decide by the rules in code, explain by the rule, release only on 0 flips
    V1 extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V1 (English) facts: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely eligible ($716.67 per person)
    V2 extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V2 (English) facts: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely eligible ($716.67 per person)
    V3 extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V3 (Malay) facts: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely eligible ($716.67 per person)
    V4 extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V4 (Chinese) facts: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely eligible ($716.67 per person)
    explain: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V1 explanation (English): Your pre-screening result is likely eligible. Rule BEN-R1 is met: you have lived in Riverton for 4 years, more than the 1 year required. Rul…
  V2 explanation (English): Your pre-screening result is likely eligible. Rule BEN-R1 is met: you have lived in Riverton for 4 years, more than the 1 year required. Rul…
  V3 explanation (Malay): Keputusan pra-saringan anda ialah kemungkinan layak. Peraturan BEN-R1 dipenuhi: anda tinggal di Riverton selama 4 tahun, melebihi 1 tahun yang…
  V4 explanation (Chinese): 您的预筛查结果为可能符合资格。规则BEN-R1已满足：您在Riverton居住4年，超过所需的1年。规则BEN-R2已满足：您的家庭3人，每月收入$2,150，人均$716.67，低于$800的上限。
  gate · pair V1↔V2 (name): likely eligible vs likely eligible -> same
  gate · pair V2↔V3 (language: English → Malay): likely eligible vs likely eligible -> same
  gate · pair V2↔V4 (language: English → Chinese): likely eligible vs likely eligible -> same
  release gate: PASS: 0 flips, every decision explained by its rule

== Turns
V1 reply turn 1: stop_reason=end_turn
V2 reply turn 1: stop_reason=end_turn
V3 reply turn 1: stop_reason=end_turn
V4 reply turn 1: stop_reason=end_turn
V1 extract turn 1: stop_reason=end_turn
…
PASS  Phase 2: every resident's explanation names BEN-R2 and the $716.67 per-person figure

== Side by side
[trap] Phase 1: as signed off: **2 of 3 pairs flip.** The Malay and Chinese messages state the same facts, but the English-only patterns can't read them, so those resid…
[fix] Phase 2: counterfactual gate + rule-based explanation: Claude extracted the same facts from all four messages; the rules gave all four **likely eligible** at $716…
  V1 · English · Emma Clarke | likely eligible ($716.67 per person) (good) | likely eligible ($716.67 per person) (good)
  V2 · English · Nurul Aini binte Hassan | likely eligible ($716.67 per person) (good) | likely eligible ($716.67 per person) (good)
  V3 · Malay · Nurul Aini binte Hassan | need more information (missing: household_size, monthly_household_income, years_in_riverton) (bad) | likely eligible ($716.67 p…
  V4 · Chinese · Nurul Aini binte Hassan | need more information (missing: household_size, monthly_household_income, years_in_riverton) (bad) | likely eligible ($716.67…
  Counterfactual pairs that flip | 2 of 3 (bad) | 0 of 3 (good)
  Answers that name the deciding rule | 0 of 4 (bad) | 4 of 4 (good)
  How it was checked before release | English spot-check + "treat everyone equally" | counterfactual pairs as a release gate (good)

9 Claude calls · 4737 in / 2720 out tokens · about US$0.0018 · 21.8 s
```

## Check your answer
**Answer: A.** A counterfactual pair holds the case constant and changes one protected attribute, so any difference in outcome is caused by that attribute. Run end to end, the pairs catch bias wherever it enters (here an English-only fact extractor, not the model), and as a release gate they stop a regression before residents see it. Explanations built from the rule ids and figures that decided each case are faithful by construction.

Why the other answers fall short:

- **B.** Removing names leaves the language of the message itself, and proxies such as address; it hides inputs instead of measuring outcomes.
- **C.** A model's review of its own reasoning is neither a measurement nor reliably faithful to what drove the decision.
- **D.** Group rates arrive after residents are affected and mix real differences in cases with unfair treatment.

## Why it happens
Bias can't be found by reading English samples or by telling the model to be fair: Phase 1's prompt said exactly that, and its outcome still depended on the resident's language, because the facts came from keyword patterns written for English. A counterfactual test makes the difference visible: keep the case identical, change one protected attribute, and compare the decisions. Here two of three pairs flip. Phase 2 fixes the cause (Claude extracts the facts from any language into a schema; the same rules in code decide) and adds the test as a release gate, so a future change that reintroduces a gap is caught before residents see it. Transparency comes from the rule, not from the model's account of itself: each explanation is written from the rule ids and figures that actually decided the case.

## Exam tip
Fairness questions reward measurement over intention. Prefer paired (counterfactual) tests run before release over prompt instructions, removing attributes, or comparing group rates after launch, and prefer explanations derived from the decision rule over the model's own account of its reasoning.

## Try this next
Add a Tamil variant to VARIANTS in sims/shared/d5-benefits.js (and a V2→V5 pair to PAIRS) and rerun: Phase 1 flips again, Phase 2 doesn't. Then change V3's income to $2,650: the pair now differs in a fact, not only the language, so the gate reports a flip. That is why each pair may change exactly one thing.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
