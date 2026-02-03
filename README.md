# Handwritten Exam OCR & Evaluator

A sophisticated AI-powered tool designed for educational environments to extract handwritten text from scanned student submissions and evaluate the accuracy of the extraction against ground truth data.

## 🚀 Overview

This application leverages the **Google Gemini API** (Gemini 3 Flash) to perform high-fidelity OCR on handwritten scripts. It goes beyond simple text extraction by segmenting responses by question number, preserving original student spelling (crucial for accurate evaluation), and handling complex handwriting artifacts like strikethroughs and insertions.

## ✨ Key Features

- **Intelligent Segmentation**: Automatically identifies and groups text by question labels (e.g., Q1, Q2).
- **Nuanced Handwriting Analysis**:
  - **Preserves Errors**: Does not auto-correct spelling or grammar.
  - **Artifact Filtering**: Intelligently ignores crossed-out (cancelled) text.
  - **Contextual Insertions**: Handles carets and arrows to place inserted text correctly.
- **Automated Evaluation Metrics**:
  - **CER (Character Error Rate)**: Calculates the percentage of character-level differences between OCR and ground truth.
  - **WER (Word Error Rate)**: Calculates the percentage of word-level differences.
  - **Levenshtein Distance**: Uses robust string alignment algorithms for error calculation.
- **Smart Matching**: Automatically links uploaded files to reference ground truth using the `doc_id` mapping in `reference.json`.
- **Data Visualization**: Interactive bar charts and summary cards for performance analysis across different questions.
- **Persistence**: Keeps a session-based history of scans for quick comparison.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Visualizations**: Recharts
- **Icons**: Font Awesome 6
- **Algorithm**: Custom Levenshtein Distance Implementation

## 📂 Project Structure

```text
.
├── components/
│   ├── FileUploader.tsx       # Component for selecting image files
│   ├── HistorySidebar.tsx     # Sidebar showing previously processed files
│   ├── MetricsDashboard.tsx   # Visualization of CER/WER metrics vs Ground Truth
│   └── OcrResultView.tsx      # Split-view displaying image and extracted text
├── services/
│   └── geminiService.ts       # Integration with Gemini 3 Flash API
├── utils/
│   └── metrics.ts             # Algorithms for Levenshtein distance, CER, and WER
├── App.tsx                    # Main application logic and state management
├── index.html                 # HTML entry point with import maps
├── index.tsx                  # React DOM entry point
├── metadata.json              # Project metadata and permissions
├── reference.json             # Ground truth dataset for evaluation
├── types.ts                   # TypeScript interfaces and type definitions
└── README.md                  # Project documentation
```


## 📋 Data Structure

### Ground Truth (`reference.json`)
The application expects a `reference.json` file in the root to perform automatic evaluations. The matching is done based on the `doc_id` vs. the uploaded file name.

```json
{
  "doc_id": "0.png",
  "question_id": null,
  "reference_text": "I feel that all students will find this festival extremely enjoyable..."
}
```

- `doc_id`: Matches the uploaded filename.
- `question_id`: If `null`, performs a full-document comparison. If a string (e.g., "Q1"), it matches specific segments.

## 🚦 Getting Started

### Prerequisites
- A Google Gemini API Key.
- Modern web browser.

### Environment Setup
The application requires the API key to be available via `process.env.API_KEY`.

### Usage
1. **Upload**: Drag or select a scanned image of a handwritten exam.
2. **Review**: Check the **Extraction** tab to see how the AI segmented and transcribed the text.
3. **Evaluate**: Switch to the **Evaluation Metrics** tab. If the filename matches an entry in `reference.json`, the CER/WER metrics will generate automatically.

## 🧠 OCR Rules Applied
- **QUESTION SEGMENTATION**: Identify boundaries between different questions.
- **PRESERVE SPELLING**: No auto-correction.
- **HANDLE CANCELLATIONS**: Ignore text that is clearly crossed out.
- **MANAGE INSERTIONS**: Integrate text written above lines or pointed to with arrows.
- **NO HALLUCINATION**: Use `[unclear]` for illegible words.

---
*Built with ❤️ for the future of automated educational assessment.*
