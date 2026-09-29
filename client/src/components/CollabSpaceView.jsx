import { useEffect, useState } from "react";
import {
  BarChart3,
  Check,
  Copy,
  Download,
  FileText,
  Globe,
  LoaderCircle,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { api } from "../services/api.js";

function ErrorMessage({ message }) {
  return message ? <div className="error-banner">{message}</div> : null;
}

export default function CollabSpaceView() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [note, setNote] = useState({ title: "", content: "" });
  const [noteSuggestion, setNoteSuggestion] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProject = async (project) => {
    setSelected(project);
    setBusy(true);
    setError("");
    try {
      const [noteResult, fileResult, analyticsResult] = await Promise.all([
        api.projectNotes(project.id),
        api.files(project.id),
        api.projectAnalytics(project.id),
      ]);
      setNotes(noteResult.items);
      setFiles(fileResult.items);
      setAnalytics(analyticsResult.analytics);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    api
      .projects()
      .then(({ items }) => {
        setProjects(items);
        if (items[0]) loadProject(items[0]);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setBusy(false));
  }, []);
  const saveNote = async (event) => {
    event.preventDefault();
    if (!selected || !note.content.trim()) return;
    try {
      const result = await api.createProjectNote(selected.id, note);
      setNotes((current) => [result.note, ...current]);
      setAnalytics((current) => ({
        ...current,
        notes: (current?.notes || 0) + 1,
        contributions: (current?.contributions || 0) + 1,
      }));
      setNote({ title: "", content: "" });
      setNoteSuggestion("");
      setMessage("Markdown note saved");
    } catch (saveError) {
      setError(saveError.message);
    }
  };
  const askNoteAi = async () => {
    if (!note.content.trim()) return;
    setAiBusy(true);
    setError("");
    try {
      const result = await api.explainNote(note.content, "improve");
      setNoteSuggestion(
        result.response ||
          "Try adding one specific action and a realistic time for it.",
      );
    } catch (aiError) {
      setError(aiError.message);
    } finally {
      setAiBusy(false);
    }
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selected) return;
    try {
      const result = await api.uploadFile(file, selected.id);
      setFiles((current) => [result.file, ...current]);
      setAnalytics((current) => ({
        ...current,
        files: (current?.files || 0) + 1,
        contributions: (current?.contributions || 0) + 1,
      }));
      setMessage("File uploaded and ready to preview");
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };
  const createProject = async () => {
    try {
      const result = await api.createProject({ name: "New fitness project" });
      setProjects((current) => [result.project, ...current]);
      await loadProject(result.project);
    } catch (createError) {
      setError(createError.message);
    }
  };
  const invite = async (event) => {
    event.preventDefault();
    if (!selected || !email.trim()) return;
    try {
      const result = await api.addProjectMember(selected.id, email);
      setProjects((current) =>
        current.map((item) =>
          item.id === selected.id ? result.project : item,
        ),
      );
      setSelected(result.project);
      setEmail("");
      setMessage("Collaborator added");
    } catch (inviteError) {
      setError(inviteError.message);
    }
  };
  const toggleShare = async () => {
    const result = await api.updateProject(selected.id, {
      isPublic: !selected.isPublic,
    });
    setSelected(result.project);
    setProjects((current) =>
      current.map((item) => (item.id === selected.id ? result.project : item)),
    );
    setMessage(
      result.project.isPublic
        ? "Public sharing enabled"
        : "Public sharing disabled",
    );
  };
  const copyShare = async () => {
    await navigator.clipboard?.writeText(
      `${window.location.origin}/?shared=${selected.shareToken}`,
    );
    setMessage("Share link copied");
  };

  if (busy && !selected)
    return (
      <section className="feature-page">
        <div className="loading-state">
          <LoaderCircle className="spin" /> Loading collaboration space...
        </div>
      </section>
    );
  return (
    <section className="feature-page collab-space">
      <header className="feature-header">
        <div>
          <p className="section-kicker">COLLABORATION</p>
          <h2>My fitness workspace</h2>
          <p>
            Keep plans, Markdown notes, files, and accountability in one place.
          </p>
        </div>
        <button className="primary-button" onClick={createProject}>
          <Plus size={16} /> New project
        </button>
      </header>
      <ErrorMessage message={error} />
      {message && <div className="success-banner">{message}</div>}
      <div className="project-grid">
        {projects.map((project) => (
          <button
            className={`project-card ${selected?.id === project.id ? "active" : ""}`}
            key={project.id}
            onClick={() => loadProject(project)}
          >
            <div className="project-card-icon">
              <FileText size={18} />
            </div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="member-stack">
              {project.members?.slice(0, 4).map((member) => (
                <i key={member.id}>{member.name.slice(0, 1)}</i>
              ))}
              <span>{project.isPublic ? "Public" : "Private"}</span>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <>
          <div className="analytics-row">
            <div>
              <BarChart3 size={17} />
              <strong>{analytics?.contributions || 0}</strong>
              <span>contributions</span>
            </div>
            <div>
              <FileText size={17} />
              <strong>{analytics?.notes || 0}</strong>
              <span>notes</span>
            </div>
            <div>
              <Upload size={17} />
              <strong>{analytics?.files || 0}</strong>
              <span>files</span>
            </div>
            <div>
              <Users size={17} />
              <strong>{selected.members?.length || 0}</strong>
              <span>members</span>
            </div>
          </div>
          <div className="collab-toolbar">
            <button className="secondary-button" onClick={toggleShare}>
              <Globe size={16} />{" "}
              {selected.isPublic ? "Make private" : "Share publicly"}
            </button>
            {selected.isPublic && (
              <button className="secondary-button" onClick={copyShare}>
                <Copy size={16} /> Copy share link
              </button>
            )}
            <form onSubmit={invite}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Collaborator email"
                type="email"
              />
              <button className="primary-button" type="submit">
                <Send size={15} /> Invite
              </button>
            </form>
          </div>
          <div className="notes-editor">
            <form className="editor-pane panel" onSubmit={saveNote}>
              <div className="panel-heading">
                <h3>Markdown notes</h3>
                <Sparkles size={17} />
              </div>
              <input
                className="note-title"
                value={note.title}
                onChange={(event) =>
                  setNote({ ...note, title: event.target.value })
                }
                placeholder="Note title"
              />
              <textarea
                value={note.content}
                onChange={(event) =>
                  setNote({ ...note, content: event.target.value })
                }
                placeholder="# Weekly plan\n\nWrite a workout, meal, or recovery note in Markdown..."
              />
              <div className="note-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={askNoteAi}
                  disabled={aiBusy || !note.content.trim()}
                >
                  <Sparkles size={15} />{" "}
                  {aiBusy ? "Thinking..." : "Improve with AI"}
                </button>
                <button className="primary-button" type="submit">
                  <Check size={16} /> Save note
                </button>
              </div>
              {noteSuggestion && (
                <div className="ai-suggestion">
                  <strong>AI suggestion</strong>
                  <p>{noteSuggestion}</p>
                </div>
              )}
            </form>
            <div className="panel notes-list">
              <div className="panel-heading">
                <h3>Saved notes</h3>
                <span>{notes.length}</span>
              </div>
              {notes.map((item) => (
                <article className="feature-item" key={item.id}>
                  <div className="feature-item-copy">
                    <strong>{item.title}</strong>
                    <span className="saved-note-content">{item.content.slice(0, 120)}</span>
                  </div>
                  <button
                    aria-label={`Delete ${item.title}`}
                    onClick={async () => {
                      await api.deleteProjectNote(selected.id, item.id);
                      setNotes((current) =>
                        current.filter((entry) => entry.id !== item.id),
                      );
                      setAnalytics((current) => ({
                        ...current,
                        notes: Math.max(0, (current?.notes || 0) - 1),
                      }));
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </div>
          <div className="panel file-list">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">FILES & PREVIEWS</p>
                <h3>Project files</h3>
              </div>
              <label className="secondary-button">
                <Upload size={15} /> Upload
                <input hidden type="file" onChange={upload} />
              </label>
            </div>
            {files.map((file) => (
              <article className="file-card" key={file.id}>
                <div className="file-icon">
                  <FileText size={18} />
                </div>
                <div>
                  <strong>{file.name}</strong>
                  <span>
                    {Math.ceil(file.size / 1024)} KB · {file.type || "file"}
                  </span>
                </div>
                <div className="file-actions">
                  {(file.secureUrl || file.url) && (
                    <a
                      className="file-download"
                      href={file.secureUrl || file.url}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Download ${file.name}`}
                    >
                      <Download size={16} />
                    </a>
                  )}
                  <button
                    aria-label={`Delete ${file.name}`}
                    onClick={async () => {
                      await api.deleteFile(file.id, selected.id);
                      setFiles((current) =>
                        current.filter((entry) => entry.id !== file.id),
                      );
                      setAnalytics((current) => ({
                        ...current,
                        files: Math.max(0, (current?.files || 0) - 1),
                      }));
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {file.preview && (
                  <details>
                    <summary>Preview</summary>
                    <pre>{file.preview}</pre>
                  </details>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function SharedProjectView({ project }) {
  return (
    <main className="public-project">
      <p className="section-kicker">FITMATE SHARED PROJECT</p>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <div className="analytics-row">
        <div>
          <FileText size={17} />
          <strong>{project.analytics.notes}</strong>
          <span>notes</span>
        </div>
        <div>
          <Upload size={17} />
          <strong>{project.analytics.files}</strong>
          <span>files</span>
        </div>
        <div>
          <Users size={17} />
          <strong>{project.members.length}</strong>
          <span>members</span>
        </div>
      </div>
      <section className="panel">
        <h2>Notes</h2>
        {project.notes.map((note) => (
          <article className="public-note" key={note.id}>
            <h3>{note.title}</h3>
            <pre>{note.content}</pre>
          </article>
        ))}
      </section>
      <p className="public-cta">
        Collaborate on your own wellness journey with FitMate.
      </p>
    </main>
  );
}
