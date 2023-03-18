import { render } from '@testing-library/react';
import { describe } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the component', () => {
    render(<App />);
  });
});
