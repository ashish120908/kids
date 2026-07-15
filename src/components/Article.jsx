import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArticle } from '../data/articles'
import '../styles/ContentPage.css'

export default function Article() {
  const { slug } = useParams()
  const article = getArticle(slug)

  useEffect(() => {
    if (article) document.title = `${article.title} | KidLearn`
    return () => { document.title = 'KidLearn 🎓 | Fun Learning Games for Kids' }
  }, [article])

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
