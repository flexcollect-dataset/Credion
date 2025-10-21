const API_BASE_URL = 'http://localhost:3001';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  currentPlan: 'Monthly' | 'Pay as you go';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    mobileNumber?: string;
    currentPlan?: string;
  };
  accessToken?: string;
  refreshToken?: string;
  redirectUrl?: string;
}

export interface ApiError {
  error: string;
  message: string;
  fieldErrors?: Record<string, { msg: string }>;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    // Convert plan names to backend format
    const planMapping = {
      'Monthly': 'monthly',
      'Pay as you go': 'pay_as_you_go'
    };

    const backendData = {
      ...userData,
      currentPlan: planMapping[userData.currentPlan],
      agreeTerms: true // Frontend form should include this
    };

    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    return this.request<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async checkMobile(mobileNumber: string): Promise<{ exists: boolean }> {
    return this.request<{ exists: boolean }>('/auth/check-mobile', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.request<{ status: string; message: string; timestamp: string }>('/health');
  }

  // Payment Methods
  async addPaymentMethod(paymentData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    isDefault: boolean;
    userId: number;
  }): Promise<{ success: boolean; message: string; paymentMethod: any }> {
    return this.request<{ success: boolean; message: string; paymentMethod: any }>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentMethods(userId: number): Promise<{ success: boolean; paymentMethods: any[] }> {
    return this.request<{ success: boolean; paymentMethods: any[] }>(`/payment-methods?userId=${userId}`);
  }

  async setDefaultPaymentMethod(paymentMethodId: string, userId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/payment-methods/${paymentMethodId}/set-default`, {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    });
  }

  async deletePaymentMethod(paymentMethodId: string, userId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
