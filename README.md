# SMU project - public defender's office

# Tech Stack:
* nextjs
## Run:
* bun i
* bun run dev

## Todo:
* Convert handwritten pdf in form ![https://static.wixstatic.com/media/f24d94_3745dc153ff04b37a1531e0f3b89e78a~mv2.jpg/v1/fill/w_1009,h_1000,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/photo.jpg](here) to proper form data.
* Sometimes, handwriting is inconsistent etc so : "consider how your tool might intelligently map informal responses to system-compliant formats, flag uncertain interpretations for human review, and ensure mandatory fields are populated even when applicants provide information in unexpected ways."



## Core functionality
The tool must:
* Recognise handwritten text from hardcopy application forms
* Convert handwriting into editable and searchable text data
* Output data in two formats:
* Downloadable CSV file
* Direct database transfer for front-end case management portal viewing

### Real-World Complexity
Your solution must intelligently handle non-ideal applicant behaviour, including:
* Responses that ignore form structure and field boundaries
* Informal language that doesn't match system validation requirements
* Missing or incomplete mandatory field information
* Ambiguous responses that require interpretation or flagging for human review


# Project Description:

## Grading Rubrics

Download the Grading Rubrics [here](https://www.smulit.org/_files/ugd/f24d94_bf9f79f309b3451e83c25337be617b66.pdf)

## Problem Statements

Submissions close on Saturday, 13 September 2130H!

[Submit Solution](https://docs.google.com/forms/d/e/1FAIpQLSd1cqKTIBzE8D_B6QKySdlehQmJQWIR0YMGdlJuL7DaqX9bVA/viewform?usp=dialog)

## About the Sponsor

The Public Defender’s Office (PDO) was established to enhance access to justice to vulnerable persons through the provision of criminal defence aid. Set up as a department under the Ministry of Law, the PDO is led by the Chief Public Defender and staffed by a team of full-time public defenders. Singapore Citizens and Permanent Residents, who are charged with non-capital criminal offences and are unable to afford legal representation, may apply for criminal defence aid with the PDO.

## Background

Criminal defence aid application processes face a fundamental accessibility challenge: they must remain available through hardcopy forms to ensure non-tech savvy applicants can access legal support. Yet, this creates significant workflow inefficiencies for government officers processing these applications.

The Current Reality

When applicants fill out criminal defence aid forms, they rarely follow the structured format that digital systems require. Instead of neat, compliant responses in designated fields, officers regularly encounter:

- Informal language responses: Applicants write "not sure," "don't remember," or "maybe" in fields that require specific categorical answers
- Structural non-compliance: Applicants ignore the intended form structure entirely, writing lengthy narratives in single boxes instead of distributing information across designated fields
- Incomplete mandatory fields: Critical information may be missing entirely,struck out, or buried within unrelated text sections
- Handwriting interpretation challenges: Officers must decipher varying handwriting quality while simultaneously translating informal responses into system-compliant terminology

The Workflow Friction

This creates a labour-intensive manual interpretation process where officers must:

1. Decode handwritten text across varying legibility levels
2. Hunt for mandatory information scattered throughout narrative responses or written in unexpected form sections
3. Translate informal language into standardised system terminology (e.g., converting "not sure" into "unknown" for dropdown validation)
4. Make judgment calls about ambiguous or contradictory responses
5. Handle validation errors when informal responses don't meet system field requirements

Each application requires significant manual processing time, and the interpretation process introduces potential for transcription errors and inconsistent data entry across different officers.

## Challenge

Your task is to build an intelligent OCR solution that can handle the messy reality of how people actually complete forms, not just the ideal scenario of neat, compliant responses.

Core functionality

The tool must:

- Recognise handwritten text from hardcopy application forms
- Convert handwriting into editable and searchable text data
- Output data in two formats:
	- Downloadable CSV file
	- Direct database transfer for front-end case management portal viewing

Real-World Complexity

Your solution must intelligently handle non-ideal applicant behaviour, including:

- Responses that ignore form structure and field boundaries
- Informal language that doesn't match system validation requirements
- Missing or incomplete mandatory field information
- Ambiguous responses that require interpretation or flagging for human review

## Reading Materials

- [PDO website](https://pdo.mlaw.gov.sg/)
- [Establishment of the Public Defender’s Office with the introduction of the Public Defenders Bill](https://www.mlaw.gov.sg/news/press-releases/establishment-of-the-public-defenders-office-with-the-introduction-of-the-public-defenders-bill/)
- [Application Process and Eligibility Criteria for Criminal Defence Aid (video)](https://www.youtube.com/watch?v=Unl-ZzIhAVU)
- [Application form (online version)](https://go.gov.sg/applypdo)
- Excerpt of hardcopy application form (refer to image below)



## Possible Solutions

An effective solution will reduce the manual interpretation burden on government officers while maintaining the accessibility that hardcopy forms provide to applicants who cannot or prefer not to use digital channels. Consider how your tool might intelligently map informal responses to system-compliant formats, flag uncertain interpretations for human review, and ensure mandatory fields are populated even when applicants provide information in unexpected ways.

## Track Prize

Earn the chance to showcase your prototype in a joint presentation to senior leaders at the Ministry of Law.
