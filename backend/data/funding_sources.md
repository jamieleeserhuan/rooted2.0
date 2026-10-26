# Funding Program Source Log

Last verified: 2026-06-16

This file documents the official sources used for `funding_programs.json`.
The dataset is intentionally conservative: exact NOC mappings are left empty
unless a source explicitly provides or clearly supports an exact mapping.

## Better Jobs Ontario

- Source: https://www.ontario.ca/page/better-jobs-ontario
- Province: ON
- Verified details: skills training and financial support for eligible applicants, training for in-demand jobs, funding up to $28,000 for training of 1 year or less, funding up to $35,000 for programs more than 1 year and up to 2 years, eligible costs including tuition, books, instructional costs, transportation, and basic living allowance.
- Eligibility notes: source lists laid-off workers, laid-off workers in temporary jobs, and unemployed low-income applicants unemployed for 12 weeks or longer.
- Assumptions: target careers are broad because the source does not list exact occupations or NOC codes.
- Program boundary: Better Jobs Ontario is applicant-focused retraining support. It is distinct from the employer-focused Canada-Ontario Job Grant/Ontario Job Grant and must not be merged with that program in summaries or prompts.
- NOC mapping: `target_nocs` left empty.

## Ontario Learn and Stay Grant

- Source: https://www.ontario.ca/page/ontario-learn-and-stay-grant
- Application: https://osap.gov.on.ca/OSAPSecurityWeb/public/agreement.xhtml?src=OLSG
- Province: ON
- Verified details: funding covers tuition, compulsory fees, books, and other direct educational costs for eligible health human resources programs.
- Eligibility notes: source requires enrolment in an eligible program, Ontario residency, Canadian citizen/permanent resident/protected person status, and a work commitment in the same region where the student studied.
- Target careers: practical nursing, paramedic, medical laboratory technology/science, nursing, and nurse practitioner are listed as eligible program areas.
- Assumptions: target careers use the program names from the official page. Exact NOC codes are not added because the page does not publish NOC mappings.
- NOC mapping: `target_nocs` left empty.

## Canada-Alberta Productivity Grant

- Source: https://www.alberta.ca/canada-alberta-productivity-grant
- Application: https://capg.alberta.ca/SignIn?ReturnUrl=%2F.
- Province: AB
- Verified details: employer-driven program that partially reimburses training costs for productivity skills. Existing employee training can receive 50% government contribution up to $5,000 per trainee per fiscal year. Hiring and training an unemployed Albertan can receive up to 75% of eligible training costs up to $10,000 per trainee per fiscal year. Employer maximum is $100,000 per fiscal year.
- Eligibility notes: eligible employers include private sector employers, non-profit sector employers, First Nations, and Metis Settlements. Trainees must be current or prospective employees and must be Canadian citizens, permanent residents, or protected persons entitled to work in Canada.
- Target careers: business process and operations management, technical skills, digital skills, and productivity skills are official training categories.
- NOC mapping: `target_nocs` left empty.

## StrongerBC Future Skills Grant

- Source: https://www.workbc.ca/find-loans-and-grants/students-and-adult-learners/strongerbc-future-skills-grant
- Program updates/application directory: https://www.educationplannerbc.ca/future-skills-grant
- Province: BC
- Verified details: up to $3,500 for eligible short-term skills training at public post-secondary institutions in British Columbia.
- Eligibility notes: source describes the grant for people living in B.C., aged 19 and older.
- Target careers: health care, clean energy, construction, mining, marine transportation, inclusive economy, and short-term skills training are listed on the official WorkBC page.
- Status note: the official WorkBC page says the 2025/2026 program is currently closed for applications and points users to EducationPlannerBC for updates.
- NOC mapping: `target_nocs` left empty.

## Workplace Innovation and Productivity Skills Incentive

- Source: https://novascotia.ca/programs/workplace-innovation-productivity-skills-incentive/
- Application: https://lampss.novascotia.ca/
- Province: NS
- Verified details: may fund up to 75% of eligible training costs, including training fees, instructor costs, course materials, and travel.
- Eligibility notes: applicants can include legally registered businesses, industry associations, sector councils, and non-profits operating in Nova Scotia with direct workforce development needs.
- Target careers: source lists digital transformation, technology adoption, process improvements, green workforce skills, industry certification, regulatory compliance, high-demand occupations, and workforce readiness as eligible training activity areas.
- Status note: current official page lists an intake period from April 1 to April 30, 2026.
- NOC mapping: `target_nocs` left empty.

## Dataset Rules

- Use official government or official program pages as canonical sources.
- Do not use blog posts or third-party summaries as source material.
- Leave `target_nocs` empty when a program targets a sector, training category, or credential program but does not publish exact NOC mappings.
- Keep `eligibility` concise and structured so the text can be used directly in a RAG prompt.
- Keep source URLs with every program so generated recommendations can cite where they came from.
- Do not imply that a funding program applies to a matched NOC unless the record has an explicit `target_nocs` match or a documented career/training-stream overlap.

## Not Included Yet

- Canada-Ontario Job Grant / Ontario Job Grant: not included in `funding_programs.json` in this pass. It is employer-focused and distinct from Better Jobs Ontario. Add it later only from a current official source page, with its own record and source notes.
