import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArticle } from '../data/articles'
import '../styles/ContentPage.css'

// The document title is set centrally by <Seo>, which also handles the
// description, canonical and social tags for this route. This component used
// to set the title itself and reset it to the homepage title on unmount, which
// raced with Seo on navigation.
export default function Article() {
  const { slug } = useParams()
  const article = getArticle(slug)

  if (!article) {
    return (
      <div className="content-page">
        <h1>Article not found</h1>
        <p>Sorry, we couldn't find that article.</p>
        <Link to="/articles" className="content-back">← Back to Learning Corner</Link>
      </div>
    )
  }

  return (
    <div className="content-page">
      <h1>{article.emoji} {article.title}</h1>
      <p className="content-subtitle">{article.summary}</p>
      {article.body.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      <Link to="/articles" className="content-back">← Back to Learning Corner</Link>
    </div>
  )
}
