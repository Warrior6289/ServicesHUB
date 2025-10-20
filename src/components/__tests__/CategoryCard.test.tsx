import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryCard } from '../CategoryCard';

describe('CategoryCard', () => {
  it('renders title and allows hover', async () => {
    render(<CategoryCard title="Plumber" description="Fix leaks" rating={4.5} />);
    const title = screen.getByText('Plumber');
    expect(title).toBeInTheDocument();
    await userEvent.hover(title);
  });
});


