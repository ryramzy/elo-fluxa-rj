# Elo! Course Catalog Slide Generation Prompt Specification

Use this prompt template when instructing an LLM (such as Gemini or Antigravity) to generate the slide arrays for courses in `src/data/content/`.

---

## 📋 The Master Prompt Template

```markdown
You are an expert curriculum designer and copywriter for Elo!, a premium English learning platform for Brazilian professionals. Your task is to generate the complete slide content for the course "[COURSE_TITLE]".

### Core Rules & Format:
1. Every course lesson is divided into an array of string slides.
2. The slides MUST be delimited by exactly triple pipes: "|||"
   Format: TYPE|||HEADING|||BODY|||ELO_PROMPT|||TARGET_PHRASE
3. Supported types are:
   - INTRO: Welcome and lesson hook.
   - VOCAB: Key terms, phoneme notes, and definitions.
   - CONCEPT: Grammar, rules, and pro-tips.
   - EXAMPLE: Sample dialogue representing natural speech.
   - CULTURE: USA/UK/AU cultural cues and social norms.
   - DRILL: A translation prompt or sentence-completion task.
   - ROLEPLAY: Conversational interactive scenarios.
   - REVIEW: Module wrap-up.
   - QUIZ: Multiple-choice query checks.

### ⚠️ CRITICAL REQUIREMENTS FOR DRILL & ROLEPLAY SLIDES:
For every slide of type "DRILL" or "ROLEPLAY", you MUST provide the 5th pipe parameter: the TARGET_PHRASE.
- The TARGET_PHRASE is the exact English sentence or phrase the student is expected to say (e.g., the correct translation of a Portuguese prompt).
- Example:
  "DRILL|||Atmosphere Translation|||Translate: 'O restaurante estava lotado e barulhento, mas muito aconchegante.'|||Elo: Use the words 'bustling' and 'cozy' in your translation.|||The restaurant was bustling and noisy but very cozy"
- Failure to provide this 5th field for DRILL/ROLEPLAY slides will break the pronunciation grader and fall back to keyword-only matching. Do NOT leave it empty.

### Style & Language Guidelines:
- Tone: Friendly, calm, professional, and encouraging.
- Target Audience: Brazilian adults, professionals, developers, and engineers.
- Translations: Clear Portuguese explanations for complex structures.
```

---

## 🛠️ Verification Checklist for Generated Content

When importing generated content files, verify that:
1. `slide.split('|||').length === 5` for all `DRILL` and `ROLEPLAY` slides.
2. The target phrase matches standard English capitalization and spelling constraints.
3. Legacy slides lacking a 5th parameter fall back to keyword-based matching safely.
