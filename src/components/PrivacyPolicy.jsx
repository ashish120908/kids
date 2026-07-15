import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/ContentPage.css'

export default function PrivacyPolicy() {
  return (
    <div className="content-page">
      <h1>Privacy Policy 🔒</h1>
      <p className="content-subtitle">How KidLearn protects children and families.</p>
      <p className="content-updated">Last updated: 15 July 2026</p>

      <p>
        KidLearn ("we", "our", "the app") is a free educational website designed for children
        under 13 and the parents and teachers who guide them. Protecting children's privacy is our
        highest priority. This policy explains, in plain language, what information we do and do not
        collect, and how we comply with the Children's Online Privacy Protection Act (COPPA) and
        similar laws.
      </p>

      <div className="content-note">
        <strong>Short version:</strong> KidLearn does not ask children for their name, email,
        photo, or any personal detail. Game progress is stored only on your own device. We never
        sell data, and we never show interest-based (behavioural) advertising to children.
      </div>

      <h2>1. Information We Do NOT Collect</h2>
      <p>
        KidLearn does not require any account, sign-up, or login. We do not ask for or store a
        child's real name, email address, phone number, home address, photograph, voice recording,
        or precise location. Any nickname or avatar a child chooses inside the app is saved only in
        that browser's local storage on the device — it never reaches our servers and we cannot see it.
      </p>

      <h2>2. Information Stored Locally on Your Device</h2>
      <p>
        To let children continue where they left off, the app saves game scores, stars, and the
        chosen nickname or avatar using your browser's <em>localStorage</em>. This data stays on the
        device, is not transmitted to us, and can be cleared at any time by clearing your browser's
        site data.
      </p>

      <h2>3. Analytics</h2>
      <p>
        We use Google Analytics 4 to understand how many people visit and which games are popular,
        so we can improve the app. We configure it in a privacy-protective, COPPA-friendly way:
        advertising personalisation is disabled, Google Signals is turned off, and restricted data
        processing is enabled. This means we look only at anonymous, aggregate usage — never at
        individual children.
      </p>

      <h2>4. Advertising</h2>
      <p>
        KidLearn may display advertising from Google to keep the app free. Because our audience
        includes children, we treat the entire site as directed to children and request only
        non-personalised (contextual) ads. We do not permit interest-based or behavioural
        advertising, remarketing, or ad targeting based on a child's activity. Ads are chosen from
        the general context of an educational page, not from any profile of the user.
      </p>

      <h2>5. Parental Rights</h2>
      <p>
        Because we do not collect personal information from children, there is normally nothing to
        review or delete on our side. If you believe your child has somehow provided personal
        information to us, please contact us (see our <Link to="/contact">Contact page</Link>) and we
        will promptly delete it. Parents may also clear all locally-stored data at any time through
        their browser settings.
      </p>

      <h2>6. Third-Party Links</h2>
      <p>
        Our footer links to our social pages (Facebook and Instagram). Those services have their own
        privacy policies, which we do not control. We recommend that a parent supervises any child
        who leaves KidLearn to visit an external site.
      </p>

      <h2>7. Data Security</h2>
      <p>
        KidLearn is served over a secure HTTPS connection. Since we do not collect or store personal
        data on our servers, there is no personal information for us to expose or lose.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Any changes will be posted on this page with a
        new "Last updated" date. Continued use of the app after a change means you accept the
        updated policy.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy or your child's privacy? Please reach us through our{' '}
        <Link to="/contact">Contact page</Link>. We aim to respond within a few working days.
      </p>

      <Link to="/" className="content-back">← Back to Home</Link>
    </div>
  )
}
