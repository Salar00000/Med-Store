import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';

function Probe() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <button onClick={() => login({ id: '1', name: 'Jane', email: 'jane@x.com' }, 'tok')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('stores the user and clears on logout', () => {
    localStorage.clear();
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('email').textContent).toBe('jane@x.com');
    fireEvent.click(screen.getByText('logout'));
    expect(screen.getByTestId('email').textContent).toBe('none');
  });
});
