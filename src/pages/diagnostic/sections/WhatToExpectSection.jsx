import styles from './WhatToExpectSection.module.css';

const BENEFITS = [
  {
    icon: <IconDamage />,
    title: 'Full Damage Report',
    description:
      'A clear visual summary of every damaged area on your vehicle, including location, size, and overall condition.',
  },
  {
    icon: <IconParts />,
    title: 'Part Recommendations',
    description:
      'A curated list of the parts your car needs, matched to your exact make and model — no guesswork required.',
  },
  {
    icon: <IconPrice />,
    title: 'Repair Cost Estimate',
    description:
      'Transparent pricing breakdowns for parts and labor so you know exactly what to expect before visiting any shop.',
  },
  {
    icon: <IconShop />,
    title: 'Trusted Shop Matches',
    description:
      'Nearby certified repair centers recommended based on your damage profile and location.',
  },
];

export default function WhatToExpectSection() {
  return (
    <section className={styles.section} aria-label="What you will receive">
      <div className={styles.container}>

        <header className={styles.header}>
          <p className={styles.eyebrow}>After Your Upload</p>
          <h2 className={styles.title}>Here's What You'll Get</h2>
          <p className={styles.subtitle}>
            Once we analyze your images, your personalized diagnostic results
            will be ready in seconds.
          </p>
        </header>

        <div className={styles.grid}>
          {BENEFITS.map(({ icon, title, description }) => (
            <article key={title} className={styles.card}>
              <div className={styles.iconWrap} aria-hidden="true">
                {icon}
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{description}</p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

function IconDamage() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      <path d="M11 8v3l2 2"/>
    </svg>
  );
}
function IconParts() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
function IconPrice() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function IconShop() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
