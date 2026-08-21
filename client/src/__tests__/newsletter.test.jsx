import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterForm from '../components/NewsletterForm.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import * as newsletterApi from '../api/newsletter.js';

vi.mock('../api/newsletter.js', () => ({
  subscribeNewsletter: vi.fn(),
}));

describe('NewsletterForm', () => {
  it('subscribes and shows a toast', async () => {
    newsletterApi.subscribeNewsletter.mockResolvedValue({ subscribed: true });
    render(<ToastProvider><NewsletterForm /></ToastProvider>);
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), { target: { value: 'a@b.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => expect(newsletterApi.subscribeNewsletter).toHaveBeenCalledWith('a@b.com'));
  });
});
