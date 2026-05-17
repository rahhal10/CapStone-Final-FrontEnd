const PARTNERS = [
  'AutoZone', 'NAPA Auto', 'O\'Reilly', 'Midas', 'Jiffy Lube', 'Firestone',
];

import styles from './PartnersSection.module.css';

export default function PartnersSection() {
  return (
    <section className={styles.section} aria-label="Trusted partners">
      <div className={styles.container}>
        <p className={styles.label}>Trusted by repair networks across the region</p>
        <div className={styles.strip}>
          {PARTNERS.map((name) => (
            <span key={name} className={styles.partner}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
