export default function ProgressBar({
  totalQuestions,
  currentIndex,
  answers,
  questions,
  onJump,
}) {
  return (
    <div className="progress-bar" role="navigation" aria-label="Question navigation">
      {Array.from({ length: totalQuestions }, (_, i) => {
        const qId = questions[i]?.id;
        const isAnswered = qId && answers[qId] != null;
        const isCurrent = i === currentIndex;

        let className = "progress-dot";
        if (isAnswered) className += " answered";
        if (isCurrent) className += " current";

        return (
          <button
            key={i}
            className={className}
            onClick={() => onJump(i)}
            aria-label={`Question ${i + 1}${isAnswered ? " (answered)" : ""}${isCurrent ? " (current)" : ""}`}
            aria-current={isCurrent ? "step" : undefined}
            title={`Question ${i + 1}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
