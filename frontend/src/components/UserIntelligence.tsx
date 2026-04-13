import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, TrendingDown, Clock, Mail, Bell, RefreshCw } from 'lucide-react';
import type { User } from '../types';

interface UserIntelligenceProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onRefresh?: () => void;
  liveMode?: boolean;
}

const UserIntelligence = ({ users, onSelectUser, liveMode = false }: UserIntelligenceProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [liveTick, setLiveTick] = useState(0);
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (liveMode) {
      const timer = setInterval(() => {
        setLiveTick(prev => prev + 1);
      }, 5000);
      return () => clearInterval(timer);
    } else {
      setLiveTick(0);
    }
  }, [liveMode]);

  useEffect(() => {
    if (users.length === 0) return;
    
    const criticalUsers = users.filter(u => u.risk_level === 'critical');
    const highUsers = users.filter(u => u.risk_level === 'high');
    const mediumUsers = users.filter(u => u.risk_level === 'medium');
    const lowUsers = users.filter(u => u.risk_level === 'low');
    
    const getRandom = (arr: User[], count: number) => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, arr.length));
    };
    
    const selectedUsers = [
      ...getRandom(criticalUsers, 13),
      ...getRandom(highUsers, 13),
      ...getRandom(mediumUsers, 12),
      ...getRandom(lowUsers, 12),
    ].slice(0, 50);
    
    setDisplayUsers(selectedUsers);
  }, [users, liveTick]);

  const filteredUsers = displayUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || user.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return { bg: 'bg-neon-red/20', border: 'border-neon-red', text: 'text-neon-red' };
      case 'high': return { bg: 'bg-neon-yellow/20', border: 'border-neon-yellow', text: 'text-neon-yellow' };
      case 'medium': return { bg: 'bg-neon-blue/20', border: 'border-neon-blue', text: 'text-neon-blue' };
      default: return { bg: 'bg-neon-green/20', border: 'border-neon-green', text: 'text-neon-green' };
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return AlertTriangle;
      case 'high': return TrendingDown;
      case 'medium': return Clock;
      default: return Clock;
    }
  };

  const calculateLiveRisk = (baseRisk: number, index: number) => {
    if (!liveMode) return baseRisk;
    const variation = Math.sin(liveTick * 0.5 + index * 0.3) * 0.12;
    return Math.max(0.01, Math.min(0.99, baseRisk + variation));
  };

  const calculateLiveEngagement = (baseEngagement: number, index: number) => {
    if (!liveMode) return baseEngagement;
    const variation = Math.cos(liveTick * 0.4 + index * 0.5) * 12;
    return Math.max(10, Math.min(100, baseEngagement + variation));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-neon-blue" />
            User Intelligence
          </h2>
          <p className="text-sm text-gray-400">
            {liveMode ? 'Real-time user monitoring' : 'Click Live to start real-time monitoring'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-neon-yellow">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Refreshing...</span>
            </div>
          )}
          {liveMode && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
              <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
              <span className="text-sm text-neon-green font-bold">LIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-green/50"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'critical', 'high', 'medium', 'low'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRiskFilter(filter)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                riskFilter === filter
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  : 'bg-dark-700/50 text-gray-400 border border-transparent hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing {filteredUsers.length} users
          {liveMode && ' (auto-refreshing)'}
        </p>
        <div className="flex gap-2 text-xs">
          <span className="text-neon-red">Critical: {filteredUsers.filter(u => u.risk_level === 'critical').length}</span>
          <span className="text-neon-yellow">High: {filteredUsers.filter(u => u.risk_level === 'high').length}</span>
          <span className="text-neon-blue">Medium: {filteredUsers.filter(u => u.risk_level === 'medium').length}</span>
          <span className="text-neon-green">Low: {filteredUsers.filter(u => u.risk_level === 'low').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map((user, index) => {
          const liveRisk = calculateLiveRisk(user.churn_risk, index);
          const liveEngagement = calculateLiveEngagement(user.engagement_score, index);
          const colors = getRiskColor(user.risk_level);
          const RiskIcon = getRiskIcon(user.risk_level);
          const riskPercent = Math.round(liveRisk * 100);
          const engagementPercent = Math.round(liveEngagement);

          return (
            <div
              key={`${user.user_id}-${liveTick}`}
              className={`glass-card p-5 cursor-pointer hover:scale-[1.02] transition-all ${colors.bg} border ${colors.border}`}
              onClick={() => onSelectUser(user)}
            >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.user_id}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
                    <RiskIcon className={`w-4 h-4 ${colors.text}`} />
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {riskPercent}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Bell className="w-4 h-4" />
                    <span className="capitalize">{user.plan_type} plan</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {user.risk_factors.slice(0, 2).map((factor, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-dark-700/50 rounded-md text-gray-300"
                    >
                      {factor.length > 25 ? factor.substring(0, 25) + '...' : factor}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Engagement</p>
                    <p className={`text-lg font-bold ${engagementPercent > 50 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {engagementPercent}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Purchases</p>
                    <p className="text-lg font-bold text-white">{user.total_purchases}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Last Login</p>
                    <p className="text-lg font-bold text-white">{user.login_frequency}d</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-white mb-2">No users found</p>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default UserIntelligence;
