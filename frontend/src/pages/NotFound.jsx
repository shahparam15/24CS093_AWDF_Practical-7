import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page-container not-found-page">
      <div className="section-container">
        <div className="not-found-card">
          <div className="error-code">404</div>
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-description">
            The requested page does not exist.
          </p>
          <Link to="/" className="back-home-button">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
