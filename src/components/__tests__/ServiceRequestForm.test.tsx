import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceRequestForm from '../../components/ServiceRequestForm';
import { AuthProvider } from '../../lib/auth';

// Mock the auth context
const mockAuthContext = {
  user: {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'buyer',
    status: 'active',
    emailVerified: true,
    phone: '+1234567890',
    avatar: '',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  accessToken: 'mock-token',
  refreshToken: 'mock-refresh-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshAuth: vi.fn(),
  clearError: vi.fn(),
  updateUser: vi.fn()
};

// Mock API client
vi.mock('../../api/client', () => ({
  serviceRequestApi: {
    createInstant: vi.fn(),
    createScheduled: vi.fn()
  }
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMap: () => ({
    setView: vi.fn(),
    flyTo: vi.fn()
  })
}));

vi.mock('leaflet', () => ({
  icon: vi.fn(() => ({})),
  Icon: vi.fn(() => ({})),
  Default: {
    iconUrl: '',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider value={mockAuthContext}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ServiceRequestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders instant request form by default', () => {
    renderWithProviders(<ServiceRequestForm />);
    
    expect(screen.getByText('Request Service')).toBeInTheDocument();
    expect(screen.getByLabelText('Service Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
    expect(screen.getByText('Instant Service')).toBeInTheDocument();
  });

  it('switches between instant and scheduled request types', () => {
    renderWithProviders(<ServiceRequestForm />);
    
    // Should show instant form by default
    expect(screen.getByText('Instant Service')).toBeInTheDocument();
    expect(screen.queryByLabelText('Scheduled Date')).not.toBeInTheDocument();
    
    // Switch to scheduled
    fireEvent.click(screen.getByText('Scheduled Service'));
    expect(screen.getByText('Scheduled Service')).toBeInTheDocument();
    expect(screen.getByLabelText('Scheduled Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Scheduled Time')).toBeInTheDocument();
    
    // Switch back to instant
    fireEvent.click(screen.getByText('Instant Service'));
    expect(screen.getByText('Instant Service')).toBeInTheDocument();
    expect(screen.queryByLabelText('Scheduled Date')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProviders(<ServiceRequestForm />);
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please select a service category')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Price must be at least $1')).toBeInTheDocument();
    });
  });

  it('validates price range', async () => {
    renderWithProviders(<ServiceRequestForm />);
    
    const priceInput = screen.getByLabelText('Price ($)');
    fireEvent.change(priceInput, { target: { value: '0' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Price must be at least $1')).toBeInTheDocument();
    });
  });

  it('validates maximum price', async () => {
    renderWithProviders(<ServiceRequestForm />);
    
    const priceInput = screen.getByLabelText('Price ($)');
    fireEvent.change(priceInput, { target: { value: '10001' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Price cannot exceed $10,000')).toBeInTheDocument();
    });
  });

  it('validates description length', async () => {
    renderWithProviders(<ServiceRequestForm />);
    
    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'Short' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('validates broadcast radius for instant requests', async () => {
    renderWithProviders(<ServiceRequestForm />);
    
    const radiusInput = screen.getByLabelText('Broadcast Radius (km)');
    fireEvent.change(radiusInput, { target: { value: '0' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Broadcast radius must be between 1 and 100 km')).toBeInTheDocument();
    });
  });

  it('validates scheduled date for scheduled requests', async () => {
    renderWithProviders(<ServiceRequestForm />);
    
    // Switch to scheduled request
    fireEvent.click(screen.getByText('Scheduled Service'));
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Scheduled date is required')).toBeInTheDocument();
    });
  });

  it('validates scheduled date is in the future', async () => {
    renderWithProviders(<ServiceRequestForm />);
    
    // Switch to scheduled request
    fireEvent.click(screen.getByText('Scheduled Service'));
    
    const dateInput = screen.getByLabelText('Scheduled Date');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fireEvent.change(dateInput, { target: { value: yesterday.toISOString().split('T')[0] } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Scheduled date must be in the future')).toBeInTheDocument();
    });
  });

  it('submits instant request with valid data', async () => {
    const { serviceRequestApi } = await import('../../api/client');
    const mockCreateInstant = vi.mocked(serviceRequestApi.createInstant);
    mockCreateInstant.mockResolvedValue({
      success: true,
      data: { _id: 'request123' },
      message: 'Request created successfully'
    });

    renderWithProviders(<ServiceRequestForm />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('Broadcast Radius (km)'), { target: { value: '10' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateInstant).toHaveBeenCalledWith({
        category: 'Plumbing',
        description: 'Fix leaky faucet in kitchen',
        price: 150,
        broadcastRadius: 10,
        location: expect.any(Object)
      });
    });
  });

  it('submits scheduled request with valid data', async () => {
    const { serviceRequestApi } = await import('../../api/client');
    const mockCreateScheduled = vi.mocked(serviceRequestApi.createScheduled);
    mockCreateScheduled.mockResolvedValue({
      success: true,
      data: { _id: 'request123' },
      message: 'Request created successfully'
    });

    renderWithProviders(<ServiceRequestForm />);
    
    // Switch to scheduled request
    fireEvent.click(screen.getByText('Scheduled Service'));
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Electrical' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Install ceiling fan in living room' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '200' } });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(screen.getByLabelText('Scheduled Date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
    fireEvent.change(screen.getByLabelText('Scheduled Time'), { target: { value: '14:00' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateScheduled).toHaveBeenCalledWith({
        category: 'Electrical',
        description: 'Install ceiling fan in living room',
        price: 200,
        scheduledDate: expect.any(String),
        scheduledTime: '14:00',
        location: expect.any(Object)
      });
    });
  });

  it('handles API errors gracefully', async () => {
    const { serviceRequestApi } = await import('../../api/client');
    const mockCreateInstant = vi.mocked(serviceRequestApi.createInstant);
    mockCreateInstant.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<ServiceRequestForm />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create service request')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const { serviceRequestApi } = await import('../../api/client');
    const mockCreateInstant = vi.mocked(serviceRequestApi.createInstant);
    
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockCreateInstant.mockReturnValue(promise);

    renderWithProviders(<ServiceRequestForm />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Creating Request...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Resolve the promise
    resolvePromise!({
      success: true,
      data: { _id: 'request123' },
      message: 'Request created successfully'
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Creating Request...')).not.toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    const { serviceRequestApi } = await import('../../api/client');
    const mockCreateInstant = vi.mocked(serviceRequestApi.createInstant);
    mockCreateInstant.mockResolvedValue({
      success: true,
      data: { _id: 'request123' },
      message: 'Request created successfully'
    });

    renderWithProviders(<ServiceRequestForm />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Form should be reset
      expect(screen.getByLabelText('Service Category')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Price ($)')).toHaveValue('');
    });
  });
});
