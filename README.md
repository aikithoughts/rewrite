# Rewrite

A local writing assistant powered by Claude. Select any text in the editor, generate three alternative versions, and click to replace your selection inline.

Built as a personal tool for exploring AI-assisted editing workflows.

## What it does

- **Select and rewrite:** highlight any passage and generate three alternatives with one click
- **Style guide support:** paste your own style guide to shape suggestions toward your preferred voice and tone
- **Inline replacement:** click any alternative to swap it directly into your text
- **More options:** regenerate a fresh set without leaving the editor

## Setup

```bash
git clone https://github.com/aikithoughts/rewrite
cd rewrite
npm install
cp .env.example .env
```

Add your Anthropic API key to `.env`:

```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

Then run it:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Built with

- React + Vite
- TipTap (rich text editor)
- Anthropic API (Claude)

## Notes

This tool runs locally and calls the Anthropic API directly from the browser using your own API key. It is not intended for public hosting.

## Author

Dave Shevitz — [daveshevitz.com](https://daveshevitz.com)
