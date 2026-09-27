import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiPost } from "../api";
import { useAuth } from "../auth";
import { canListen, canSpeak, listenOnce, speak, stopSpeaking } from "../speech";

export default function VoiceAgent() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const language = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);

  if (!user) {
    return null;
  }

  async function ask(text) {
    const next = text.trim();
    if (!next) {
      return;
    }
    setBusy(true);
    setError("");
    setTranscript((prev) => [...prev, { role: "you", text: next }]);
    try {
      const result = await apiPost("/api/assistant/ask", { question: next, language });
      const replyLang = (result.language || language).slice(0, 2);
      setTranscript((prev) => [...prev, { role: "honey", text: result.answer, label: result.ai_label }]);
      speak(result.answer, replyLang);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setQuestion("");
    }
  }

  return (
    <>
      <button
        type="button"
        className="voice-fab"
        data-testid="voice-fab"
        aria-label={t("voice.title")}
        onClick={() => setOpen((value) => !value)}
      >
        {t("voice.askButton")}
      </button>
      {open && (
        <div className="voice-panel card" data-testid="voice-panel">
          <strong>{t("voice.title")}</strong>
          <p className="muted">
            {t("voice.description")}
            {canSpeak() ? t("voice.descriptionWithSpeech") : t("voice.descriptionNoSpeech")}
          </p>
          <div className="voice-log">
            {transcript.map((line, index) => (
              <p key={`${line.role}-${index}`}>
                <strong>{line.role === "you" ? t("voice.you") : t("voice.honeychain")}:</strong> {line.text}
                {line.label && <span className="ai-tag">{line.label}</span>}
              </p>
            ))}
          </div>
          {error && <p className="field-error">{error}</p>}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(question);
            }}
          >
            <label htmlFor="voice-q">{t("voice.typeQuestion")}</label>
            <textarea id="voice-q" rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} />
            <div className="row" style={{ marginTop: 8 }}>
              <button className="primary" type="submit" disabled={busy}>
                {busy ? t("voice.thinking") : t("voice.askAction")}
              </button>
              {canListen() ? (
                <button
                  className="ghost"
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    try {
                      const heard = await listenOnce(language);
                      setQuestion(heard);
                      await ask(heard);
                    } catch (err) {
                      setError(err.message);
                    }
                  }}
                >
                  {t("voice.speakAction")}
                </button>
              ) : (
                <span className="muted">{t("voice.noMicrophone")}</span>
              )}
              <button className="ghost" type="button" onClick={stopSpeaking}>
                {t("voice.stopVoice")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
