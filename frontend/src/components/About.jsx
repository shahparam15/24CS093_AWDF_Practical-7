function About({
  name = "Param Shah",
  bio = "Enthusiastic Computer Science Engineering student passionate about full-stack engineering, React, Express, Mongoose, and MongoDB integration.",
  details = {
    rollNo: "24CS093",
    department: "Computer Science & Engineering",
    institution: "CSPIT, Charusat University",
  },
}) {
  return (
    <section id="about" className="portfolio-section about-section">
      <div className="section-container">
        <h2 className="section-heading">About Me</h2>
        <div className="about-card">
          <p className="about-bio">
            Hello! I am <strong>{name}</strong>. {bio}
          </p>
          {details && (
            <div className="about-details-grid">
              {details.rollNo && (
                <div className="detail-item">
                  <span className="detail-label">Roll Number:</span>
                  <span className="detail-value">{details.rollNo}</span>
                </div>
              )}
              {details.department && (
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{details.department}</span>
                </div>
              )}
              {details.institution && (
                <div className="detail-item">
                  <span className="detail-label">Institution:</span>
                  <span className="detail-value">{details.institution}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default About;
