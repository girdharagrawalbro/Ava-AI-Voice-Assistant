import axios from 'axios';
import { SupabaseService } from './supabase';
import type { 
  VoiceRecognitionResponse, 
  APIResponse,
  VoiceRequest,
  VoiceResponse,
  GeminiRequest,
  GeminiResponseData,
  TTSRequest,
  TTSResponse,
  ServiceStatus,
  Medication,
  MedicationResponse,
  Reminder,
  EmergencyContact,
  SymptomCheckRequest,
  SymptomCheckResponse,
  HealthTip,
  ReminderResponse,
  EmergencyContactResponse
} from '../types';

class APIService {
  private baseURL: string;
  private backendAvailable: boolean = true;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000') {
    this.baseURL = baseURL;
    this.setupAxios();
    this.checkBackendAvailability();
  }

  private async checkBackendAvailability() {
    try {
      await axios.get(`${this.baseURL}/status`, { timeout: 5000 });
      this.backendAvailable = true;
    } catch (error) {
      console.warn('Backend not available, using direct Supabase connection');
      this.backendAvailable = false;
    }
  }

  private setupAxios() {
    axios.defaults.timeout = 30000; // 30 seconds
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }

  private async handleRequest<T>(requestFn: () => Promise<any>): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error: any) {
      console.error('API request failed:', error);
      
      if (error.response) {
        // Server responded with error status
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.error || error.message}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Unable to connect to the backend server. Make sure the Python backend is running on port 8000.');
      } else {
        // Other error
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  // Core API Methods
  async checkServerStatus(): Promise<ServiceStatus> {
    const response: APIResponse<ServiceStatus> = await this.handleRequest(() =>
      axios.get(`${this.baseURL}/status`)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Status check failed');
  }

  async startVoiceRecognition(request: VoiceRequest = {}): Promise<VoiceResponse> {
    const response: APIResponse<VoiceResponse> = await this.handleRequest(() =>
      axios.post(`${this.baseURL}/voice`, {
        timeout: request.timeout || 10,
        phrase_time_limit: request.phrase_time_limit || 15
      })
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Voice recognition failed');
  }

  async getGeminiResponse(request: GeminiRequest): Promise<GeminiResponseData> {
    const response: APIResponse<GeminiResponseData> = await this.handleRequest(() =>
      axios.post(`${this.baseURL}/gemini`, request)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Gemini AI request failed');
  }

  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response: APIResponse<TTSResponse> = await this.handleRequest(() =>
      axios.post(`${this.baseURL}/murf`, request)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Text-to-speech conversion failed');
  }

  // Reminders
  async getReminders(): Promise<ReminderResponse[]> {
    try {
      const response: APIResponse<{ reminders: ReminderResponse[] }> = await this.handleRequest(() =>
        axios.get(`${this.baseURL}/api/reminders`)
      );
      
      if (response.success && response.data?.reminders) {
        return response.data.reminders;
      }
      
      throw new Error(response.error || 'Failed to get reminders');
    } catch (error) {
      console.warn('Backend API failed, trying Supabase fallback for reminders');
      try {
        const reminders = await SupabaseService.getReminders();
        return reminders as ReminderResponse[];
      } catch (supabaseError) {
        throw new Error('Failed to get reminders from both API and Supabase');
      }
    }
  }

  async addReminder(reminder: Reminder): Promise<ReminderResponse> {
    try {
      const response: APIResponse<{ reminder: ReminderResponse }> = await this.handleRequest(() =>
        axios.post(`${this.baseURL}/api/reminders`, reminder)
      );
      
      if (response.success && response.data?.reminder) {
        return response.data.reminder;
      }
      
      throw new Error(response.error || 'Failed to add reminder');
    } catch (error) {
      console.warn('Backend API failed, trying Supabase fallback for adding reminder');
      try {
        const newReminder = await SupabaseService.addReminder(reminder);
        return newReminder as ReminderResponse;
      } catch (supabaseError) {
        throw new Error('Failed to add reminder to both API and Supabase');
      }
    }
  }

async updateReminder(id: string, reminder: Reminder): Promise<ReminderResponse> {
  try {
    const response: APIResponse<{ reminder: ReminderResponse }> = await this.handleRequest(() =>
      axios.put(`${this.baseURL}/api/reminders/${id}`, reminder)
    );
    
    if (response.success && response.data?.reminder) {
      return response.data.reminder;
    }
    
    throw new Error(response.error || 'Failed to update reminder');
  } catch (error) {
    console.warn('Backend API failed, trying Supabase fallback for updating reminder');
    try {
      const updatedReminder = await SupabaseService.updateReminder(id, reminder);
      return updatedReminder as ReminderResponse;
    } catch (supabaseError) {
      throw new Error('Failed to update reminder in both API and Supabase');
    }
  }
}

async deleteReminder(id: string): Promise<void> {
  try {
    const response: APIResponse = await this.handleRequest(() =>
      axios.delete(`${this.baseURL}/api/reminders/${id}`)
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete reminder');
    }
  } catch (error) {
    console.warn('Backend API failed, trying Supabase fallback for deleting reminder');
    try {
      await SupabaseService.deleteReminder(id);
    } catch (supabaseError) {
      throw new Error('Failed to delete reminder from both API and Supabase');
    }
  }
}

  
  // Medication Management
  async getMedications(): Promise<MedicationResponse[]> {
    try {
      const response: APIResponse<{ medications: MedicationResponse[] }> = await this.handleRequest(() =>
        axios.get(`${this.baseURL}/api/medications`)
      );
      
      if (response.success && response.data?.medications) {
        return response.data.medications;
      }
      
      throw new Error(response.error || 'Failed to get medications');
    } catch (error) {
      console.warn('Backend API failed, trying Supabase fallback for medications');
      try {
        const medications = await SupabaseService.getMedications();
        return medications as MedicationResponse[];
      } catch (supabaseError) {
        throw new Error('Failed to get medications from both API and Supabase');
      }
    }
  }

async addMedication(medication: Medication): Promise<MedicationResponse> {
  try {
    const response: APIResponse<{ medication: MedicationResponse }> = await this.handleRequest(() =>
      axios.post(`${this.baseURL}/api/medications`, medication)
    );
    
    if (response.success && response.data?.medication) {
      return response.data.medication;
    }
    
    throw new Error(response.error || 'Failed to add medication');
  } catch (error) {
    console.warn('Backend API failed, trying Supabase fallback for adding medication');
    try {
      const newMedication = await SupabaseService.addMedication(medication);
      return newMedication as MedicationResponse;
    } catch (supabaseError) {
      throw new Error('Failed to add medication to both API and Supabase');
    }
  }
}

async updateMedication(id: string, medication: Medication): Promise<MedicationResponse> {
  try {
    const response: APIResponse<{ medication: MedicationResponse }> = await this.handleRequest(() =>
      axios.put(`${this.baseURL}/api/medications/${id}`, medication)
    );
    
    if (response.success && response.data?.medication) {
      return response.data.medication;
    }
    
    throw new Error(response.error || 'Failed to update medication');
  } catch (error) {
    console.warn('Backend API failed, trying Supabase fallback for updating medication');
    try {
      const updatedMedication = await SupabaseService.updateMedication(id, medication);
      return updatedMedication as MedicationResponse;
    } catch (supabaseError) {
      throw new Error('Failed to update medication in both API and Supabase');
    }
  }
}

async deleteMedication(id: string): Promise<void> {
  try {
    const response: APIResponse = await this.handleRequest(() =>
      axios.delete(`${this.baseURL}/api/medications/${id}`)
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete medication');
    }
  } catch (error) {
    console.warn('Backend API failed, trying Supabase fallback for deleting medication');
    try {
      await SupabaseService.deleteMedication(id);
    } catch (supabaseError) {
      throw new Error('Failed to delete medication from both API and Supabase');
    }
  }
}

  // Emergency Contacts
  async getEmergencyContacts(): Promise<EmergencyContactResponse[]> {
    try {
      const response: APIResponse<{ contacts: EmergencyContactResponse[] }> = await this.handleRequest(() =>
        axios.get(`${this.baseURL}/api/emergency-contacts`)
      );
      
      if (response.success && response.data?.contacts) {
        return response.data.contacts;
      }
      
      throw new Error(response.error || 'Failed to get emergency contacts');
    } catch (error) {
      console.warn('Backend API failed, trying Supabase fallback for emergency contacts');
      try {
        const contacts = await SupabaseService.getEmergencyContacts();
        return contacts as EmergencyContactResponse[];
      } catch (supabaseError) {
        throw new Error('Failed to get emergency contacts from both API and Supabase');
      }
    }
  }

  async addEmergencyContact(contact: EmergencyContact): Promise<EmergencyContactResponse> {
    try {
      const response: APIResponse<{ contact: EmergencyContactResponse }> = await this.handleRequest(() =>
        axios.post(`${this.baseURL}/api/emergency-contacts`, contact)
      );
      
      if (response.success && response.data?.contact) {
        return response.data.contact;
      }
      
      throw new Error(response.error || 'Failed to add emergency contact');
    } catch (error) {
      console.warn('Backend API failed, trying Supabase fallback for adding emergency contact');
      try {
        const newContact = await SupabaseService.addEmergencyContact(contact);
        return newContact as EmergencyContactResponse;
      } catch (supabaseError) {
        throw new Error('Failed to add emergency contact to both API and Supabase');
      }
    }
  }

  // Health Data
  async checkSymptoms(request: SymptomCheckRequest): Promise<SymptomCheckResponse> {
    const response: APIResponse<SymptomCheckResponse> = await this.handleRequest(() =>
      axios.post(`${this.baseURL}/api/symptom-check`, request)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to analyze symptoms');
  }

  async getHealthTips(count: number = 3): Promise<HealthTip[]> {
    try {
      const response: APIResponse<{ tips: HealthTip[] }> = await this.handleRequest(() =>
        axios.get(`${this.baseURL}/api/health-tips`, {
          params: { count }
        })
      );
      
      if (response.success && response.data?.tips) {
        return response.data.tips;
      }
      
      throw new Error(response.error || 'Failed to get health tips');
    } catch (error) {
      console.warn('Backend API failed, trying Supabase fallback for health tips');
      try {
        const tips = await SupabaseService.getHealthTips(count);
        return tips as HealthTip[];
      } catch (supabaseError) {
        throw new Error('Failed to get health tips from both API and Supabase');
      }
    }
  }

  // Audio Management
  getAudioUrl(filename: string): string {
    // Ensure we have a proper filename
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    const audioUrl = `${this.baseURL}/audio/${cleanFilename}`;
    console.log('🔊 Generated audio URL:', audioUrl);
    return audioUrl;
  }

  async downloadAudio(url: string): Promise<Blob> {
    return this.handleRequest(async () => {
      const response = await axios.get(url, {
        responseType: 'blob'
      });
      return response.data;
    });
  }

  async cleanupAudioFiles(): Promise<void> {
    const response: APIResponse = await this.handleRequest(() =>
      axios.post(`${this.baseURL}/cleanup`)
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Cleanup failed');
    }
  }

  async stopAudioPlayback(): Promise<void> {
    const response: APIResponse = await this.handleRequest(() =>
      axios.post(`${this.baseURL}/stop-audio`)
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Stop audio failed');
    }
  }

  async getAvailableVoices(): Promise<any> {
    const response: APIResponse = await this.handleRequest(() =>
      axios.get(`${this.baseURL}/voices`)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get voices');
  }

  // Legacy compatibility methods
  async stopVoiceRecognition(): Promise<VoiceRecognitionResponse> {
    try {
      await this.handleRequest(() => axios.post(`${this.baseURL}/stop-audio`));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async checkServerHealth(): Promise<{ status: string; message: string }> {
    try {
      await this.handleRequest(() => axios.get(`${this.baseURL}/`));
      return { status: 'healthy', message: 'Server is running' };
    } catch (error: any) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

// Create singleton instance
export const apiService = new APIService();
export default APIService;