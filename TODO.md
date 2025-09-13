# TODO List - Legal Tech Application

## High Priority
- [ ] Set up marketing group routing structure
- [ ] Create landing page (/) with pitch: 'Turn legal forms into structured data instantly'
- [ ] Create demo page (/demo) for upload, extract, edit, export functionality
- [ ] Create API route /api/extract for AI extraction calls
- [ ] Create API route /api/save for database storage
- [ ] Add necessary dependencies for file upload, AI processing, database

## Medium Priority
- [ ] Create about page (/about) explaining benefits for law firms, compliance officers, courts
- [ ] Update layout.tsx with proper metadata and navigation

## Low Priority
- [ ] Create optional history page (/history) for saved extractions from DB

## Project Overview
This application helps the Public Defender's Office convert handwritten legal forms into structured data. It needs to handle:
- Messy, informal handwriting
- Non-compliant form responses
- Missing mandatory fields
- Ambiguous responses requiring human review

## Key Features
- OCR for handwritten text recognition
- AI-powered text extraction and structuring
- CSV export functionality
- Database storage for case management
- Human review flagging for uncertain interpretations