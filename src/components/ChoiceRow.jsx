import React from 'react'
import CandyButton from './CandyButton'

/**
 * The row of candy answer buttons shared by every multiple-choice game.
 * Keeps the correct/wrong highlighting rule in exactly one place.
 *
 * `options` may be primitives (numbers, '>', 'CAT') or objects — pass
 * `labelOf` / `keyOf` when they're objects.
 */
export default function ChoiceRow({
  options,
  correctKey,
  statusFor,
  onChoose,
  keyOf = (c) => c,
  labelOf,
}) {
  const label = labelOf || keyOf;
  return (
    <div className="candy-buttons-container">
      {options.map((choice, idx) => (
        <CandyButton
          key={keyOf(choice)}
          value={label(choice)}
          index={idx}
          status={statusFor(choice, correctKey)}
          onClick={() => onChoose(choice)}
        />
      ))}
    </div>
  );
}
