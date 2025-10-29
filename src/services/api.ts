const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    
    // Get auth token from localStorage
    const token = localStorage.getItem('accessToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || data.error || 'An error occurred');
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



  // Matter API methods
  async createMatter(data: { matterName: string; description?: string | null }) {
    return this.request<{ success: boolean; message: string; matter: any }>('/api/matters/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMatters() {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return this.request<{ success: boolean; matters: any[] }>(`/api/matters/list?t=${timestamp}`);
  }

  async searchMatters(query: string) {
    return this.request<{ success: boolean; matters: any[] }>(`/api/matters/search?query=${encodeURIComponent(query)}`);
  }

  async getMatter(matterId: number) {
    return this.request<{ success: boolean; matter: any }>(`/api/matters/${matterId}`);
  }

  async updateMatter(matterId: number, data: { matterName?: string; description?: string; status?: string }) {
    return this.request<{ success: boolean; message: string; matter: any }>(`/api/matters/${matterId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMatter(matterId: number) {
    return this.request<{ success: boolean; message: string }>(`/api/matters/${matterId}`, {
      method: 'DELETE'
    });
  }

  // UserReport API methods
  async getUserReports() {
    return this.request<{ success: boolean; reports: any[] }>('/api/userreports');
  }

  async getUserReportsByMatter(matterId: number) {
    return this.request<{ success: boolean; reports: any[] }>(`/api/userreports/matter/${matterId}`);
  }

  // Search functionality - Direct call to Australian Business Register API
  async searchABNByName(searchTerm: string): Promise<{ success: boolean; results: any[] }> {
    const ABN_GUID = '250e9f55-f46e-4104-b0df-774fa28cff97';
    const url = `https://abr.business.gov.au/json/MatchingNames.aspx?name=${encodeURIComponent(searchTerm)}&maxResults=10&guid=${ABN_GUID}`;
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      // Extract JSON from JSONP response
      const match = text.match(/callback\((.*)\)/);
      if (!match) {
        throw new Error('Invalid ABN lookup response format');
      }
      
      const data = JSON.parse(match[1]);
      const results = data.Names || [];
      
      return {
        success: true,
        results: results.map((result: any) => ({
          Abn: result.Abn,
          Name: result.Name || 'Unknown',
          entityStatus: 'Available via ABN lookup',
          entityType: 'Available via ABN lookup',
          address: 'Available via ABN lookup'
        }))
      };
    } catch (error) {
      console.error('Error searching ABN by name:', error);
      return {
        success: false,
        results: []
      };
    }
  }

  // Payment Methods API
  async getPaymentMethods(userId?: number) {
    try {
      const user = userId ? { userId } : JSON.parse(localStorage.getItem('user') || '{}');
      const response = await this.request<{ success: boolean; paymentMethods: any[] }>(`/payment-methods?userId=${user.userId}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentMethod: any) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const paymentData = {
        ...paymentMethod,
        userId: user.userId
      };
      const response = await this.request('/payment-methods', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
      return response;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async deletePaymentMethod(id: number) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await this.request(`/payment-methods/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: user.userId })
      });
      return response;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(id: number) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await this.request(`/payment-methods/${id}/set-default`, {
        method: 'PUT',
        body: JSON.stringify({ userId: user.userId })
      });
      return response;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  // Reports API
  async getReports(): Promise<any[]> {
    return this.request(`/reports`);
  }

  async getReportDetails(reportId: number): Promise<any> {
    return this.request(`/reports/${reportId}`);
  }

  // Report Creation API
  async createReport(reportData: any): Promise<any> {
    return this.request('/api/create-report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Send Reports via Email API
  async sendReports(email: string, reports: any[], totalPrice: number, matterName?: string): Promise<any> {
    return this.request('/api/send-reports', {
      method: 'POST',
      body: JSON.stringify({ email, reports, totalPrice, matterName }),
    });
  }

  // PDF Generation API
  async generatePDF(reportId: number, reportType: string): Promise<{ blob: Blob; filename: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ reportId, reportType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${reportType.toLowerCase()}-report-${reportId}.pdf`; // fallback
      
      console.log('🔍 Content-Disposition header:', contentDisposition);
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
          console.log('✅ Extracted filename from header:', filename);
        } else {
          console.log('❌ Could not extract filename from header');
        }
      } else {
        console.log('❌ No Content-Disposition header found');
      }
      
      console.log('📄 Final filename being used:', filename);

      const blob = await response.blob();
      return { blob, filename };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;