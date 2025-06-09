import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Filter, MessageSquare, Bot, User, Clock, CheckCircle2, AlertCircle, MoreVertical } from 'lucide-react';

const ConversationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(1);

  const conversations = [
    {
      id: 1,
      customer: 'Maria Santos',
      lastMessage: 'Can you recommend a dress for a wedding?',
      timestamp: '2 min ago',
      status: 'active',
      unread: 2,
      avatar: 'MS',
      channel: 'whatsapp'
    },
    {
      id: 2,
      customer: 'Ahmed Hassan',
      lastMessage: 'Is the blue sneakers still available?',
      timestamp: '15 min ago',
      status: 'ai_handled',
      unread: 0,
      avatar: 'AH',
      channel: 'whatsapp'
    },
    {
      id: 3,
      customer: 'Chen Wei',
      lastMessage: 'Thank you for the quick delivery!',
      timestamp: '1 hour ago',
      status: 'resolved',
      unread: 0,
      avatar: 'CW',
      channel: 'whatsapp'
    },
    {
      id: 4,
      customer: 'Sofia Rodriguez',
      lastMessage: 'I need help with my order',
      timestamp: '2 hours ago',
      status: 'pending',
      unread: 1,
      avatar: 'SR',
      channel: 'whatsapp'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'customer',
      content: 'Hi! I\'m looking for a nice dress for a wedding. Do you have any recommendations?',
      timestamp: '10:30 AM',
      type: 'text'
    },
    {
      id: 2,
      sender: 'ai',
      content: 'Hello Maria! I\'d be happy to help you find the perfect wedding dress. What style are you looking for? We have elegant cocktail dresses, formal gowns, and midi dresses available.',
      timestamp: '10:31 AM',
      type: 'text'
    },
    {
      id: 3,
      sender: 'customer',
      content: 'I prefer something elegant but not too formal. Maybe a midi dress?',
      timestamp: '10:32 AM',
      type: 'text'
    },
    {
      id: 4,
      sender: 'ai',
      content: 'Perfect! I have some beautiful midi dresses that would be ideal for a wedding. Here are my top recommendations:',
      timestamp: '10:32 AM',
      type: 'text'
    },
    {
      id: 5,
      sender: 'ai',
      content: '1. Elegant Navy Midi Dress - €89.99\n2. Floral Print Midi Dress - €74.99\n3. Classic Black Midi Dress - €79.99\n\nWould you like to see photos of any of these?',
      timestamp: '10:33 AM',
      type: 'product_recommendation'
    },
    {
      id: 6,
      sender: 'customer',
      content: 'The navy one sounds perfect! Can I see a photo?',
      timestamp: '10:35 AM',
      type: 'text'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ai_handled': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'ai_handled': return 'AI Handled';
      case 'resolved': return 'Resolved';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full flex">
        {/* Conversations List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800">Conversations</h1>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Conversations</option>
                <option value="active">Active</option>
                <option value="ai_handled">AI Handled</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-purple-50 border-r-2 border-r-purple-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {conversation.avatar}
                    </div>
                    {conversation.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-800 truncate">{conversation.customer}</h3>
                      <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                        {getStatusText(conversation.status)}
                      </span>
                      <MessageSquare className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  MS
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Maria Santos</h2>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">WhatsApp</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                  Take Over
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md flex items-end space-x-2 ${
                  message.sender === 'customer' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'customer' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {message.sender === 'customer' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.sender === 'customer'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : message.type === 'product_recommendation'
                      ? 'bg-blue-50 border border-blue-200 text-gray-800'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className={`flex items-center justify-between mt-2 ${
                      message.sender === 'customer' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{message.timestamp}</span>
                      {message.sender === 'ai' && (
                        <div className="flex items-center space-x-1">
                          <Bot className="w-3 h-3" />
                          <span className="text-xs">AI</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
                Send
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Bot className="w-4 h-4" />
                  <span>AI is handling this conversation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>94% accuracy</span>
                </div>
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View AI Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationsPage;