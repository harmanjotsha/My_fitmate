import { useState } from 'react'
import { Download, HelpCircle, LoaderCircle, Send, Sparkles } from 'lucide-react'
import { api } from '../services/api.js'

function downloadMarkdown(query, answer) {
  const markdown = `# FitMate Help Desk\n\n## Your question\n\n${query.trim()}\n\n## Guidance\n\n${answer.trim()}\n\n---\n\n_General wellness information, not medical advice._\n`
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fitmate-help-${new Date().toISOString().slice(0, 10)}.md`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function HelpDeskView() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const askHelpDesk = async (event) => {
    event.preventDefault()
    if (!query.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await api.chat(query.trim())
      setAnswer(result.response || 'I could not find a useful answer for that question. Try adding a little more detail.')
    } catch (requestError) {
      setError(requestError.message || 'Help Desk is unavailable right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="feature-page help-desk-page">
      <header className="feature-header">
        <div>
          <p className="section-kicker">FITMATE SUPPORT</p>
          <h2>Help Desk</h2>
          <p>Ask about workouts, meals, recovery, routines, or anything else you want help with.</p>
        </div>
        <div className="help-desk-badge"><Sparkles size={15} /> Profile-aware answers</div>
      </header>

      <div className="help-desk-layout">
        <form className="panel help-desk-form" onSubmit={askHelpDesk}>
          <div className="help-desk-icon"><HelpCircle size={21} /></div>
          <div>
            <h3>What can we help you with?</h3>
            <p>Write your question in your own words. Each answer is generated for the query you ask.</p>
          </div>
          <textarea value={query} onChange={(event) => setQuery(event.target.value)} placeholder="For example: I only have 20 minutes today. What workout should I do?" rows="7" />
          <button className="primary-button" type="submit" disabled={busy || !query.trim()}>
            {busy ? <><LoaderCircle className="spin" size={16} /> Thinking...</> : <><Send size={16} /> Ask Help Desk</>}
          </button>
        </form>

        <section className="panel help-desk-answer" aria-live="polite">
          <div className="panel-heading"><div><p className="section-kicker">YOUR ANSWER</p><h3>Relevant guidance</h3></div><HelpCircle size={18} /></div>
          {!answer && !busy && <div className="help-desk-empty">Your answer will appear here after you ask a question.</div>}
          {busy && <div className="help-desk-empty"><LoaderCircle className="spin" size={22} /> Creating a response for your question...</div>}
          {answer && !busy && <><div className="help-desk-response">{answer}</div><button className="secondary-button" type="button" onClick={() => downloadMarkdown(query, answer)}><Download size={16} /> Download as Markdown</button></>}
        </section>
      </div>
      {error && <div className="error-banner">{error}</div>}
    </section>
  )
}