import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, MessageSquare, Calendar, DollarSign, Clock, Users, Search, Share2, ChevronDown } from 'lucide-react';
import { useProviderData } from '../hooks/useProviderData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Generate mock data based on date range
const generateViewsData = (range: string) => {
  const data: { date: string; views: number }[] = [];
  const now = new Date();
  
  if (range === '7days') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 50) + 30
      });
    }
  } else if (range === '30days') {
    for (let i = 29; i >= 0; i -= 3) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 80) + 40
      });
    }
  } else if (range === '90days') {
    for (let i = 89; i >= 0; i -= 10) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 150) + 80
      });
    }
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    for (let i = 11; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      data.push({
        date: months[monthIdx],
        views: Math.floor(Math.random() * 500) + 200
      });
    }
  }
  return data;
};

const generateWeekdayData = (range: string) => {
  const multiplier = range === '7days' ? 1 : range === '30days' ? 4 : range === '90days' ? 12 : 52;
  return [
    { day: 'Mon', bookings: Math.floor((Math.random() * 5 + 8) * multiplier) },
    { day: 'Tue', bookings: Math.floor((Math.random() * 5 + 10) * multiplier) },
    { day: 'Wed', bookings: Math.floor((Math.random() * 5 + 12) * multiplier) },
    { day: 'Thu', bookings: Math.floor((Math.random() * 5 + 14) * multiplier) },
    { day: 'Fri', bookings: Math.floor((Math.random() * 5 + 11) * multiplier) },
    { day: 'Sat', bookings: Math.floor((Math.random() * 3 + 4) * multiplier) },
    { day: 'Sun', bookings: Math.floor((Math.random() * 2 + 2) * multiplier) },
  ];
};

const generateSourceData = (range: string) => {
  const searchBase = range === '7days' ? 42 : range === '30days' ? 45 : range === '90days' ? 48 : 50;
  const directBase = range === '7days' ? 33 : range === '30days' ? 30 : range === '90days' ? 28 : 25;
  const referralBase = 100 - searchBase - directBase;
  
  return [
    { name: 'Search', value: searchBase + Math.floor(Math.random() * 5), color: '#14b8a6' },
    { name: 'Direct', value: directBase + Math.floor(Math.random() * 5), color: '#06b6d4' },
    { name: 'Referral', value: referralBase + Math.floor(Math.random() * 5), color: '#8b5cf6' },
  ];
};

const generateStats = (range: string) => {
  const multipliers: Record<string, number> = {
    '7days': 1,
    '30days': 4,
    '90days': 12,
    '12months': 52
  };
  const m = multipliers[range] || 1;
  
  return {
    views: Math.floor((280 + Math.random() * 50) * m),
    viewsChange: Math.floor(Math.random() * 20) - 5,
    inquiries: Math.floor((18 + Math.random() * 10) * m),
    inquiriesChange: Math.floor(Math.random() * 15) - 3,
    bookings: Math.floor((7 + Math.random() * 5) * m),
    bookingsChange: Math.floor(Math.random() * 25) - 5,
    revenue: Math.floor((950 + Math.random() * 200) * m),
    revenueChange: Math.floor(Math.random() * 30) - 5,
  };
};

const generateActivity = (range: string) => {
  const activities = [
    { type: 'inquiry', templates: ['New inquiry from {name}', 'Question about services from {name}'] },
    { type: 'booking', templates: ['Booking confirmed: {name} - {service}', 'New appointment: {name}'] },
    { type: 'view', templates: ['Profile view spike: {count} views', 'High traffic period: {count} visitors'] },
    { type: 'review', templates: ['New 5-star review from {name}', 'New review received from {name}'] },
  ];
  
  const names = ['John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'David W.', 'Emma S.', 'James B.', 'Anna P.'];
  const services = ['Annual Physical', 'Flu Vaccination', 'Wellness Checkup', 'Follow-up Visit', 'New Patient Exam'];
  const times = range === '7days' 
    ? ['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago', '3 days ago', '5 days ago']
    : range === '30days'
    ? ['Today', 'Yesterday', '3 days ago', '1 week ago', '2 weeks ago', '3 weeks ago']
    : range === '90days'
    ? ['This week', 'Last week', '2 weeks ago', '1 month ago', '2 months ago', '3 months ago']
    : ['This month', 'Last month', '2 months ago', '3 months ago', '6 months ago', '9 months ago'];

  return times.map((time, idx) => {
    const actType = activities[idx % activities.length];
    let message = actType.templates[Math.floor(Math.random() * actType.templates.length)];
    message = message.replace('{name}', names[Math.floor(Math.random() * names.length)]);
    message = message.replace('{service}', services[Math.floor(Math.random() * services.length)]);
    message = message.replace('{count}', String(Math.floor(Math.random() * 50) + 20));
    
    return { type: actType.type, message, time };
  });
};

const generateMetrics = (range: string) => {
  const responseHours = range === '7days' ? 2.1 : range === '30days' ? 2.5 : range === '90days' ? 2.8 : 3.0;
  const conversionRate = range === '7days' ? 42 : range === '30days' ? 38 : range === '90days' ? 35 : 33;
  const completionRate = range === '7days' ? 94 : range === '30days' ? 92 : range === '90days' ? 90 : 89;
  const ranking = range === '7days' ? 2 : range === '30days' ? 3 : range === '90days' ? 4 : 5;
  
  return {
    responseTime: `${responseHours.toFixed(1)} hours`,
    conversionRate: `${conversionRate}%`,
    completionRate: `${completionRate}%`,
    ranking: `#${ranking} in area`
  };
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change: number;
  subtitle?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, subtitle, color }) => {
  const isPositive = change >= 0;
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const { provider, loading } = useProviderData();
  const [dateRange, setDateRange] = useState('30days');

  // Generate data based on date range
  const viewsData = useMemo(() => generateViewsData(dateRange), [dateRange]);
  const weekdayData = useMemo(() => generateWeekdayData(dateRange), [dateRange]);
  const sourceData = useMemo(() => generateSourceData(dateRange), [dateRange]);
  const stats = useMemo(() => generateStats(dateRange), [dateRange]);
  const recentActivity = useMemo(() => generateActivity(dateRange), [dateRange]);
  const metrics = useMemo(() => generateMetrics(dateRange), [dateRange]);

  // Calculate top services from provider data
  const topServices = useMemo(() => {
    const multiplier = dateRange === '7days' ? 1 : dateRange === '30days' ? 4 : dateRange === '90days' ? 12 : 52;
    return (provider?.services || [])
      .slice(0, 5)
      .map((service: any, idx: number) => ({
        name: service.name,
        bookings: Math.floor((Math.random() * 12 + 3) * multiplier),
        revenue: Math.floor((Math.random() * 12 + 3) * multiplier * service.price),
        percentage: Math.floor(100 - idx * 18),
      }));
  }, [provider?.services, dateRange]);

  const dateRangeLabel = {
    '7days': 'last 7 days',
    '30days': 'last 30 days',
    '90days': 'last 90 days',
    '12months': 'last 12 months'
  }[dateRange];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!provider) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-600">{provider.practiceName}</p>
              </div>
            </div>
            
            {/* Date Range Selector */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="12months">Last 12 months</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Eye}
            label="Profile Views"
            value={stats.views.toLocaleString()}
            change={stats.viewsChange}
            subtitle={`vs previous ${dateRangeLabel}`}
            color="teal"
          />
          <StatCard
            icon={MessageSquare}
            label="Inquiries"
            value={stats.inquiries}
            change={stats.inquiriesChange}
            subtitle={`vs previous ${dateRangeLabel}`}
            color="cyan"
          />
          <StatCard
            icon={Calendar}
            label="Bookings"
            value={stats.bookings}
            change={stats.bookingsChange}
            subtitle={`vs previous ${dateRangeLabel}`}
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            change={stats.revenueChange}
            subtitle={`vs previous ${dateRangeLabel}`}
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Views Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Views Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {sourceData.map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-sm text-gray-600">{source.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Busiest Days */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Busiest Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="bookings" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Services */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
            <div className="space-y-4">
              {topServices.length > 0 ? (
                topServices.map((service: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{service.name}</span>
                        <span className="text-sm text-gray-600">{service.bookings} bookings</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${Math.min(service.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">${service.revenue.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No services data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">Avg. Response Time</span>
                </div>
                <span className="font-semibold text-gray-900">{metrics.responseTime}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700">Inquiry Conversion Rate</span>
                </div>
                <span className="font-semibold text-gray-900">{metrics.conversionRate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Booking Completion Rate</span>
                </div>
                <span className="font-semibold text-gray-900">{metrics.completionRate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Search Ranking</span>
                </div>
                <span className="font-semibold text-gray-900">{metrics.ranking}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'inquiry' ? 'bg-cyan-100 text-cyan-600' :
                    activity.type === 'booking' ? 'bg-green-100 text-green-600' :
                    activity.type === 'view' ? 'bg-teal-100 text-teal-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'inquiry' && <MessageSquare className="w-4 h-4" />}
                    {activity.type === 'booking' && <Calendar className="w-4 h-4" />}
                    {activity.type === 'view' && <Eye className="w-4 h-4" />}
                    {activity.type === 'review' && <TrendingUp className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips to Improve Your Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                <Eye className="w-5 h-5 text-teal-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Add More Photos</h4>
              <p className="text-sm text-gray-600">Profiles with 5+ photos get 40% more views</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Respond Faster</h4>
              <p className="text-sm text-gray-600">Providers who respond within 1 hour convert 60% better</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Share Your Profile</h4>
              <p className="text-sm text-gray-600">Share on social media to boost direct traffic</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
