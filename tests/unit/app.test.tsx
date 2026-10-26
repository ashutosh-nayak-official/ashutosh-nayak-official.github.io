import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/app/App';

describe('App', () => {
  it('renders the name as the single h1', () => {
    const { getAllByRole } = render(<App locale="en" />);
    const h1 = getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toContain('Ashutosh Nayak');
  });
});
