import { useState } from "react";

export default function RegistrationForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit(form);
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: 8 }}>Candidate Registration</h2>
      <p style={{ color: "var(--text-light)", marginBottom: 24 }}>
        Please fill in your details to begin the assessment. You will have 30
        minutes to complete 20 questions.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="fullName"
            className="form-input"
            type="text"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={e => handleChange("fullName", e.target.value)}
            autoComplete="name"
          />
          {errors.fullName && (
            <div className="error-message" style={{ marginTop: 6 }}>
              {errors.fullName}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            id="email"
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && (
            <div className="error-message" style={{ marginTop: 6 }}>
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number (optional)</label>
          <input
            id="phone"
            className="form-input"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={e => handleChange("phone", e.target.value)}
            autoComplete="tel"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={isLoading}
        >
          {isLoading ? "Starting..." : "Continue to Assessment →"}
        </button>
      </form>
    </div>
  );
}
