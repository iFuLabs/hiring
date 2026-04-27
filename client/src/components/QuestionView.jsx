export default function QuestionView({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onPrev,
  onNext,
  onSubmit,
  answeredCount,
}) {
  if (!question) return null;

  const isLast = questionIndex === totalQuestions - 1;
  const isFirst = questionIndex === 0;

  return (
    <div className="question-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span className={`question-badge ${question.type}`}>
          {question.type === "scenario" ? "Scenario" : "MCQ"}
        </span>
        <span className="question-number">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </div>

      <p className="question-text">{question.question}</p>

      <div className="options-list" role="radiogroup" aria-label="Answer options">
        {Object.entries(question.options).map(([letter, text]) => (
          <button
            key={letter}
            className={`option-item${selectedAnswer === letter ? " selected" : ""}`}
            onClick={() => onSelectAnswer(question.id, letter)}
            role="radio"
            aria-checked={selectedAnswer === letter}
            type="button"
          >
            <span className="option-letter">{letter}</span>
            <span className="option-text">{text}</span>
          </button>
        ))}
      </div>

      <div className="question-nav">
        <button
          className="btn btn-outline"
          onClick={onPrev}
          disabled={isFirst}
          type="button"
        >
          ← Previous
        </button>

        <span style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
          {answeredCount} of {totalQuestions} answered
        </span>

        {isLast ? (
          <button
            className="btn btn-success"
            onClick={onSubmit}
            type="button"
          >
            Submit Test ✓
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onNext} type="button">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
