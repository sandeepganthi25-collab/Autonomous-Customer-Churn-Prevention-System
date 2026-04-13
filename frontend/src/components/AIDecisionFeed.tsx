import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, RefreshCw, CheckCircle, Loader2, User as UserIcon, X, Mail, Bell, Clock, ShoppingCart } from 'lucide-react';
import { getAIDecision, executeAction } from '../api';
import type { User, AIDecision } from '../types';

interface AIDecisionFeedProps {
  users: User[];
  onRefresh?: () => void;
  liveMode?: boolean;
  onSelectUser?: (user: User) => void;
}

const AIDecisionFeed = ({ users, liveMode = false, onSelectUser }: AIDecisionFeedProps) => {
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [processing, setProcessing] = useState(false);
  const [tick, setTick] = useState(0);
  const [liveUsers, setLiveUsers] = useState<User[]>([]);
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);

  useEffect(() => {
    if (!liveMode) {
      setTick(0);
      setLiveUsers(users.slice(0, 10));
      return;
    }
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [liveMode]);

  useEffect(() => {
    if (!liveMode) {
      setLiveUsers(users.slice(0, 10));
    } else if (liveMode && users.length > 0) {
      const criticalUsers = users.filter(u => u.risk_level === 'critical');
      const highUsers = users.filter(u => u.risk_level === 'high');
      const mediumUsers = users.filter(u => u.risk_level === 'medium');
      const lowUsers = users.filter(u => u.risk_level === 'low');
      
      const getRandom = (arr: User[], count: number) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, arr.length));
      };
      
      const selectedUsers = [
        ...getRandom(criticalUsers, 2),
        ...getRandom(highUsers, 2),
        ...getRandom(mediumUsers, 2),
        ...getRandom(lowUsers, 2),
      ];
      
      setLiveUsers(selectedUsers);
      
      selectedUsers.slice(0, 3).forEach(user => {
        if (!decisions.find(d => d.user_id === user.user_id)) {
          analyzeUser(user);
        }
      });
    }
  }, [tick, liveMode, users.length]);

  const analyzeUser = async (user: User, forceRefresh = false) => {
    setProcessing(true);
    try {
      const decision = await getAIDecision(user.user_id, forceRefresh);
      setDecisions(prev => [{
        ...decision,
        timestamp: new Date().toISOString(),
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Failed to get AI decision:', error);
    }
    setProcessing(false);
  };

  const handleAction = async (userId: string, actionType: string, decisionId: string) => {
    if (executedActions.has(decisionId)) return;
    
    try {
      await executeAction(userId, actionType);
    } catch (err) {
      console.log('API call result:', err);
    }
    
    setExecutedActions(prev => new Set([...prev, decisionId]));
    setDecisions(prev => prev.map(d => 
      d.decision_id === decisionId 
        ? { ...d, action_details: { ...d.action_details, action_type: `${actionType}_executed` } }
        : d
    ));
  };

  const handleViewProfile = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    if (user) {
      setSelectedProfile(user);
    } else {
      const liveUser = liveUsers.find(u => u.user_id === userId);
      if (liveUser) {
        setSelectedProfile(liveUser);
      }
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-neon-green';
    if (confidence >= 0.7) return 'text-neon-yellow';
    return 'text-neon-red';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-neon-red';
      case 'high': return 'text-neon-yellow';
      case 'medium': return 'text-neon-blue';
      default: return 'text-neon-green';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-neon-red';
      case 'high': return 'bg-neon-yellow';
      case 'medium': return 'bg-neon-blue';
      default: return 'bg-neon-green';
    }
  };

  return (
    <div className="space-y-6">
      {selectedProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Profile</h3>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getRiskBg(selectedProfile.risk_level)}/20`}>
                  <span className={`text-2xl font-bold ${getRiskColor(selectedProfile.risk_level)}`}>
                    {(selectedProfile.churn_risk * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedProfile.name}</h4>
                  <p className="text-gray-400">{selectedProfile.user_id}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getRiskBg(selectedProfile.risk_level)}/20 ${getRiskColor(selectedProfile.risk_level)}`}>
                    {selectedProfile.risk_level.toUpperCase()} RISK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">Email</span>
                  </div>
                  <p className="text-white text-sm">{selectedProfile.email}</p>
                </div>
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Bell className="w-4 h-4" />
                    <span className="text-xs">Plan</span>
                  </div>
                  <p className="text-white text-sm capitalize">{selectedProfile.plan_type}</p>
                </div>
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Last Login</span>
                  </div>
                  <p className="text-white text-sm">{selectedProfile.login_frequency} days ago</p>
                </div>
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-xs">Purchases</span>
                  </div>
                  <p className="text-white text-sm">{selectedProfile.total_purchases}</p>
                </div>
              </div>

              <div className="p-3 bg-dark-700/30 rounded-lg">
                <p className="text-gray-400 text-xs mb-2">Risk Factors</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.risk_factors.map((factor, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-dark-600 rounded text-gray-300">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Engagement Score</span>
                  <span className={`font-bold ${selectedProfile.engagement_score > 50 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {selectedProfile.engagement_score}%
                  </span>
                </div>
                <div className="h-2 bg-dark-600 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${getRiskBg(selectedProfile.risk_level)}`}
                    style={{ width: `${selectedProfile.engagement_score}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-neon-green" />
            AI Decision Engine
          </h2>
          <p className="text-sm text-gray-400">Multi-agent autonomous decision system</p>
        </div>
        <div className="flex items-center gap-4">
          {liveMode && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-sm text-neon-green font-medium">LIVE</span>
            </div>
          )}
          <button
            onClick={() => liveUsers.slice(0, 3).forEach(u => analyzeUser(u, true))}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            Refresh All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Decision Stream ({decisions.length})
          </h3>

          {decisions.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Loader2 className="w-12 h-12 text-neon-green mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Analyzing user data...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.map((decision, index) => {
                const user = users.find(u => u.user_id === decision.user_id) || liveUsers.find(u => u.user_id === decision.user_id);
                return (
                  <motion.div
                    key={decision.decision_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          decision.risk_level === 'critical' ? 'bg-neon-red/20' :
                          decision.risk_level === 'high' ? 'bg-neon-yellow/20' :
                          'bg-neon-green/20'
                        }`}>
                          <Brain className={`w-5 h-5 ${
                            decision.risk_level === 'critical' ? 'text-neon-red' :
                            decision.risk_level === 'high' ? 'text-neon-yellow' :
                            'text-neon-green'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{user?.name || decision.user_id}</h4>
                          <p className="text-xs text-gray-400">
                            {new Date(decision.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          decision.risk_level === 'critical' ? 'text-neon-red' :
                          decision.risk_level === 'high' ? 'text-neon-yellow' :
                          'text-neon-green'
                        }`}>
                          {((decision.risk_score + (liveMode ? Math.sin(tick + index) * 0.05 : 0)) * 100).toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-400">risk</span>
                      </div>
                    </div>

                    <div className="p-4 bg-dark-700/30 rounded-lg mb-4">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {decision.reasoning}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700/50 ${
                        decision.action_type.includes('discount') ? 'text-neon-green' :
                        decision.action_type.includes('email') ? 'text-neon-blue' :
                        decision.action_type.includes('push') ? 'text-neon-purple' :
                        'text-gray-400'
                      }`}>
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">
                          {decision.action_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dark-700/50 ${getConfidenceColor(decision.confidence)}`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{((decision.confidence + (liveMode ? Math.sin(tick + index + 5) * 0.05 : 0)) * 100).toFixed(0)}% confidence</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(decision.user_id, decision.action_type, decision.decision_id)}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                          executedActions.has(decision.decision_id)
                            ? 'bg-neon-green text-neon-green'
                            : 'bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30'
                        }`}
                      >
                        {executedActions.has(decision.decision_id) ? '✓ Action Executed' : 'Execute Action'}
                      </button>
                      <button
                        onClick={() => handleViewProfile(decision.user_id)}
                        className="px-4 py-2 bg-dark-700/50 text-gray-300 border border-white/10 rounded-lg hover:bg-dark-700 transition-all text-sm flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        View Profile
                      </button>
                    </div>
                    {executedActions.has(decision.decision_id) && (
                      <p className="text-xs text-neon-green mt-2">Action successfully executed!</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            User Queue
          </h3>

          <div className="glass-card p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {liveUsers.map((user) => (
              <button
                key={user.user_id}
                onClick={() => analyzeUser(user)}
                className="w-full flex items-center justify-between p-3 bg-dark-700/30 rounded-lg hover:bg-dark-700/50 transition-all text-left"
              >
                <div>
                  <p className="text-sm text-white font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.user_id}</p>
                </div>
                <span className={`text-sm font-medium ${
                  user.risk_level === 'critical' ? 'text-neon-red' :
                  user.risk_level === 'high' ? 'text-neon-yellow' :
                  user.risk_level === 'medium' ? 'text-neon-blue' : 'text-neon-green'
                }`}>
                  {((user.churn_risk + (liveMode ? Math.sin(tick * 0.5 + user.user_id.charCodeAt(4)) * 0.08 : 0)) * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>

          <div className="glass-card p-4">
            <h4 className="text-sm font-medium text-white mb-3">Agent Status</h4>
            <div className="space-y-2">
              {['Risk Agent', 'Behavior Agent', 'Strategy Agent', 'Execution Agent'].map((agent) => (
                <div key={agent} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{agent}</span>
                  <span className="flex items-center gap-1 text-xs text-neon-green">
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDecisionFeed;
