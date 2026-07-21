export default function HomePage() {
  return (
    <>
      <section className="page-heading">
        <h1>Dashboard</h1>
        <p>
          Super Web Shell hosts domain mini apps behind a shared navigation,
          auth context, and operational wrapper. This home route stays in the
          shell while mini apps mount only on their configured routes.
        </p>
      </section>

      <section className="home-grid" aria-label="Shell overview">
        <article className="metric-card">
          <span>Registered apps</span>
          <strong>1</strong>
        </article>
        <article className="metric-card">
          <span>Auth mode</span>
          <strong>SSO</strong>
        </article>
        <article className="metric-card">
          <span>Runtime</span>
          <strong>Qiankun</strong>
        </article>
      </section>

      <section className="status-panel">
        <div className="page-heading">
          <h1>Shell boundary</h1>
          <p>
            The shell owns routing, layout, and launch context. The mini app
            receives user context and token through Qiankun props instead of a
            URL query string.
          </p>
        </div>
      </section>
    </>
  );
}
