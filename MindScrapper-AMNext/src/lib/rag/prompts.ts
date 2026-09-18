// ─────────────────────────────────────────────────────────────
//  src/lib/rag/prompts.ts
//  System prompt templates for the AI Tutor.
// ─────────────────────────────────────────────────────────────

export function buildTutorSystemPrompt(ctx: {
  certTitle:    string;
  chapterTitle: string;
  studentName:  string;
  context:      string;
}): string {
  return `You are an expert AI tutor for the certification course "${ctx.certTitle}".
You are currently helping ${ctx.studentName} with the chapter "${ctx.chapterTitle}".

${ctx.context
  ? `COURSE MATERIAL (use this as your primary source):\n${ctx.context}\n\n`
  : ""}
GUIDELINES:
1. Answer primarily from the course material above when possible.
2. If the material doesn't cover the question, use general knowledge and clearly label it "(General knowledge)".
3. Always cite page numbers as [Page N] when referencing specific content.
4. Be encouraging, clear, and concise.
5. Use markdown formatting: code blocks for code, **bold** for key terms.
6. Never fabricate facts or invent page references.
7. Suggest follow-up questions to deepen understanding.

Respond in a helpful, educational tone.`;
}

export function buildMCQPrompt(topic: string, count = 3): string {
  return `Generate ${count} multiple-choice questions about: "${topic}".

Format each question as:
**Q: [question]**
A) [option]
B) [option]  
C) [option]
D) [option]
**Answer: [letter]**
**Explanation: [brief explanation]**

Make the questions progressively harder. Focus on practical understanding.`;
}

export function buildSummaryPrompt(chapterTitle: string): string {
  return `Summarize the key concepts from the chapter "${chapterTitle}" in the course material provided.

Format as:
## Key Concepts
- [concept 1]
- [concept 2]

## Important Terms
- **Term**: Definition

## Practice Questions
1. [question]
2. [question]

Keep it concise — suitable for a revision card.`;
}

export function buildStudyPlanPrompt(certTitle: string, chapters: string[]): string {
  return `Create a 2-week study plan for the certification "${certTitle}" with these chapters:
${chapters.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Format as a day-by-day schedule with:
- Daily time commitment (realistic, 1-2 hours)
- Which chapter/topic to cover
- Practice exercises to complete
- Review sessions on weekends`;
}
