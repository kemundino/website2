import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FeedbackData {
  rating: number;
  comment: string;
  itemName: string;
  timestamp: string;
  orderId: string;
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);

  useEffect(() => {
    // Load feedbacks from localStorage
    const storedFeedbacks = JSON.parse(localStorage.getItem('bitebuzz_feedback') || '{}');
    const feedbackList: FeedbackData[] = Object.entries(storedFeedbacks).map(([key, data]: [string, any]) => ({
      ...data,
      orderId: key
    }));
    
    // Sort by timestamp (newest first)
    feedbackList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFeedbacks(feedbackList);
  }, []);

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach(feedback => {
      distribution[feedback.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const getSentimentIcon = (rating: number) => {
    if (rating >= 4) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rating <= 2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const distribution = getRatingDistribution();
  const averageRating = getAverageRating();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Feedbacks</p>
                <p className="text-2xl font-bold text-blue-800">{feedbacks.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Average Rating</p>
                <p className="text-2xl font-bold text-green-800">{averageRating}</p>
              </div>
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Positive Rate</p>
                <p className="text-2xl font-bold text-purple-800">
                  {feedbacks.length > 0 ? Math.round((distribution[5] + distribution[4]) / feedbacks.length * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{rating}</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500"
                    style={{
                      width: feedbacks.length > 0 ? `${(distribution[rating as keyof typeof distribution] / feedbacks.length) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {distribution[rating as keyof typeof distribution]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Customer Feedbacks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No customer feedbacks yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{feedback.itemName}</span>
                      {getSentimentIcon(feedback.rating)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(feedback.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  
                  {feedback.comment && (
                    <p className="text-sm text-gray-600 italic mt-2">
                      "{feedback.comment}"
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    Order ID: {feedback.orderId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackManagement;
