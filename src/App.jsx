import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import './App.css'

export default function App() {
  const [alternatives, setAlternatives] = useState([])
  const [loading, setLoading] = useState(false)
  const [styleGuide, setStyleGuide] = useState('')
  const [showStyleGuide, setShowStyleGuide] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Write something here. Select any text and click Generate to get alternatives.</p>',
  })

  const getSelectedText = () => {
    if (!editor) return ''
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to, ' ')
  }

  const handleGenerate = async () => {
    const text = getSelectedText()
    if (!text.trim()) {
      alert('Please select some text first.')
      return
    }

    setLoading(true)
    setAlternatives([])

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Give me exactly 3 alternative versions of this text. Return ONLY a JSON array of 3 strings, no explanation, no markdown, just the raw JSON array.
${styleGuide.trim() ? `\n\nStyle guide to follow:\n${styleGuide}` : ''}
Text to rewrite: "${text}"`,
            },
          ],
        }),
      })

      const data = await response.json()
      const content = data.content[0].text
      const parsed = JSON.parse(content)
      setAlternatives(parsed)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Check the console.')
    } finally {
      setLoading(false)
    }
  }

  const handleReplace = (alt) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, alt).run()
    setAlternatives([])
  }

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400&display=swap"
        rel="stylesheet"
      />
      <header style={styles.header}>
        <h1 style={styles.title}>Rewrite</h1>
        <p style={styles.subtitle}>Select text, generate alternatives.</p>
      </header>

      <main style={styles.main}>
        <EditorContent editor={editor} style={styles.editorWrap} />

        <div style={styles.styleGuideSection}>
          <button
            onClick={() => setShowStyleGuide(!showStyleGuide)}
            style={styles.styleGuideToggle}
          >
            {showStyleGuide ? '▲' : '▼'} Style guide {styleGuide.trim() ? '(active)' : '(optional)'}
          </button>
          {showStyleGuide && (
            <textarea
              value={styleGuide}
              onChange={(e) => setStyleGuide(e.target.value)}
              placeholder="Paste your style guide here. E.g. Use active voice. Avoid jargon. Keep sentences under 20 words."
              style={styles.styleGuideInput}
              rows={5}
            />
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={styles.generateBtn}
        >
          {loading ? 'Generating...' : 'Generate alternatives →'}
        </button>

        {alternatives.length > 0 && (
          <div style={styles.alternatives}>
            <div style={styles.altHeader}>
              <p style={styles.altLabel}>Click a version to replace your selection</p>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={styles.moreBtn}
              >
                {loading ? 'Generating...' : 'More options →'}
              </button>
            </div>
            {alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => handleReplace(alt)}
                style={styles.altBtn}
              >
                <span style={styles.altNumber}>{i + 1}</span>
                <span style={styles.altText}>{alt}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: "'EB Garamond', Georgia, serif",
    background: '#faf9f7',
    color: '#1a1a1a',
  },
  header: {
    padding: '2rem',
    borderBottom: '1px solid #e0ddd8',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 400,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
    marginTop: '0.25rem',
  },
  main: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '2rem',
    width: '100%',
  },
  editorWrap: {
    minHeight: 200,
    lineHeight: 1.75,
    fontSize: '1rem',
    marginBottom: '1.5rem',
    outline: 'none',
  },
  generateBtn: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '2px',
    cursor: 'pointer',
    opacity: 1,
  },
  alternatives: {
    marginTop: '2rem',
    borderTop: '1px solid #e0ddd8',
    paddingTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  altLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#aaa',
    marginBottom: '0.5rem',
  },
  altBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    background: '#fff',
    border: '1px solid #e0ddd8',
    borderRadius: '2px',
    padding: '1rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s',
    width: '100%',
  },
  altNumber: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: '#aaa',
    flexShrink: 0,
    marginTop: '0.15rem',
  },
  altText: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '1rem',
    color: '#1a1a1a',
    lineHeight: 1.65,
  },
  styleGuideSection: {
    marginBottom: '1.5rem',
  },
  styleGuideToggle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '0.75rem',
  },
  styleGuideInput: {
    width: '100%',
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '0.95rem',
    lineHeight: 1.65,
    padding: '0.75rem',
    border: '1px solid #e0ddd8',
    borderRadius: '2px',
    background: '#fff',
    color: '#333',
    resize: 'vertical',
  },
  altHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  moreBtn: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'none',
    border: '1px solid #e0ddd8',
    color: '#888',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    cursor: 'pointer',
  },
}