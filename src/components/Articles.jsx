import React from 'react'
import { Link } from 'react-router-dom'
import { articles } from '../data/articles'
import '../styles/ContentPage.css'

export default function Articles() {
  return (
    <div className="content-page">
      <h1>Learning Corner 📚</h1>
      <p className="content-subtitle">
        Free guides for parents and teachers on helping children learn and grow.
      </p>

      <p>
        Welcome to the KidLearn Learning Corner — a small library of friendly, practical articles
        about how young children learn maths, reading, shapes, colours, and healthy habits. Every
        article is written for busy parents and teachers who want simple, research-informed ideas
        they can use today. Explore below, and pair the reading with our free games.
      </p>

      <div className="articles-grid">
        {articles.map((a) => (
          <Link key={a.slug} to={`/articles/${a.slug}`} className="article-card">
            <div className="article-emoji">{a.emoji}</div>
            <h3>{a.title}</h3>
            <p>{a.summary}</p>
          </Link>
        ))}
      </div>

      <Link to="/" className="content-back">← Back to Home</Link>
    </div>
  )
}
