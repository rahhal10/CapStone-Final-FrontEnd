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

const STEP_DURATIONS = [1800, 2200, 2400, 0, 0];
const STATUS_LABELS  = { done: 'SUCCESS', active: 'ACTIVE', pending: 'PENDING' };

/* ── Component ────────────────────────────────────────────────────────────── */
export default function UploadSection() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  /* ── Upload state ────────────────────────────────────────────────────── */
  const [isDragging, setIsDragging] = useState(false);
  const [file,       setFile]       = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  /* ── Analysis state ──────────────────────────────────────────────────── */
  const [phase,       setPhase]       = useState('idle');
  const [progress,    setProgress]    = useState(0);
  const [stepStatuses, setStepStatuses] = useState(STEPS.map(() => 'pending'));
  const [scanLabel,   setScanLabel]   = useState('AWAITING INPUT');
  const [result,      setResult]      = useState(null);
  const [errorMsg,    setErrorMsg]    = useState('');

  const progressRef  = useRef(null);
  const stepTimerRef = useRef([]);

  /* ── Camera modal state ──────────────────────────────────────────────── */
  const [cameraOpen,  setCameraOpen]  = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [mirrored,    setMirrored]    = useState(false); // front cam = mirror
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* ── Object URL cleanup ──────────────────────────────────────────────── */
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  /* ── Camera stream cleanup on unmount ────────────────────────────────── */
  useEffect(() => () => stopStream(), []);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  /* ── Open camera (getUserMedia) ──────────────────────────────────────── */
  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Your browser does not support camera access. Please use a modern browser.');
      setCameraOpen(true);
      return;
    }
    setCameraError('');
    setCameraOpen(true);

    try {
      /* Prefer rear camera on mobile; fall back to any camera */
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      /* Detect if front camera ended up being used (mirror it) */
      const track    = stream.getVideoTracks()[0];
      const settings = track.getSettings?.() ?? {};
      setMirrored(settings.facingMode === 'user');

      /* Attach stream to <video> once the modal has rendered */
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);

    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'  ? 'Camera permission denied. Please allow camera access and try again.' :
        err.name === 'NotFoundError'    ? 'No camera found on this device.' :
        err.name === 'NotReadableError' ? 'Camera is in use by another app.' :
        `Camera error: ${err.message}`;
      setCameraError(msg);
    }
  }

  function closeCamera() {
    stopStream();
    setCameraOpen(false);
    setCameraError('');
    setMirrored(false);
  }

  /* ── Snap a frame from the video and turn it into a File ─────────────── */
  function capturePhoto() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    /* If front cam is mirrored, un-mirror before saving */
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (!blob) return;
      const f = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      closeCamera();
      pickFile(f);          // same flow as file-picker
    }, 'image/jpeg', 0.92);
  }

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
    e.target.value = '';
  }

  /* ── Reset analysis ──────────────────────────────────────────────────── */
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

  function setStep(idx, status) {
    setStepStatuses(prev => prev.map((s, i) => (i === idx ? status : s)));
  }

  function crawlProgressTo(target, durationMs) {
    clearInterval(progressRef.current);
    const start = Date.now();
    let fromValue = 0;
    setProgress(p => { fromValue = p; return p; });
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

    setStep(0, 'active');
    crawlProgressTo(18, 2000);

    let accumulated = STEP_DURATIONS[0];
    [1, 2, 3].forEach((si) => {
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

    try {
      const data = await apiDetect(file, token);

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
      clearInterval(progressRef.current);
      stepTimerRef.current.forEach(clearTimeout);
      stepTimerRef.current = [];
      setPhase('error');
      setErrorMsg(err.message);
    }
  }

  function goToResults() {
    navigate('/manual-entry', { state: result });
  }

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
                isDragging ? styles.dropzoneDragging : '',
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
              {/* Hidden file-picker input */}
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

              {/* If image selected — show thumbnail */}
              {previewUrl ? (
                <div className={styles.thumbWrap}>
                  <img src={previewUrl} alt="Selected vehicle" className={styles.thumb} />
                  <div className={styles.thumbOverlay}>
                    <p className={styles.thumbName}>{file.name}</p>
                    <p className={styles.thumbSize}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {!isRunning && !isDone && (
                      <div className={styles.thumbBtnRow}>
                        <button
                          type="button"
                          className={styles.changeBtn}
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          <IconFolder /> Change File
                        </button>
                        <button
                          type="button"
                          className={`${styles.changeBtn} ${styles.changeBtnCamera}`}
                          onClick={(e) => { e.stopPropagation(); openCamera(); }}
                        >
                          <IconCamera /> Retake Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.dropzoneInner}>
                  <div className={styles.uploadIconWrap}><IconCloudUpload /></div>
                  <p className={styles.dropzoneTitle}>Drop vehicle imagery here</p>
                  <p className={styles.dropzoneSub}>Support for JPEG, PNG, HEIC (Max 25 MB)</p>
                  <div className={styles.dropzoneBtnRow}>
                    <button
                      type="button"
                      className={styles.selectBtn}
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      <IconFolder /> Select File
                    </button>
                    <span className={styles.dropzoneDivider}>or</span>
                    <button
                      type="button"
                      className={`${styles.selectBtn} ${styles.cameraBtn}`}
                      onClick={(e) => { e.stopPropagation(); openCamera(); }}
                    >
                      <IconCamera /> Take Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Start / View Results buttons ── */}
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

              <div className={styles.analysisPanelHeader}>
                <span className={styles.analysisPanelTitle}>LIVE_ANALYSIS_STREAM</span>
                <div className={styles.reconstructingBadge}>
                  <span className={styles.reconstructingDot} />
                  {isRunning ? 'PROCESSING' : isDone ? 'COMPLETE' : 'STANDBY'}
                </div>
              </div>

              <div className={styles.scanPreview}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vehicle under analysis"
                    className={styles.scanImage}
                  />
                ) : (
                  <div className={styles.scanOverlay}>
                    <div className={styles.scanBox} />
                    <p className={styles.scanLabel}>AWAITING INPUT</p>
                  </div>
                )}

                {isRunning && <div className={styles.scanBeam} />}

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

      {/* ═══════════════════════════════════════════════
          CAMERA MODAL (getUserMedia live feed)
          ═══════════════════════════════════════════════ */}
      {cameraOpen && (
        <div className={styles.cameraModal} role="dialog" aria-modal="true" aria-label="Camera capture">

          <div className={styles.cameraBox}>

            {/* Header */}
            <div className={styles.cameraHeader}>
              <div className={styles.cameraHeaderLeft}>
                <span className={styles.cameraDot} />
                <span className={styles.cameraTitle}>LIVE CAMERA FEED</span>
              </div>
              <button
                type="button"
                className={styles.cameraClose}
                onClick={closeCamera}
                aria-label="Close camera"
              >
                <IconX />
              </button>
            </div>

            {/* Video / Error */}
            {cameraError ? (
              <div className={styles.cameraErrorBox}>
                <IconWarning />
                <p className={styles.cameraErrorMsg}>{cameraError}</p>
                <button type="button" className={styles.cameraRetryBtn} onClick={closeCamera}>
                  Close
                </button>
              </div>
            ) : (
              <div className={styles.cameraViewport}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`${styles.cameraVideo} ${mirrored ? styles.cameraVideoMirror : ''}`}
                />
                {/* Scan frame overlay */}
                <div className={styles.cameraFrame}>
                  <span className={`${styles.cameraCorner} ${styles.cameraCornerTL}`} />
                  <span className={`${styles.cameraCorner} ${styles.cameraCornerTR}`} />
                  <span className={`${styles.cameraCorner} ${styles.cameraCornerBL}`} />
                  <span className={`${styles.cameraCorner} ${styles.cameraCornerBR}`} />
                </div>
                <p className={styles.cameraHint}>Position the vehicle in frame, then capture</p>
              </div>
            )}

            {/* Hidden canvas used to extract the frame */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Actions */}
            {!cameraError && (
              <div className={styles.cameraActions}>
                <button type="button" className={styles.cameraCancelBtn} onClick={closeCamera}>
                  Cancel
                </button>
                <button type="button" className={styles.cameraCaptureBtn} onClick={capturePhoto}>
                  <span className={styles.cameraShutter} />
                  Capture
                </button>
              </div>
            )}

          </div>
        </div>
      )}

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
function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
