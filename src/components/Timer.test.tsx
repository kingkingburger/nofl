import { render, screen } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer', () => {
  it('should render the lane name and initial time correctly', () => {
    render(<Timer lane="Top" initialTime={300} />);
    expect(screen.getByText('Top')).toBeInTheDocument();
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('should format the time correctly as MM:SS', () => {
    render(<Timer lane="Jungle" initialTime={59} />);
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  
});
