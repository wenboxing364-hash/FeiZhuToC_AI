# V0.2 PRD compact-edition template contract

- Reference: `C:\Users\wenbo\OneDrive\文档\ChatGPT\飞猪ToC_AI助手\飞猪AI旅行规划助手_PRD_V0.2.docx`
- SHA-256: `ac4cf81dd85fed7703123073ce95c0120274282354972e3fde7c474acf43f47f`
- Reference size: 59,697 bytes
- Reference pages: 16 (stored Word document property; live render unavailable because the file is open and LibreOffice is absent)
- Sections: 1
- Evidence: `.docx_work_v02_compact/template-style-evidence.json`; `section_audit.py` output in task history

## Page system

- US Letter portrait: 8.5 x 11 in (7,772,400 x 10,058,400 EMU)
- Margins: 1 in on all sides (914,400 EMU)
- Single section; no first-page variant; header and footer are not linked to a previous section
- Preserve the existing header/footer parts and page geometry

## Typography and components

- Reuse the reference document's existing paragraph styles and direct formatting patterns.
- Cover: English eyebrow, Chinese product title, subtitle, metadata table, one-line scope callout.
- Hierarchy: Heading 1 for numbered primary sections; Heading 2 only when a section needs an internal rule group.
- Body: Normal style; use the existing List Bullet / List Number styles for scan-friendly requirements.
- Tables: retain the source table appearance, header fill, borders, cell padding, and column-width conventions.
- Footer/header: preserve from the reference copy.

## Content flow for compact edition

1. Cover and revision record
2. Product definition and goal
3. MVP scope
4. Core conversation flow and state model
5. Requirement collection rules
6. Itinerary generation and modification rules
7. Page interaction requirements
8. Price/data rules
9. Demo scenarios and acceptance criteria
10. Non-functional constraints and follow-up documents

## Slot map

- Preserve: cover visual system, metadata pattern, revision-record pattern, page geometry, styles, numbering definitions, header/footer.
- Rewrite: all body sections after the revision record, consolidating duplicated product, flow, rule, scenario, and acceptance content.
- Remove: analytics event table, standalone risk table, repeated examples, repeated field descriptions, detailed engineering implementation instructions, future-stage deliverable list.
- Add: short note that detailed architecture, services, API contracts, schemas, testing, and deployment belong in a separate technical design document.

## Package preservation

- Reference package has 19 parts, including `word/header1.xml` and `word/footer1.xml`; no media assets.
- Preserve styles, numbering, theme, settings, header, footer, and relationships by starting from a copy of the reference.
- Body XML, core/app properties, and document relationships may change only as needed for the compact content.

## Fidelity gates

- The original reference must remain byte-for-byte unchanged.
- The compact copy must remain recognizably source-derived in title treatment, headings, tables, colors, spacing, header, and footer.
- No clipped text, broken tables, excessive empty pages, duplicate rules, or placeholder text.
- Render every page of the compact copy before delivery; if LibreOffice remains unavailable, use Word/PDF export when possible and disclose any remaining visual-QA limitation.
