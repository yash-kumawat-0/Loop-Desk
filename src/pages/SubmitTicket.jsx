import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../components/CustomSelect';

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
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'category') {
      setForm((prev) => ({ ...prev, category: value, subject: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.category.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Navigate to the submitting page, pass form data via route state
    navigate('/submitting', { state: { form } });
  }

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-8">
      <div className="w-full max-w-3xl animate-fade-in-up">

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Name & Email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          {/* Category & Subject row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Category
              </label>
              <CustomSelect
                options={CATEGORIES.map(c => ({ label: c, value: c }))}
                value={form.category}
                onChange={(val) => handleChange({ target: { name: 'category', value: val } })}
                placeholder="Select a category"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Subject
              </label>
              {!form.category ? (
                <div className="form-input text-text-muted cursor-not-allowed opacity-50">
                  Select category first
                </div>
              ) : form.category === 'Other' ? (
                <div className="animate-slide-in">
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
              ) : (
                <div className="animate-slide-in">
                  <CustomSelect
                    options={(SUBJECT_MAP[form.category] || []).map(s => ({ label: s, value: s }))}
                    value={form.subject}
                    onChange={(val) => handleChange({ target: { name: 'subject', value: val } })}
                    placeholder="Select a subject"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Message — full width */}
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
              rows={6}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full py-3.5 text-base"
            id="submit-ticket-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Ticket
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-5">
          Our AI will analyze and route your ticket to the right team automatically.
        </p>
      </div>
    </div>
  );
}
