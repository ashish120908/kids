import React from 'react'
import { getStars } from '../utils/gameHelpers'

export default function StarRating({ score, total }) {
  const stars = getStars(score, total);
  return (
    <div className="star-rating">
      {[1, 2, 3].map(i => (
        <span key={i} className={`star ${i <= stars ? 'star-filled' : 'star-empty'}`}>
          {i <= stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}
