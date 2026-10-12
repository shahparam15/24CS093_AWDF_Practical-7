import { useState, useEffect } from "react";

const DEFAULT_GITHUB_USERNAME = "shahparam15";

function Projects() {
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsername, setActiveUsername] = useState(DEFAULT_GITHUB_USERNAME);
  const [usernameInput, setUsernameInput] = useState(DEFAULT_GITHUB_USERNAME);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!activeUsername.trim()) return;

    const controller = new AbortController();

    async function fetchRepositories() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.github.com/users/${encodeURIComponent(activeUsername)}/repos?sort=updated&per_page=30`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? `User @${activeUsername} not found on GitHub (404).`
              : `GitHub API error: ${response.statusText}`
          );
        }

        const data = await response.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to fetch repositories.");
          setRepos([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepositories();

    return () => {
      controller.abort();
    };
  }, [activeUsername]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setActiveUsername(usernameInput.trim());
      setSearchTerm("");
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="page-container projects-page">
      <section className="portfolio-section">
        <div className="section-container">
          <div className="section-header-block">
            <h2 className="section-heading">GitHub API Projects</h2>
            <p className="section-subtext">
              External REST API integration showcasing real public repositories.
            </p>
          </div>

          <div className="api-config-bar">
            <form onSubmit={handleUsernameSubmit} className="username-form">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="GitHub username..."
                className="config-input"
              />
              <button type="submit" className="config-button">
                Load Repositories
              </button>
            </form>
          </div>

          {!error && (
            <div className="search-filter-card">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter repositories by name..."
                className="search-input"
              />
            </div>
          )}

          <div className="api-results-area">
            {isLoading ? (
              <div className="loading-spinner-box">
                <div className="loading-spinner"></div>
                <p>Fetching repositories...</p>
              </div>
            ) : error ? (
              <div className="error-card">
                <p className="error-text">⚠️ {error}</p>
                <button
                  type="button"
                  onClick={() => setActiveUsername(DEFAULT_GITHUB_USERNAME)}
                  className="retry-button"
                >
                  Reset
                </button>
              </div>
            ) : filteredRepos.length === 0 ? (
              <p className="empty-repos-text">No repositories match your filter.</p>
            ) : (
              <div className="repo-grid">
                {filteredRepos.map((repo) => (
                  <article key={repo.id} className="repo-card">
                    <h3 className="repo-name">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="repo-link"
                      >
                        {repo.name}
                      </a>
                    </h3>
                    <p className="repo-description">
                      {repo.description || "No description provided."}
                    </p>
                    <div className="repo-meta-footer">
                      <span>⭐ {repo.stargazers_count}</span>
                      {repo.language && <span>{repo.language}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Projects;
