import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { TrendingUp, Users, MessageSquare, DollarSign, Bot, Zap, Clock, Target } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { analyticsService, conversationService, orderService, productService } from '../services/database';

const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeCustomers: 0,
    totalConversations: 0,
    aiResponseRate: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics stats
      const dashboardStats = await analyticsService.getDashboardStats(user!.id);
      setStats(dashboardStats);

      // Load recent conversations for activities
      const conversations = await conversationService.getConversations(user!.id);
      const orders = await orderService.getOrders(user!.id);
      
      // Combine and sort recent activities
      const activities = [
        ...conversations.slice(0, 3).map(conv => ({
          type: 'message',
          customer: conv.customer_name || conv.customer_phone,
          action: conv.last_message || 'started a conversation',
          time: getTimeAgo(conv.last_message_at || conv.created_at),
          amount: null
        })),
        ...orders.slice(0, 2).map(order => ({
          type: 'order',
          customer: order.customer_name || order.customer_phone,
          action: `placed an order`,
          time: getTimeAgo(order.created_at),
          amount: `€${order.total_amount}`
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

      setRecentActivities(activities);

      // Load products for top products (mock data for now)
      const products = await productService.getProducts(user!.id);
      const topProductsData = products.slice(0, 4).map(product => ({
        name: product.name,
        sales: Math.floor(Math.random() * 50) + 10,
        revenue: `€${(product.price * (Math.floor(Math.random() * 50) + 10)).toFixed(0)}`
      }));
      setTopProducts(topProductsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const dashboardStats = [
    {
      icon: DollarSign,
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: '+15.3%',
      changeType: 'positive'
    },
    {
      icon: Users,
      title: 'Active Customers',
      value: stats.activeCustomers.toString(),
      change: '+12.7%',
      changeType: 'positive'
    },
    {
      icon: MessageSquare,
      title: 'Conversations',
      value: stats.totalConversations.toString(),
      change: '+8.1%',
      changeType: 'positive'
    },
    {
      icon: Bot,
      title: 'AI Response Rate',
      value: `${stats.aiResponseRate.toFixed(1)}%`,
      change: '+2.3%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name || 'User'}! 👋
              </h1>
              <p className="text-purple-100">
                Your AI assistant is active and ready to help your customers.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">AI Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'order' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'order' ? 
                          <DollarSign className="w-5 h-5" /> : 
                          <MessageSquare className="w-5 h-5" />
                        }
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{activity.customer}</p>
                        <p className="text-gray-600 text-sm">{activity.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-green-600 font-bold">{activity.amount}</p>
                      )}
                      <p className="text-gray-500 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Activity will appear here as customers interact with your AI assistant</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Top Products</h2>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <p className="font-bold text-green-600">{product.revenue}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products yet</p>
                  <p className="text-sm text-gray-400">Add products to see sales data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Bot className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-medium text-gray-800 mb-1">Configure AI Assistant</h3>
              <p className="text-sm text-gray-600">Customize responses and personality</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-medium text-gray-800 mb-1">View Conversations</h3>
              <p className="text-sm text-gray-600">Monitor ongoing customer chats</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-medium text-gray-800 mb-1">Analytics Report</h3>
              <p className="text-sm text-gray-600">Generate detailed sales insights</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;