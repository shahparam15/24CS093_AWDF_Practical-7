function Skills({ skillList = [] }) {
  return (
    <section id="skills" className="portfolio-section skills-section">
      <div className="section-container">
        <h2 className="section-heading">Full-Stack Tech Stack</h2>
        {skillList && skillList.length > 0 ? (
          <div className="skills-grid">
            {skillList.map((skill, index) => (
              <div
                key={typeof skill === "string" ? skill : `skill-${index}`}
                className="skill-badge"
              >
                <span className="skill-dot"></span>
                <span className="skill-name">{skill}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No skills currently listed.</p>
        )}
      </div>
    </section>
  );
}

export default Skills;
