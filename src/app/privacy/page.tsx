export default function Privacy() {
  return (
    <article className="container section">
      <p className="eyebrow">OWNER / LEGAL REVIEW REQUIRED</p>
      <h1>Privacy notice draft</h1>
      <div className="banner">
        This is an incomplete operational disclosure, not an approved privacy
        policy. Public customer onboarding must wait for owner and legal review.
      </div>
      <p>
        The local demo stores synthetic project information in your browser.
        Export it before clearing site storage. Hosted configuration uses
        Supabase for account and project records and private document storage.
        Stripe receives billing information through hosted checkout when billing
        is enabled.
      </p>
      <p>
        When enabled by the owner and authorized in the document review screen,
        selected PDF pages or images are sent to OpenAI for visual analysis.
        Requests disable response storage, but provider retention terms still
        apply. No analytics integration is configured. The owner must publish
        the business identity, privacy contact, retention periods, lawful
        processing grounds, subprocessors, international transfer arrangements,
        and access/export/deletion procedure before collecting customer data.
      </p>
    </article>
  );
}
