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
const mockReviews: Review[] = []

const reviewSubscribers = new Set<(reviews: Review[]) => void>()

const notifySubscribers = () => {
  reviewSubscribers.forEach(callback => callback([...mockReviews]))
}

export function useReviews() {
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

export default useReviews
