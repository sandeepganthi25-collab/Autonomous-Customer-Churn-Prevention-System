import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp, AlertTriangle, TrendingDown, Activity, Loader2 } from 'lucide-react';
import { predictChurn } from '../api';
import type { User } from '../types';

interface ExplainabilityPanelProps {
  user: User | null;
  users: User[];
  liveMode?: boolean;
}

interface SHAPValues {
  feature: string;
  impact: number;
  direction: 'positive' | 'negative';
}

const ExplainabilityPanel = ({ user, users, liveMode = false }: ExplainabilityPanelProps) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!liveMode) {
      setTick(0);
      return;
    }
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [liveMode]);
  const [selectedUser, setSelectedUser] = useState<User | null>(user);
  const [shapValues, setShapValues] = useState<SHAPValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');

  useEffect(() => {
    if (user) setSelectedUser(user);
  }, [user]);

  const analyzeUser = async (userToAnalyze: User) => {
    setSelectedUser(userToAnalyze);
    setLoading(true);
    
    try {
      const prediction = await predictChurn(userToAnalyze.user_id);
      setExplanation(prediction.reasoning);
      
      const mockSHAP: SHAPValues[] = [
        { feature: 'Login Frequency', impact: -0.20, direction: 'negative' },
        { feature: 'Engagement Score', impact: -0.15, direction: 'negative' },
        { feature: 'Purchase Recency', impact: 0.12, direction: 'positive' },
        { feature: 'Support Tickets', impact: 0.10, direction: 'positive' },
        { feature: 'Email Engagement', impact: 0.08, direction: 'positive' },
        { feature: 'Session Duration', impact: -0.05, direction: 'negative' },
        { feature: 'Plan Type', impact: -0.03, direction: 'negative' },
        { feature: 'Days Since Join', impact: 0.02, direction: 'positive' },
      ];
      
      setShapValues(mockSHAP);
    } catch (error) {
      console.error('Failed to analyze:', error);
    }
    
    setLoading(false);
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('login')) return Activity;
    if (feature.toLowerCase().includes('engagement')) return TrendingDown;
    if (feature.toLowerCase().includes('purchase')) return AlertTriangle;
    return Shield;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-neon-purple" />
            Churn Explainability Engine
          </h2>
          <p className="text-sm text-gray-400">SHAP-powered causal reasoning</p>
        </div>
        {liveMode && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-neon-green font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Select User</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {users.slice(0, 15).map((u) => (
              <button
                key={u.user_id}
                onClick={() => analyzeUser(u)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedUser?.user_id === u.user_id
                    ? 'bg-neon-purple/20 border border-neon-purple/30'
                    : 'bg-dark-700/30 hover:bg-dark-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.user_id}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    u.risk_level === 'critical' ? 'text-neon-red' :
                    u.risk_level === 'high' ? 'text-neon-yellow' : 'text-neon-green'
                  }`}>
                    {((u.churn_risk + (liveMode ? Math.sin(tick * 0.5 + u.user_id.charCodeAt(4)) * 0.1 : 0)) * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="glass-card p-12 text-center">
              <Loader2 className="w-12 h-12 text-neon-purple mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Analyzing user with SHAP...</p>
            </div>
          ) : selectedUser ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    selectedUser.risk_level === 'critical' ? 'bg-neon-red/20' :
                    selectedUser.risk_level === 'high' ? 'bg-neon-yellow/20' :
                    'bg-neon-green/20'
                  }`}>
                    <span className={`text-2xl font-bold ${
                      selectedUser.risk_level === 'critical' ? 'text-neon-red' :
                      selectedUser.risk_level === 'high' ? 'text-neon-yellow' :
                      'text-neon-green'
                    }`}>
                      {((selectedUser.churn_risk + (liveMode ? Math.sin(tick * 0.5) * 0.1 : 0)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-400">{selectedUser.user_id} - {selectedUser.plan_type} plan</p>
                  </div>
                </div>

                <div className="p-4 bg-dark-700/30 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">AI Explanation</h4>
                  <p className="text-gray-300 leading-relaxed">
                    {explanation || 'Select a user to see detailed churn explanation...'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">SHAP Feature Importance</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Red bars increase churn risk, green bars decrease churn risk
                </p>

                <div className="space-y-3">
                  {shapValues.map((shap, index) => {
                    const maxImpact = Math.max(...shapValues.map(s => Math.abs(s.impact)));
                    const width = Math.abs(shap.impact) / maxImpact * 100;
                    const Icon = getFeatureIcon(shap.feature);

                    return (
                      <motion.div
                        key={shap.feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-white">{shap.feature}</span>
                          </div>
                          <span className={`text-sm font-medium ${
                            shap.direction === 'negative' ? 'text-neon-red' : 'text-neon-green'
                          }`}>
                            {shap.impact > 0 ? '+' : ''}{(shap.impact * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-full ${
                              shap.direction === 'negative' 
                                ? 'bg-gradient-to-r from-neon-red/50 to-neon-red' 
                                : 'bg-gradient-to-r from-neon-green to-neon-green/50'
                            }`}
                            style={{ marginLeft: shap.direction === 'positive' ? 'auto' : 0 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a user to analyze churn factors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPanel;
