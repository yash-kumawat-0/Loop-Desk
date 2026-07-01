import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFunctionRun } from "lemma-sdk/react";
import client from "../api/client";

/**
 * SubmitTicket — main landing page for customers.
 * Features a knowledge base search bar and ticket submission form.
 * No category dropdown — the AI triage agent classifies automatically.
 */
const SUBJECT_MAP = {
  "Account": [
    "Changing your email address",
    "Inviting and removing team members",
    "Changing a member's role",
    "Deleting a workspace",
    "Merging or transferring workspaces",
    "Two-factor authentication (2FA)",
    "Closing a personal account vs. closing a workspace"
  ],
  "Troubleshooting": [
    "I can't log in",
    "A board or card disappeared",
    "Automations aren't running",
    "Slack integration isn't posting messages",
    "The app is slow or unresponsive",
    "File uploads are failing",
    "I was charged but my plan didn't change"
  ],
  "Features": [
    "Boards and tasks",
    "Workspaces and teams",
    "Automations",
    "Integrations",
    "Notifications",
    "Mobile and offline access",
    "Data export"
  ],
  "Pricing": [
    "Free plan",
    "Starter plan",
    "Pro plan",
    "Business plan",
    "Changing plans",
    "Payment methods",
    "Free trial"
  ],
  "Refund and Policy": [
    "Cancelling a subscription",
    "Refund eligibility",
    "How to request a refund",
    "Annual plan cancellations",
    "Disputes and chargebacks",
    "Data after cancellation"
  ],
  "Other": []
};

const CATEGORIES = [
  "Account",
  "Troubleshooting",
  "Features",
  "Pricing",
  "Refund and Policy",
  "Other"
];

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { start: submitTicket } = useFunctionRun({ client, functionName: "customer_panel_submit_ticket" });

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'category') {
      setForm((prev) => ({ ...prev, category: value, subject: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.category.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitTicket({
        source: 'form',
        customer_name: form.name,
        customer_contact: form.email,
        category: form.category,
        subject: form.subject,
        body: form.message,
      });

      console.log('Submit response:', response);

      // Navigate to confirmation with ticket ID
      const ticketData = response?.output_data || {};
      const ticketId = 
        ticketData.ticket_id || 
        ticketData.ticket?.id || 
        ticketData.id || 
        ticketData.record_id || 
        'unknown';
      navigate(`/confirmation?ticketId=${encodeURIComponent(ticketId)}`);
    } catch (err) {
      console.error('Submit failed:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit your ticket. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-violet/10 border border-accent-violet/20 mb-4">
            <svg className="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs font-medium text-accent-violet">Support Center</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            How can we help?
          </h1>
          <p className="text-text-secondary text-sm">
            Search our knowledge base or submit a support ticket below.
          </p>
        </div>

        {/* Ticket form */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Submit a Ticket
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 stagger-children">
            {/* Name & Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            {form.category && form.category !== 'Other' && (
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="" disabled>Select a subject</option>
                  {SUBJECT_MAP[form.category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {form.category === 'Other' && (
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Briefly describe your issue"
                  className="form-input"
                  required
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Please describe your issue in detail..."
                className="form-input form-textarea"
                rows={5}
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
                id="submit-ticket-btn"
              >
                {submitting ? (
                  <>
                    <div className="spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-xs text-text-muted text-center mt-4">
            Our AI will analyze and route your ticket to the right team automatically.
          </p>
        </div>

        {/* Track ticket link */}
        <div className="text-center mt-6">
          <a
            href="/track"
            className="text-sm text-text-muted hover:text-accent-violet transition-colors"
          >
            Already submitted a ticket? <span className="underline">Track it here →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
