const CARDS = [
  {
    icon: '💊',
    title: 'Analgesics (Pain Relievers)',
    body: 'Analgesics are medicines that relieve pain without loss of consciousness. They range from OTC options like Aspirin and Acetaminophen to prescription drugs.<br><br><strong>Common Uses:</strong> Headaches, muscle aches, arthritis, dental pain.',
    link: 'https://medlineplus.gov/painrelievers.html',
    linkText: 'MedlinePlus',
  },
  {
    icon: '🦠',
    title: 'Antibiotics',
    body: 'Powerful medicines that fight bacterial infections and save lives when used properly.<br><br><strong>Important:</strong> Antibiotics do NOT work on viral infections like colds and flu.',
    link: 'https://www.cdc.gov/antibiotic-use/index.html',
    linkText: 'CDC Guidelines',
  },
  {
    icon: '🤧',
    title: 'Antihistamines',
    body: 'Drugs that treat allergy symptoms by blocking histamine, a chemical released by the immune system.<br><br><strong>Common Uses:</strong> Seasonal allergies, hives, insect bites.',
    link: 'https://www.mayoclinic.org/drugs-supplements/antihistamine-oral-route-parenteral-route-rectal-route/description/drg-20070373',
    linkText: 'Mayo Clinic',
  },
  {
    icon: '🌡️',
    title: 'Antipyretics',
    body: 'Substances that reduce fever by acting on the hypothalamus to lower body temperature.<br><br><strong>Examples:</strong> Ibuprofen, Paracetamol.',
    link: 'https://www.webmd.com/first-aid/fevers-causes-symptoms-treatments',
    linkText: 'WebMD Guide',
  },
  {
    icon: '🧴',
    title: 'Antiseptics',
    body: 'Antimicrobial substances applied to skin to reduce infection risk. Essential for first-aid kits.<br><br><strong>Common Uses:</strong> Cleaning cuts, scratches, surgical wounds.',
    link: 'https://www.healthline.com/health/what-is-antiseptic',
    linkText: 'Healthline',
  },
  {
    icon: '🍊',
    title: 'Vitamins & Supplements',
    body: 'Organic compounds needed in small quantities, mostly from food or supplementation.<br><br><strong>Key Types:</strong> Vitamin C (Immunity), Vitamin D (Bones), B12 (Energy).',
    link: 'https://ods.od.nih.gov/factsheets/list-all/',
    linkText: 'NIH Fact Sheets',
  },
];

export function MedicinesPage() {
  return (
    <div className="container med-page">
      <div className="search-hero fade-in">
        <div className="section-tag">✦ KNOWLEDGE BASE</div>
        <h2 style={{ marginTop: '1rem' }}>Medicine <span>Encyclopedia</span></h2>
        <p>Comprehensive guide to common medications, their uses, and trusted medical sources.</p>
        <form action="https://www.google.com/search" method="GET" target="_blank" className="search-box">
          <input type="text" name="q" placeholder="Search for a medicine (e.g., 'Amoxicillin side effects')..." required />
          <button type="submit">🔍 Search</button>
        </form>
      </div>

      <div className="info-grid">
        {CARDS.map((c, i) => (
          <div className="info-card fade-in stagger-1" key={c.title}>
            <div className="info-header">
              <div className="info-icon">{c.icon}</div>
              <div className="info-title">{c.title}</div>
            </div>
            <div className="info-body" dangerouslySetInnerHTML={{ __html: c.body }} />
            <a href={c.link} target="_blank" rel="noreferrer" className="source-link">{c.linkText} →</a>
          </div>
        ))}
      </div>
    </div>
  );
}
