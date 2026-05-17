import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate }                               from 'react-router-dom';
import { useAuth }                                   from '../../../context/AuthContext';
import { apiDetect }                                 from '../../../services/authApi';
import styles                                        from './UploadSection.module.css';

/* ── Analysis step definitions ───────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Uploading to secure storage...' },
  { id: 2, label: 'Identifying Car Model...'        },
  { id: 3, label: 'Segmenting Body Panels...'       },
  { id: 4, label: 'Classifying Damage Gravity...'   },
  { id: 5, label: 'Compiling Report...'             },
];

/* How long (ms) each step stays "active" before the next starts.
   Last step stays active until the real response arrives.          */
const STEP_DURATIONS = [1800, 2200, 2400, 0, 0]; // last two wait for API

const STATUS_LABELS = { done: 'SUCCESS', active: 'ACTIVE', pending: 'PENDING' };

/* ── Component ────────────────────────────────────────────────────────────── */
export default function UploadSection() {
  const { token }  = useAuth();
  const navigate   = useNavigate();

  /* Upload state */
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile]             = useState(null);       // raw File object
  const [previewUrl, setPreviewUrl] = useState(null);       // object URL for preview
  const fileInputRef                = useRef(null);

  /* Analysis state */
  const [phase, setPhase]           = useState('idle');     // idle | running | done | error
  const [progress, setProgress]     = useState(0);
  const [stepStatuses, setStepStatuses] = useState(
    STEPS.map(() => 'pending')
  );
  const [scanLabel, setScanLabel]   = useState('AWAITING INPUT');
  const [result, setResult]         = useState(null);       // API response
  const [errorMsg, setErrorMsg]     = useState('');

  const progressRef  = useRef(null);
  const stepTimerRef = useRef([]);

  /* ── Cleanup object URLs ─────────────────────────────────────────────── */
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  /* ── Drag-and-drop handlers ──────────────────────────────────────────── */
  const handleDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop      = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }, []);

  function pickFile(f) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    resetAnalysis();
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  }

  /* ── Reset analysis state back to idle ──────────────────────────────── */
  function resetAnalysis() {
    setPhase('idle');
    setProgress(0);
    setStepStatuses(STEPS.map(() => 'pending'));
    setScanLabel('AWAITING INPUT');
    setResult(null);
    setErrorMsg('');
    clearInterval(progressRef.current);
    stepTimerRef.current.forEach(clearTimeout);
    stepTimerRef.current = [];
  }

  /* ── Mark a step's status ────────────────────────────────────────────── */
  function setStep(idx, status) {
    setStepStatuses(prev => prev.map((s, i) => (i === idx ? status : s)));
  }

  /* ── Animate progress bar from current value toward `target` ─────────── */
  function crawlProgressTo(target, durationMs) {
    clearInterval(progressRef.current);
    const start     = Date.now();
    let   fromValue = 0;
    setProgress(p => { fromValue = p; return p; }); // read current
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const frac    = Math.min(elapsed / durationMs, 1);
      const val     = Math.round(fromValue + (target - fromValue) * frac);
      setProgress(val);
      if (frac >= 1) clearInterval(progressRef.current);
    }, 60);
  }

  /* ── Main analysis orchestration ─────────────────────────────────────── */
  async function startAnalysis() {
    if (!file || phase === 'running') return;

    resetAnalysis();
    setPhase('running');
    setScanLabel('UPLOADING IMAGE...');

    /* ── Step 0: uploading (active immediately) ── */
    setStep(0, 'active');
    crawlProgressTo(18, 2000);

    /* ── Steps 1-3 timed locally ── */
    let accumulated = STEP_DURATIONS[0]; // after step 0 finishes

    [1, 2, 3].forEach((si) => {
      /* mark previous done, this one active */
      const t1 = setTimeout(() => {
        setStep(si - 1, 'done');
        setStep(si, 'active');
        const labels = ['ANALYZING IMAGE...', 'SEGMENTING PANELS...', 'CLASSIFYING DAMAGE...'];
        setScanLabel(labels[si - 1]);
        crawlProgressTo(20 + si * 18, STEP_DURATIONS[si]);
      }, accumulated);

      accumulated += STEP_DURATIONS[si];
      stepTimerRef.current.push(t1);
    });

    /* ── Fire the real request ── */
    try {
      const data = await apiDetect(file, token);

      /* ── Success: finish remaining steps, jump to 100% ── */
      clearInterval(progressRef.current);
      stepTimerRef.current.forEach(clearTimeout);
      stepTimerRef.current = [];

      setStepStatuses(STEPS.map((_, i) => (i < STEPS.length - 1 ? 'done' : 'active')));
      setStep(STEPS.length - 1, 'active');
      setScanLabel('COMPILING REPORT...');
      crawlProgressTo(95, 600);

      setTimeout(() => {
        setStep(STEPS.length - 1, 'done');
        setProgress(100);
        setScanLabel('ANALYSIS COMPLETE');
        setResult(data);
        setPhase('done');
      }, 800);

    } catch (err) {
      /* ── Error: stop everything, show banner ── */
      clearInterval(progressRef.current);
      stepTimerRef.current.forEach(clearTimeout);
      stepTimerRef.current = [];
      setPhase('error');
      setErrorMsg(err.message);
    }
  }

  /* ── Navigate to results page ─────────────────────────────────────────── */
  function goToResults() {
    navigate('/manual-entry', { state: result });
  }

  /* ── Derived UI values ────────────────────────────────────────────────── */
  const isRunning = phase === 'running';
  const isDone    = phase === 'done';
  const isError   = phase === 'error';

  return (
    <section className={styles.section} aria-label="Diagnostic upload">
      <div className={styles.container}>

        {/* ── Page Header ── */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Diagnostic Upload</h1>
          <p className={styles.pageSubtitle}>
            Deploying neural networks for structural integrity assessment. Upload
            high-resolution vehicle imagery for real-time part detection and{' '}
            <span className={styles.subtitleAccent}>damage profiling.</span>
          </p>
        </header>

        {/* ── Error banner ── */}
        {isError && (
          <div className={styles.errorBanner} role="alert">
            <IconWarning /> {errorMsg}
            <button type="button" className={styles.errorDismiss} onClick={resetAnalysis}>
              Try again
            </button>
          </div>
        )}

        {/* ── Two-Column Layout ── */}
        <div className={styles.columns}>

          {/* ─────────────── LEFT COLUMN ─────────────── */}
          <div className={styles.leftCol}>

            {/* Dropzone */}
            <div
              className={[
                styles.dropzone,
                isDragging  ? styles.dropzoneDragging : '',
                file        ? styles.dropzoneActive   : '',
                isRunning   ? styles.dropzoneLocked   : '',
              ].join(' ')}
              onDragOver={isRunning ? undefined : handleDragOver}
              onDragLeave={isRunning ? undefined : handleDragLeave}
              onDrop={isRunning ? undefined : handleDrop}
              role="button"
              tabIndex={isRunning ? -1 : 0}
              aria-label="File upload drop zone"
              onKeyDown={(e) => !isRunning && e.key === 'Enter' && fileInputRef.current?.click()}
              onClick={() => !isRunning && !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,image/heic"
                className={styles.fileInput}
                onChange={handleFileChange}
                aria-label="Choose vehicle image file"
                disabled={isRunning}
              />

              {/* If image selected — show thumbnail inside dropzone */}
              {previewUrl ? (
                <div className={styles.thumbWrap}>
                  <img src={previewUrl} alt="Selected vehicle" className={styles.thumb} />
                  <div className={styles.thumbOverlay}>
                    <p className={styles.thumbName}>{file.name}</p>
                    <p className={styles.thumbSize}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {!isRunning && !isDone && (
                      <button
                        type="button"
                        className={styles.changeBtn}
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        Change File
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.dropzoneInner}>
                  <div className={styles.uploadIconWrap}><IconCloudUpload /></div>
                  <p className={styles.dropzoneTitle}>Drop vehicle imagery here</p>
                  <p className={styles.dropzoneSub}>Support for JPEG, PNG, HEIC (Max 25 MB)</p>
                  <button
                    type="button"
                    className={styles.selectBtn}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Select Files
                  </button>
                </div>
              )}
            </div>

            {/* ── Start Analysis / View Results button ── */}
            {!isDone && (
              <button
                type="button"
                className={[
                  styles.startBtn,
                  !file || isRunning ? styles.startBtnDisabled : '',
                ].join(' ')}
                onClick={startAnalysis}
                disabled={!file || isRunning}
              >
                {isRunning ? (
                  <><span className={styles.spinnerRing} /> Analyzing…</>
                ) : (
                  <><IconScan /> Start Analysis</>
                )}
              </button>
            )}

            {isDone && (
              <button type="button" className={styles.viewResultsBtn} onClick={goToResults}>
                <IconArrow /> Continue: Vehicle Details
              </button>
            )}

            {/* Status chips */}
            <div className={styles.statusChips}>
              <div className={styles.chip}>
                <span className={`${styles.chipDot} ${styles.chipDotGreen}`} />
                <div>
                  <p className={styles.chipLabel}>AI ENGINE</p>
                  <p className={styles.chipValue}>V6.3.0 ACTIVE</p>
                </div>
              </div>
              <div className={styles.chip}>
                <span className={`${styles.chipDot} ${styles.chipDotBlue}`} />
                <div>
                  <p className={styles.chipLabel}>NEURAL LOAD</p>
                  <p className={styles.chipValue}>8.42 TFLOPS</p>
                </div>
              </div>
            </div>

          </div>{/* end leftCol */}

          {/* ─────────────── RIGHT COLUMN ─────────────── */}
          <div className={styles.rightCol}>
            <div className={styles.analysisPanel}>

              {/* Panel header */}
              <div className={styles.analysisPanelHeader}>
                <span className={styles.analysisPanelTitle}>LIVE_ANALYSIS_STREAM</span>
                <div className={styles.reconstructingBadge}>
                  <span className={styles.reconstructingDot} />
                  {isRunning ? 'PROCESSING' : isDone ? 'COMPLETE' : 'STANDBY'}
                </div>
              </div>

              {/* ── Scan / preview window ── */}
              <div className={styles.scanPreview}>
                {previewUrl ? (
                  /* Real uploaded image fills the window */
                  <img
                    src={previewUrl}
                    alt="Vehicle under analysis"
                    className={styles.scanImage}
                  />
                ) : (
                  /* Idle placeholder */
                  <div className={styles.scanOverlay}>
                    <div className={styles.scanBox} />
                    <p className={styles.scanLabel}>AWAITING INPUT</p>
                  </div>
                )}

                {/* Animated scan beam — only while running */}
                {isRunning && <div className={styles.scanBeam} />}

                {/* Overlay label on top of image */}
                {(isRunning || isDone) && previewUrl && (
                  <div className={styles.scanImageLabel}>
                    <span className={[
                      styles.scanLabelText,
                      isDone ? styles.scanLabelDone : '',
                    ].join(' ')}>
                      {scanLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Progress bar ── */}
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>
                  {isDone
                    ? 'ANALYSIS COMPLETE'
                    : isRunning
                      ? 'SCANNING FOR EXTERIOR DAMAGE...'
                      : 'AWAITING UPLOAD...'}
                </span>
                <span className={[
                  styles.progressPct,
                  isDone ? styles.progressPctDone : '',
                ].join(' ')}>
                  {progress}%
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={[
                    styles.progressFill,
                    isDone ? styles.progressFillDone : '',
                  ].join(' ')}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* ── Analysis steps ── */}
              <ul className={styles.steps} role="list">
                {STEPS.map((step, i) => {
                  const status = stepStatuses[i];
                  return (
                    <li key={step.id} className={styles.step}>
                      <span className={`${styles.stepIndicator} ${styles[`stepIndicator--${status}`]}`}>
                        {status === 'done'    && <IconCheck />}
                        {status === 'active'  && <span className={styles.spinnerDot} />}
                        {status === 'pending' && <span className={styles.pendingDot} />}
                      </span>
                      <span className={[
                        styles.stepLabel,
                        status === 'done'   ? styles.stepLabelDone   : '',
                        status === 'active' ? styles.stepLabelActive : '',
                      ].join(' ')}>
                        {step.label}
                      </span>
                      <span className={`${styles.stepStatus} ${styles[`stepStatus--${status}`]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </li>
                  );
                })}
              </ul>

            </div>
          </div>{/* end rightCol */}

        </div>
      </div>
    </section>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────────── */
function IconCloudUpload() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconScan() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
