function Footer({
  email = "24cs093@charusat.edu.in",
  name = "Param Shah",
  year = "2026",
}) {
  return (
    <footer className="portfolio-footer">
      <div className="section-container footer-container">
        <h2 className="footer-heading">Contact & Connect</h2>
        <p className="footer-description">
          Feel free to reach out for inquiries, collaboration opportunities, or academic discussions.
        </p>
        <div className="footer-contact-info">
          <span className="contact-label">Email:</span>{" "}
          <a href={`mailto:${email}`} className="footer-email-link">
            {email}
          </a>
        </div>
        <hr className="footer-divider" />
        <p className="footer-copyright">
          &copy; {year} {name}. All rights reserved. | ITUE301 Practical 6: Full Stack Integration (React + Node + MongoDB)
        </p>
      </div>
    </footer>
  );
}

export default Footer;
