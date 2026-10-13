import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Cpu,
  Laptop,
  Lightbulb,
  Loader2,
  Menu,
  PcCase,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react'
import { scenarios } from './scenarios.js'
import Schematic from './Schematic.jsx'

const STEPS = ['Síntomas', 'Diagnóstico', 'Causa', 'Reparación']
const CHECK_DURATION = 700
const DEVICES = {
  desktop: { label: 'Escritorio', icon: PcCase },
  laptop: { label: 'Portátil', icon: Laptop },
}

// Lectura/escritura tolerante a modo privado o almacenamiento bloqueado
function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* sin persistencia */ }
  }, [key, value])
  return [value, setValue]
}

// Barajado determinista: el orden de las opciones no cambia entre visitas,
// pero la respuesta correcta deja de estar siempre en la misma posición.
function seededShuffle(items, seed) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0
    const j = h % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function StatusPill({ status }) {
  const labels = { ok: 'Normal', warn: 'Atención', bad: 'Crítico' }
  return <span className={`pill ${status}`}>{labels[status]}</span>
}

function Sidebar({ selectedId, onSelect, completed, open, onClose, section, onSection }) {
  const list = scenarios.filter((s) => s.device === section)
  const solvedHere = list.filter((s) => completed.includes(s.id)).length
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Casos de práctica">
      <div className="brand">
        <div className="brand-icon"><Cpu size={24} aria-hidden="true" /></div>
        <div>
          <strong>PC Lab</strong>
          <span>Simulador de fallas</span>
        </div>
        <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Cerrar lista de casos"><X size={20} /></button>
      </div>

      <h2 className="sidebar-title">Casos de práctica</h2>
      <div className="device-switch" role="group" aria-label="Tipo de equipo">
        {Object.entries(DEVICES).map(([key, { label, icon: Icon }]) => (
          <button key={key} onClick={() => onSection(key)} aria-pressed={section === key}>
            <Icon size={17} aria-hidden="true" />
            {label}
            <span className="device-count">{scenarios.filter((s) => s.device === key).length}</span>
          </button>
        ))}
      </div>
      <p className="sidebar-progress">{solvedHere} de {list.length} resueltos en {DEVICES[section].label.toLowerCase()}</p>
      <nav aria-label={`Casos de ${DEVICES[section].label.toLowerCase()}`}>
        <ul className="scenario-list">
          {list.map((scenario) => {
            const Icon = scenario.icon
            const isDone = completed.includes(scenario.id)
            const isActive = selectedId === scenario.id
            return (
              <li key={scenario.id}>
                <button
                  className={`scenario-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelect(scenario.id)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className={`scenario-icon ${scenario.color}`}><Icon size={18} aria-hidden="true" /></span>
                  <span className="scenario-copy">
                    <strong>{scenario.title}</strong>
                    <small>{scenario.category}, {scenario.difficulty.toLowerCase()}</small>
                  </span>
                  {isDone
                    ? <CheckCircle2 className="done-mark" size={18} aria-label="Resuelto" />
                    : <ChevronRight className="chev" size={18} aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

function Stepper({ step, maxStep, onGo }) {
  return (
    <nav aria-label="Etapas del caso">
      <ol className="stepper">
        {STEPS.map((label, index) => {
          const state = index === step ? 'current' : index <= maxStep ? 'reached' : 'locked'
          return (
            <li key={label} className={`stepper-item ${state}`}>
              <button
                onClick={() => onGo(index)}
                disabled={index > maxStep}
                aria-current={index === step ? 'step' : undefined}
              >
                <span className="stepper-dot" aria-hidden="true">
                  {index < maxStep && index !== step ? <CheckCircle2 size={16} /> : index + 1}
                </span>
                <span className="stepper-label">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Readings({ readings, compact = false }) {
  return (
    <div className={`reading-grid ${compact ? 'compact' : ''}`}>
      {readings.map((r) => (
        <div className={`reading-card ${r.status}`} key={r.label}>
          <span className="reading-label">{r.label}</span>
          <strong>{r.value}</strong>
          <StatusPill status={r.status} />
        </div>
      ))}
    </div>
  )
}

function Hint({ children }) {
  return <div className="hint"><Lightbulb size={18} aria-hidden="true" /><span>{children}</span></div>
}

function App() {
  const [selectedId, setSelectedId] = useStoredState('pclab:case', scenarios[0].id)
  const [completed, setCompleted] = useStoredState('pclab:completed', [])
  const [learningMode, setLearningMode] = useStoredState('pclab:learning', true)
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [checked, setChecked] = useState([])
  const [running, setRunning] = useState(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [repairStep, setRepairStep] = useState(0)
  const [repairDone, setRepairDone] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [section, setSection] = useStoredState('pclab:section', 'desktop')

  const timer = useRef(null)
  const headingRef = useRef(null)
  const firstRender = useRef(true)

  const scenario = scenarios.find((s) => s.id === selectedId) ?? scenarios[0]
  const ScenarioIcon = scenario.icon
  const options = useMemo(() => seededShuffle(scenario.diagnosisOptions, scenario.id), [scenario])
  const keyCheck = scenario.checks.find((c) => c.id === scenario.keyCheck)
  const solved = feedback === 'correct'

  useEffect(() => () => clearTimeout(timer.current), [])

  // Al cambiar de etapa, lleva el foco y la vista al encabezado del nuevo panel
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    headingRef.current?.focus({ preventScroll: true })
    if (step === 0) window.scrollTo({ top: 0, behavior })
    else document.querySelector('.stepper')?.scrollIntoView({ behavior, block: 'start' })
  }, [step, selectedId])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const goTo = (index) => {
    setStep(index)
    setMaxStep((m) => Math.max(m, index))
  }

  const resetCase = (id = selectedId) => {
    clearTimeout(timer.current)
    setSelectedId(id)
    setSection(scenarios.find((s) => s.id === id)?.device ?? 'desktop')
    setStep(0)
    setMaxStep(0)
    setChecked([])
    setRunning(null)
    setDiagnosis('')
    setFeedback(null)
    setAttempts(0)
    setRepairStep(0)
    setRepairDone(false)
    setMenuOpen(false)
  }

  const runCheck = (checkId) => {
    if (running || checked.includes(checkId)) return
    setRunning(checkId)
    timer.current = setTimeout(() => {
      setChecked((prev) => [...prev, checkId])
      setRunning(null)
    }, CHECK_DURATION)
  }

  const submitDiagnosis = (e) => {
    e.preventDefault()
    if (!diagnosis || solved) return
    setAttempts((a) => a + 1)
    setFeedback(diagnosis === scenario.correctDiagnosis ? 'correct' : 'wrong')
  }

  const finishRepair = () => {
    setRepairDone(true)
    setCompleted((prev) => (prev.includes(scenario.id) ? prev : [...prev, scenario.id]))
  }

  const nextCase = () => {
    // Prioriza casos sin resolver del mismo tipo de equipo
    const start = scenarios.findIndex((s) => s.id === selectedId)
    const ordered = [...scenarios.slice(start + 1), ...scenarios.slice(0, start + 1)]
    const pending = ordered.filter((s) => !completed.includes(s.id) && s.id !== scenario.id)
    const next = pending.find((s) => s.device === scenario.device) ?? pending[0]
      ?? ordered.find((s) => s.device === scenario.device) ?? ordered[0]
    resetCase(next.id)
  }

  const isLastRepair = repairStep === scenario.repair.length - 1

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al caso</a>

      <Sidebar
        selectedId={selectedId}
        onSelect={resetCase}
        completed={completed}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        section={section}
        onSection={setSection}
      />
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <main className="main-area" id="contenido">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Ver casos de práctica" aria-expanded={menuOpen}>
            <Menu size={20} />
          </button>
          <h1>Diagnostica, entiende y repara</h1>
          <label className="switch">
            <input
              type="checkbox"
              role="switch"
              checked={learningMode}
              onChange={(e) => setLearningMode(e.target.checked)}
            />
            <span className="switch-track" aria-hidden="true"></span>
            <span>Pistas de aprendizaje</span>
          </label>
        </header>

        <section className="case-hero" aria-labelledby="case-title">
          <div className={`hero-icon ${scenario.color}`}><ScenarioIcon size={28} aria-hidden="true" /></div>
          <div className="hero-copy">
            <div className="case-meta">
              <span className="meta-device">{React.createElement(DEVICES[scenario.device].icon, { size: 14, 'aria-hidden': true })}{DEVICES[scenario.device].label}</span>
              <span>{scenario.category}</span>
              <span>Dificultad {scenario.difficulty.toLowerCase()}</span>
              {completed.includes(scenario.id) && <span className="meta-done">Resuelto</span>}
            </div>
            <h2 id="case-title">{scenario.title}</h2>
            <p>{scenario.short}</p>
          </div>
          <button className="ghost-btn" onClick={() => resetCase()}><RefreshCw size={16} aria-hidden="true" /> Reiniciar caso</button>
        </section>

        <Stepper step={step} maxStep={maxStep} onGo={setStep} />

        {step === 0 && (
          <section className="workspace two-col">
            <div className="panel">
              <div className="panel-heading">
                <h3 ref={headingRef} tabIndex={-1}>Observa los síntomas</h3>
                <p>Esto es lo que reporta el usuario del equipo.</p>
              </div>
              <ul className="symptom-list">
                {scenario.symptoms.map((item) => (
                  <li className="symptom" key={item}><AlertTriangle size={17} aria-hidden="true" /><span>{item}</span></li>
                ))}
              </ul>
              {learningMode && <Hint>No intentes reparar todavía. Primero reúne evidencias: compara los síntomas con las lecturas del equipo.</Hint>}
              <div className="actions">
                <button className="primary-btn" onClick={() => goTo(1)}><Search size={18} aria-hidden="true" /> Empezar diagnóstico</button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h3>Lecturas del equipo</h3>
                <p>Sensores y herramientas del sistema.</p>
              </div>
              <Readings readings={scenario.readings} />
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="workspace two-col">
            <div className="panel">
              <div className="panel-heading">
                <h3 ref={headingRef} tabIndex={-1}>Ejecuta pruebas</h3>
                <p>{checked.length} de {scenario.checks.length} pruebas realizadas.</p>
              </div>
              <ul className="check-list">
                {scenario.checks.map((check) => {
                  const done = checked.includes(check.id)
                  const isRunning = running === check.id
                  return (
                    <li className={`check-card ${done ? 'done' : ''}`} key={check.id}>
                      <div className="check-top">
                        <span className="check-icon" aria-hidden="true">
                          {done ? <CheckCircle2 size={20} /> : isRunning ? <Loader2 className="spin" size={20} /> : <Circle size={20} />}
                        </span>
                        <strong>{check.label}</strong>
                        {!done && (
                          <button className="small-btn" onClick={() => runCheck(check.id)} disabled={!!running} aria-busy={isRunning}>
                            {isRunning ? 'Ejecutando…' : 'Ejecutar'}
                          </button>
                        )}
                      </div>
                      <div aria-live="polite">{done && <p className="check-result">{check.result}</p>}</div>
                    </li>
                  )
                })}
              </ul>
              {learningMode && checked.length < 2 && <Hint>Realiza al menos dos pruebas antes de elegir una causa. Una prueba que descarta algo también es evidencia.</Hint>}

              <details className="readings-recall">
                <summary>Ver lecturas del equipo</summary>
                <Readings readings={scenario.readings} compact />
              </details>
            </div>

            <form className="panel" onSubmit={submitDiagnosis}>
              <fieldset className="diagnosis-fieldset" disabled={solved}>
                <legend className="panel-heading">
                  <h3>¿Qué está fallando?</h3>
                  <p>Elige la causa que mejor explica las evidencias.</p>
                </legend>
                <div className="diagnosis-options">
                  {options.map((option) => (
                    <label className={`diagnosis-option ${diagnosis === option ? 'selected' : ''}`} key={option}>
                      <input
                        type="radio"
                        name="diagnosis"
                        value={option}
                        checked={diagnosis === option}
                        onChange={() => { setDiagnosis(option); if (feedback === 'wrong') setFeedback(null) }}
                      />
                      <span className="radio-ui" aria-hidden="true"></span>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div aria-live="polite">
                {feedback === 'wrong' && (
                  <div className="feedback error">
                    <AlertTriangle size={18} aria-hidden="true" />
                    <span>
                      «{diagnosis}» no explica las evidencias. Elige otra opción.
                      {learningMode && keyCheck && (checked.includes(keyCheck.id)
                        ? <> Vuelve a leer el resultado de «{keyCheck.label}».</>
                        : <> Prueba con «{keyCheck.label}».</>)}
                    </span>
                  </div>
                )}
                {solved && (
                  <div className="feedback success">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>Diagnóstico correcto{attempts === 1 ? ' al primer intento' : ` en ${attempts} intentos`}.</span>
                  </div>
                )}
              </div>

              <div className="actions">
                {solved ? (
                  <button type="button" className="primary-btn" onClick={() => goTo(2)}>Ver la causa <ChevronRight size={18} aria-hidden="true" /></button>
                ) : (
                  <button type="submit" className="primary-btn" disabled={!diagnosis}>Confirmar diagnóstico</button>
                )}
                <button type="button" className="text-btn" onClick={() => setStep(0)}><ArrowLeft size={16} aria-hidden="true" /> Síntomas</button>
              </div>
            </form>
          </section>
        )}

        {step === 2 && (
          <section className="workspace two-col">
            <div className="panel">
              <div className="panel-heading">
                <h3 ref={headingRef} tabIndex={-1}>{scenario.correctDiagnosis}</h3>
                <p>La causa real de la falla.</p>
              </div>
              <p className="lead">{scenario.cause}</p>
              <div className="explain-box">
                <strong>¿Por qué ocurre?</strong>
                <p>{scenario.why}</p>
              </div>

              <h4 className="subheading">Evidencias que lo confirmaron</h4>
              {checked.length > 0 ? (
                <ul className="tick-list">
                  {scenario.checks.filter((c) => checked.includes(c.id)).map((c) => (
                    <li key={c.id}><CheckCircle2 size={18} aria-hidden="true" /><span>{c.result}</span></li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Llegaste al diagnóstico sin ejecutar pruebas. En un equipo real, confirma siempre con evidencias antes de reparar.</p>
              )}

              <div className="actions">
                <button className="primary-btn" onClick={() => goTo(3)}><Wrench size={18} aria-hidden="true" /> Aprender a repararlo</button>
              </div>
            </div>

            <div className="panel schematic-panel">
              <div className="panel-heading">
                <h3>Dónde está el problema</h3>
                <p>{scenario.device === 'laptop' ? 'Vista interior del portátil, sin la tapa inferior.' : 'Vista interior de la torre.'}</p>
              </div>
              <Schematic device={scenario.device} fault={scenario.zone} faultLabel={scenario.zoneLabel} />
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="workspace two-col">
            <div className="panel">
              <div className="panel-heading">
                <h3 ref={headingRef} tabIndex={-1}>Reparación guiada</h3>
                <p>Paso {repairStep + 1} de {scenario.repair.length}. Puedes volver a cualquier paso ya visto.</p>
              </div>

              <ol className="repair-list">
                {scenario.repair.map((text, index) => {
                  const state = repairDone || index < repairStep ? 'past' : index === repairStep ? 'current' : 'future'
                  return (
                    <li key={index} className={`repair-item ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                      <button onClick={() => setRepairStep(index)} disabled={state === 'future'}>
                        <span className="repair-number" aria-hidden="true">{state === 'past' ? <CheckCircle2 size={18} /> : index + 1}</span>
                        <span className="repair-text">{text}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>

              {repairDone ? (
                <div className="completed-card" role="status">
                  <CheckCircle2 size={26} aria-hidden="true" />
                  <div>
                    <strong>Caso resuelto</strong>
                    <span>Identificaste la falla, su causa y el procedimiento de reparación.</span>
                  </div>
                </div>
              ) : (
                <div className="actions">
                  {isLastRepair ? (
                    <button className="primary-btn" onClick={finishRepair}><CheckCircle2 size={18} aria-hidden="true" /> Terminar reparación</button>
                  ) : (
                    <button className="primary-btn" onClick={() => setRepairStep((v) => v + 1)}>Siguiente paso <ChevronRight size={18} aria-hidden="true" /></button>
                  )}
                  <button className="text-btn" onClick={() => setRepairStep((v) => v - 1)} disabled={repairStep === 0}>
                    <ChevronLeft size={16} aria-hidden="true" /> Anterior
                  </button>
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h3>Cómo evitar que vuelva a ocurrir</h3>
                <p>Hábitos de mantenimiento preventivo.</p>
              </div>
              <ul className="tick-list">
                {scenario.prevention.map((item) => <li key={item}><ShieldCheck size={18} aria-hidden="true" /><span>{item}</span></li>)}
              </ul>
              <button className={repairDone ? 'primary-btn wide' : 'secondary-btn wide'} onClick={nextCase}>
                <Play size={17} aria-hidden="true" /> Practicar otro caso
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
