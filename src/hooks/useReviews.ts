import { useState, useEffect } from 'react'

export interface Review {
  id: string
  orderId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

// Mock database for reviews
let mockReviews: Review[] = [
  {
    id: 'REV001',
    orderId: 'ORD001',
    customerName: 'John Doe',
    rating: 5,
    comment: 'Best pizza in town! Arrived hot and fresh.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'REV002',
    orderId: 'ORD002',
    customerName: 'Jane Smith',
    rating: 4,
    comment: 'The burger was great, but the fries were a bit cold.',
    createdAt: new Date(Date.now() - 43200000).toISOString()
  }
]

const reviewSubscribers = new Set<(reviews: Review[]) => void>()

const notifySubscribers = () => {
  reviewSubscribers.forEach(callback => callback([...mockReviews]))
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)

  useEffect(() => {
    const handleUpdate = (updatedReviews: Review[]) => {
      setReviews(updatedReviews)
    }
    reviewSubscribers.add(handleUpdate)
    return () => {
      reviewSubscribers.delete(handleUpdate)
    }
  }, [])

  const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `REV${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    mockReviews.unshift(newReview)
    notifySubscribers()
    return newReview
  }

  const getReviewsByOrderId = (orderId: string) => {
    return reviews.find(r => r.orderId === orderId)
  }

  return {
    reviews,
    addReview,
    getReviewsByOrderId
  }
}
