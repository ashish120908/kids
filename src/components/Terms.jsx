import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/ContentPage.css'

export default function Terms() {
  return (
    <div className="content-page">
      <h1>Terms of Use 📋</h1>
      <p className="content-subtitle">The simple rules for using KidLearn.</p>
      <p className="content-updated">Last updated: 15 July 2026</p>

      <p>
        Welcome to KidLearn. By using this website you agree to these Terms of Use. If you are a
        child, please read these with a parent, teacher, or guardian.
      </p>

      <h2>1. What KidLearn Is</h2>
      <p>
        KidLearn is a free collection of educational games and activities for children, covering
        maths, spelling, shapes, colours, memory, clock reading, and more. It is provided for
        learning and entertainment. It is not a substitute for a formal school curriculum.
      </p>

      <h2>2. Free to Use</h2>
      <p>
        KidLearn is free. You do not need to pay, subscribe, or create an account. We ask only that
        you use the app for its intended purpose — helping children learn and have fun.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Copy, resell, or redistribute the app or its content without permission.</li>
        <li>Attempt to hack, disrupt, or overload the website.</li>
        <li>Use automated tools to scrape or misuse the site.</li>
        <li>Remove or tamper with any copyright or attribution notices.</li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>
        The KidLearn name, design, game logic, and original content are the property of the creator.
        You may use the app for personal and educational purposes. Emojis and open web fonts used in
        the app belong to their respective owners.
      </p>

      <h2>5. Advertising</h2>
      <p>
        The app may display advertising to remain free. We aim to show only family-appropriate,
        non-personalised ads. Advertisements are supplied by third parties, and we are not
        responsible for the content of external sites reached through an ad.
      </p>

      <h2>6. No Warranty</h2>
      <p>
        KidLearn is provided "as is". While we work hard to keep it accurate, fun, and available, we
        do not guarantee that it will always be error-free or uninterrupted. Educational content is
        offered in good faith but may contain occasional mistakes.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the extent permitted by law, the creator of KidLearn is not liable for any loss or damage
        arising from the use of, or inability to use, the app.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms occasionally. The latest version will always be on this page. Your
        continued use of KidLearn means you accept the current terms.
      </p>

      <h2>9. Contact</h2>
      <p>
        Have a question about these terms? Visit our <Link to="/contact">Contact page</Link>.
      </p>

      <Link to="/" className="content-back">← Back to Home</Link>
    </div>
  )
}
