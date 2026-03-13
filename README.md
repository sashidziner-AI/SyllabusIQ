# Assessment Question Generator

## Overview
The **Assessment Question Generator** creates **Multiple Choice Questions (MCQs)** strictly from the content of a **single uploaded document**.  
It analyzes the document, extracts **Performance Criteria (PC)**, and generates **3–5 conceptual MCQs per PC** without using any external knowledge.

## Key Rules
- Use **ONLY the currently uploaded document**.
- **Ignore previous uploads or external references**.
- Questions must be based **strictly on the document content**.
- Avoid **duplicate or very similar questions**.
- Each question must contain **four options (A–D)** with **one correct answer**.

## Question Structure
Each generated MCQ must include:
- Question
- Option A
- Option B
- Option C
- Option D
- Correct Answer
- Explanation
- Page Reference from the PDF

## Performance Criteria (PC)
- The system identifies **Performance Criteria (PC)** in the document.
- **3–5 MCQs** are generated for each PC.
- Questions should test **conceptual understanding**, not simple keyword matching.

## NOS Detection Logic

### Case 1: NOS Modules Present
If the document contains **NOS (National Occupational Standards)** information, include:

- NOS Code
- NOS Name
- Performance Criteria (PC)
- Question
- Options A–D
- Correct Answer
- Explanation
- Page Reference

### Case 2: NOS Modules Not Present
If NOS information is **not present**, include only:

- Performance Criteria (PC)
- Question
- Options A–D
- Correct Answer
- Explanation
- Page Reference

## Output Format

### When NOS is Present
| NOS Code | NOS Name | Performance Criteria (PC) | Question | Option A | Option B | Option C | Option D | Correct Answer | Explanation | Page Reference |

### When NOS is Not Present
| Performance Criteria (PC) | Question | Option A | Option B | Option C | Option D | Correct Answer | Explanation | Page Reference |

## Validation Requirements
Before returning results, ensure:

- Questions are **derived only from the uploaded document**.
- **NOS fields appear only when NOS exists in the document**.
- **Column order matches the required format exactly**.
- **No duplicate questions are generated**.
- Every answer includes a **clear explanation and page reference**.
