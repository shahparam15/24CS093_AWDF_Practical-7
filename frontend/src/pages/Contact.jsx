import { useState } from "react";

function Contact({ studentEmail = "24cs093@charusat.edu.in" }) {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  const MAX_CHARS = 300;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (senderName.trim() && senderEmail.trim() && message.trim()) {
      setSubmittedData({
        name: senderName.trim(),
        email: senderEmail.trim(),
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  return (
    <div className="page-container contact-page">
      <section className="portfolio-section">
        <div className="section-container">
          <div className="section-header-block">
            <h2 className="section-heading">Contact &amp; Feedback</h2>
            <p className="section-subtext">
              Controlled form component demonstrating React state management.
            </p>
          </div>

          <div className="contact-layout-grid">
            <div className="form-card">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name..."
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="Your email..."
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    rows="3"
                    maxLength={MAX_CHARS}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message..."
                    className="form-input form-textarea"
                    required
                  />
                  <div className="char-counter">
                    {message.length} / {MAX_CHARS} characters
                  </div>
                </div>

                <button type="submit" className="submit-task-btn">
                  Send Message
                </button>
              </form>

              {submittedData && (
                <div className="submission-notice">
                  ✓ Form state captured locally for demonstration ({submittedData.timestamp}).
                </div>
              )}
            </div>

            <div className="preview-card">
              <h3 className="card-title">Real-Time State Preview</h3>
              <p>Name: <strong>{senderName || "—"}</strong></p>
              <p>Email: <strong>{senderEmail || "—"}</strong></p>
              <p>Message: <em>{message || "—"}</em></p>
              <div className="direct-email-box">
                Direct academic contact:{" "}
                <a href={`mailto:${studentEmail}`} className="direct-email-link">
                  {studentEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
