import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp, MessageSquare, ThumbsUp, Calendar, Filter } from 'lucide-react';
import { useProviderData } from '../hooks/useProviderData';

// Sample reviews data
const sampleReviews = [
  {
    id: '1',
    patientName: 'Sarah J.',
    rating: 5,
    date: '2024-12-10',
    text: 'Absolutely wonderful experience! Dr. Mitchell took the time to listen to all my concerns and explained everything clearly. The staff was friendly and the office was clean and modern. Highly recommend!',
    service: 'Annual Wellness Exam',
    helpful: 12,
    responded: true,
    response: 'Thank you so much for your kind words, Sarah! We are so glad you had a positive experience.',
  },
  {
    id: '2',
    patientName: 'Michael C.',
    rating: 5,
    date: '2024-12-08',
    text: 'Great follow-up appointment. The doctor remembered my previous visit and we picked up right where we left off. Very efficient and professional.',
    service: 'Follow-Up Visit',
    helpful: 8,
    responded: false,
  },
  {
    id: '3',
    patientName: 'Emily R.',
    rating: 4,
    date: '2024-12-05',
    text: 'Good experience overall. Wait time was a bit longer than expected but the care was excellent once I got in.',
    service: 'New Patient Visit',
    helpful: 5,
    responded: true,
    response: 'Thank you for your feedback, Emily. We apologize for the wait and are working on improving our scheduling.',
  },
  {
    id: '4',
    patientName: 'David P.',
    rating: 5,
    date: '2024-12-01',
    text: 'The telehealth option was so convenient! Easy to connect and the doctor was just as thorough as an in-person visit.',
    service: 'Telehealth Consultation',
    helpful: 15,
    responded: false,
  },
  {
    id: '5',
    patientName: 'Lisa T.',
    rating: 5,
    date: '2024-11-28',
    text: 'Best nutrition consultation I have ever had. Emily really knows her stuff and gave me practical advice I can actually follow.',
    service: 'Nutrition Consultation',
    helpful: 20,
    responded: false,
  },
  {
    id: '6',
    patientName: 'James W.',
    rating: 4,
    date: '2024-11-25',
    text: 'Very professional staff. The mental health screening was comprehensive and I felt comfortable throughout.',
    service: 'Mental Health Screening',
    helpful: 7,
    responded: false,
  },
];

export default function Reviews() {
  const navigate = useNavigate();
  const { provider } = useProviderData();
  const [filter, setFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  // Calculate stats
  const totalReviews = sampleReviews.length;
  const averageRating = (sampleReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);
  const fiveStarCount = sampleReviews.filter(r => r.rating === 5).length;
  const fiveStarPercent = Math.round((fiveStarCount / totalReviews) * 100);

  const filteredReviews = filter === 'all' 
    ? sampleReviews 
    : filter === 'needs-response'
    ? sampleReviews.filter(r => !r.responded)
    : sampleReviews.filter(r => r.rating === parseInt(filter));

  const handleSubmitResponse = (reviewId: string) => {
    alert('Response submitted! (Demo mode)');
    setRespondingTo(null);
    setResponseText('');
  };

  if (!provider) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reviews & Ratings</h1>
              <p className="text-sm text-gray-600">See what patients are saying about you</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600 fill-current" />
              </div>
              <span className="text-sm text-gray-600">Average Rating</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{averageRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(parseFloat(averageRating))
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-sm text-gray-600">Total Reviews</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">{totalReviews}</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">5-Star Reviews</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{fiveStarPercent}%</span>
              <span className="text-sm text-gray-500">({fiveStarCount} of {totalReviews})</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Response Rate</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {Math.round((sampleReviews.filter(r => r.responded).length / totalReviews) * 100)}%
            </span>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = sampleReviews.filter(r => r.rating === rating).length;
              const percent = (count / totalReviews) * 100;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{rating} star</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Reviews</option>
            <option value="needs-response">Needs Response</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars & Below</option>
          </select>
          <span className="text-sm text-gray-500">
            Showing {filteredReviews.length} reviews
          </span>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-teal-600">
                      {review.patientName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.patientName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{review.service}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.text}</p>

              {review.responded && review.response && (
                <div className="bg-teal-50 rounded-lg p-4 mb-4 border-l-4 border-teal-500">
                  <p className="text-sm font-medium text-teal-800 mb-1">Your Response:</p>
                  <p className="text-sm text-teal-700">{review.response}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {review.helpful} found helpful
                  </span>
                </div>
                
                {!review.responded && (
                  <>
                    {respondingTo === review.id ? (
                      <div className="flex-1 ml-4">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your response..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSubmitResponse(review.id)}
                            className="px-4 py-1 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => { setRespondingTo(null); setResponseText(''); }}
                            className="px-4 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(review.id)}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        Respond to Review
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Demo mode - These are sample reviews. Real reviews will appear here once patients start leaving feedback.
          </p>
        </div>
      </main>
    </div>
  );
}
