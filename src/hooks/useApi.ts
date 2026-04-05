import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:5000/api'

// Generic API function
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  return response.json()
}

// React Query hooks for API calls
export const useApiGet = <T>(endpoint: string, queryKey: string[]) => {
  return useQuery({
    queryKey,
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useApiMutation = <T>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data?: T) => 
      apiRequest(endpoint, {
        method,
        body: data ? JSON.stringify(data) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    },
  })
}
