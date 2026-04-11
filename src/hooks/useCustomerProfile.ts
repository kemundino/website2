import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContextFirebase'

export interface CustomerProfile {
  id: string
  name: string
  email: string
  phone: string
  addresses: string[]
  loyaltyPoints: number
  memberSince: string
  totalOrders: number
}

// Mock database for customer profiles
let mockProfiles: Record<string, CustomerProfile> = {
  'user@demo.com': {
    id: 'CUST001',
    name: 'John Doe',
    email: 'user@demo.com',
    phone: '+1 (555) 123-4567',
    addresses: ['123 Main St, Apt 4B, New York, NY 10001', '456 Business Rd, Suite 100, New York, NY 10002'],
    loyaltyPoints: 450,
    memberSince: '2024-01-15T10:00:00Z',
    totalOrders: 12
  },
  'admin@demo.com': {
    id: 'CUST002',
    name: 'Admin',
    email: 'admin@demo.com',
    phone: '+1 (555) 999-0000',
    addresses: ['Admin Office, HQ'],
    loyaltyPoints: 0,
    memberSince: '2024-01-01T10:00:00Z',
    totalOrders: 0
  }
}

const profileSubscribers = new Set<(profiles: Record<string, CustomerProfile>) => void>()

const notifySubscribers = () => {
  profileSubscribers.forEach(callback => callback({ ...mockProfiles }))
}

export const useCustomerProfile = () => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Record<string, CustomerProfile>>(mockProfiles)

  useEffect(() => {
    const handleUpdate = (updatedProfiles: Record<string, CustomerProfile>) => {
      setProfiles(updatedProfiles)
    }
    profileSubscribers.add(handleUpdate)

    // Ensure profile exists for the current user
    if (user && !mockProfiles[user.email]) {
      mockProfiles[user.email] = {
        id: `CUST${Date.now()}`,
        name: user.name,
        email: user.email,
        phone: '',
        addresses: [],
        loyaltyPoints: 0,
        memberSince: new Date().toISOString(),
        totalOrders: 0
      }
      notifySubscribers()
    }

    return () => {
      profileSubscribers.delete(handleUpdate)
    }
  }, [user])

  const currentProfile = user ? profiles[user.email] : null

  const updateProfile = (updates: Partial<CustomerProfile>) => {
    if (!user || !mockProfiles[user.email]) return false
    
    mockProfiles[user.email] = {
      ...mockProfiles[user.email],
      ...updates
    }
    notifySubscribers()
    return true
  }

  const addLoyaltyPoints = (points: number) => {
    if (!user || !mockProfiles[user.email]) return false
    
    mockProfiles[user.email].loyaltyPoints += points
    mockProfiles[user.email].totalOrders += 1
    notifySubscribers()
    return true
  }

  const addAddress = (address: string) => {
    if (!user || !mockProfiles[user.email]) return false
    
    if (!mockProfiles[user.email].addresses.includes(address)) {
      mockProfiles[user.email].addresses.push(address)
      notifySubscribers()
    }
    return true
  }

  return {
    profile: currentProfile,
    updateProfile,
    addLoyaltyPoints,
    addAddress
  }
}
