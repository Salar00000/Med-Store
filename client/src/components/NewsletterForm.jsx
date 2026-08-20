import { useState } from 'react';
import { subscribeNewsletter } from '../api/newsletter.js';
import { useToast } from '../context/ToastContext.jsx';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const showToast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await subscribeNewsletter(email);
      showToast('Welcome! Check your inbox soon.');
      setEmail('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not subscribe', 'error');
    }
  };

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <input
        type="email"
        className="newsletter-input"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary">Subscribe 🚀</button>
    </form>
  );
}
