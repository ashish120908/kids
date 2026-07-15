import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/ContentPage.css'

export default function Contact() {
  return (
    <div className="content-page">
      <h1>Contact Us ✉️</h1>
      <p className="content-subtitle">We'd love to hear from parents, teachers, and kids!</p>

      <p>
        KidLearn is created and maintained by <strong>Ashish Kumar</strong>. Whether you have a
        question, a suggestion for a new game, a bug to report, or a privacy concern, we welcome your
        message.
      </p>

      <h2>How to Reach Us</h2>
      <p>
        The best way to contact us is by email. We read every message and try to reply within a few
        working days.
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{' '}
          {/* TODO: replace with your real contact email before publishing */}
          <a href="mailto:hello@kidlearn.in">hello@kidlearn.in</a>
        </li>
        <li>
          <strong>Facebook:</strong>{' '}
          <a href="https://www.facebook.com/profile.php?id=61579655686045" target="_blank" rel="noopener noreferrer">
            KidLearn on Facebook
          </a>
        </li>
        <li>
          <strong>Instagram:</strong>{' '}
          <a href="https://instagram.com/me_shutterbug" target="_blank" rel="noopener noreferrer">
            @me_shutterbug
          </a>
        </li>
      </ul>

      <div className="content-note">
        <strong>For parents:</strong> If you have a question about your child's privacy or want any
        locally-stored data cleared, please mention "Privacy" in your subject line so we can help
        quickly. You can also read our <Link to="/privacy">Privacy Policy</Link>.
      </div>

      <h2>Feedback &amp; Ideas</h2>
      <p>
        KidLearn grows because of ideas from families. If your child wishes there were a game about a
        certain topic — times tables tricks, geography, science, a new language — tell us. Many of
        our games started as a suggestion from a parent or teacher.
      </p>

      <Link to="/" className="content-back">← Back to Home</Link>
    </div>
  )
}
