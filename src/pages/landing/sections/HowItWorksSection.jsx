const STEPS = [
  {
    number: '01',
    color: 'blue',
    title: 'Upload Your Photo',
    description:
      'Take a clear photo of the damaged area and upload it directly from your device. Supports JPEG, PNG, and HEIC formats.',
  },
  {
    number: '02',
    color: 'orange',
    title: 'AI Scans the Damage',
    description:
      'Our neural network analyzes every pixel — identifying dents, scratches, panel deformation, and paint damage with high precision.',
  },
  {
    number: '03',
    color: 'green',
    title: 'Get Your Report',
    description:
      'Receive a detailed breakdown of damaged parts, repair recommendations, and transparent cost estimates — instantly.',
  },
];

import styles from './HowItWorksSection.module.css';

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className={styles.section} aria-label="How it works">
      <div className={styles.container}>

        <header className={styles.header}>
          <p className={styles.eyebrow}>The Process</p>
          <h2 className={styles.title}>How It Works</h2>
          <p className={styles.subtitle}>
            Three simple steps from photo to full diagnostic report.
          </p>
        </header>

        <div className={styles.grid}>
          {STEPS.map(({ number, color, title, description }) => (
            <article key={number} className={`${styles.card} ${styles[`card--${color}`]}`}>
              <span className={styles.stepNumber}>{number}</span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{description}</p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
