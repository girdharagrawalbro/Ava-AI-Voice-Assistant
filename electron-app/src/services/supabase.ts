import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nmqzuwzpqekdxefzmvzf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcXp1d3pwcWVrZHhlZnptdnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDM2MDQsImV4cCI6MjA2OTAxOTYwNH0.EHvO6nidzLjJIk0O07bZqxTNR_gh2Sxg1HiUsrMuAUY'

// Default user ID from environment
const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000001'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service for direct Supabase operations
export class SupabaseService {
  static async checkConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (error) throw error
      return { status: 'connected', data }
    } catch (error: any) {
      console.error('Supabase connection error:', error)
      return { status: 'error', error: error?.message || 'Unknown error' }
    }
  }

  // Medications
  static async getMedications(userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching medications:', error)
      throw error
    }
  }

  static async addMedication(medication: any, userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{ ...medication, user_id: userId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding medication:', error)
      throw error
    }
  }

  static async updateMedication(id: string, medication: any) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update(medication)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating medication:', error)
      throw error
    }
  }

  static async deleteMedication(id: string) {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting medication:', error)
      throw error
    }
  }

  // Reminders
  static async getReminders(userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          medications (
            name,
            dosage
          )
        `)
        .eq('user_id', userId)
        .order('reminder_time', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reminders:', error)
      throw error
    }
  }

  static async addReminder(reminder: any, userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{ ...reminder, user_id: userId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding reminder:', error)
      throw error
    }
  }

  static async updateReminder(id: string, reminder: any) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(reminder)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating reminder:', error)
      throw error
    }
  }

  static async deleteReminder(id: string) {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting reminder:', error)
      throw error
    }
  }

  // Emergency Contacts
  static async getEmergencyContacts(userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching emergency contacts:', error)
      throw error
    }
  }

  static async addEmergencyContact(contact: any, userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([{ ...contact, user_id: userId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding emergency contact:', error)
      throw error
    }
  }

  static async updateEmergencyContact(id: string, contact: any) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(contact)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating emergency contact:', error)
      throw error
    }
  }

  static async deleteEmergencyContact(id: string) {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting emergency contact:', error)
      throw error
    }
  }

  // Health Tips
  static async getHealthTips(limit: number = 3) {
    try {
      const { data, error } = await supabase
        .from('health_tips')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching health tips:', error)
      throw error
    }
  }

  static async getUserHealthTips(userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('user_health_tips')
        .select(`
          *,
          health_tips (
            tip_content,
            category,
            priority,
            source
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user health tips:', error)
      throw error
    }
  }

  static async addUserHealthTip(tipId: string, userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('user_health_tips')
        .insert([{ user_id: userId, health_tip_id: tipId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding user health tip:', error)
      throw error
    }
  }

  // Health Records
  static async getHealthRecords(userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching health records:', error)
      throw error
    }
  }

  static async addHealthRecord(record: any, userId: string = DEFAULT_USER_ID) {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .insert([{ ...record, user_id: userId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding health record:', error)
      throw error
    }
  }

  // Symptom Check - This will still go through the backend API
  static async checkSymptoms(_symptoms: any) {
    // This should go through the backend API as it involves AI processing
    throw new Error('Use API service for symptom checking')
  }
}

export default SupabaseService
