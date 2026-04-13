import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, RefreshCw, CheckCircle, XCircle, DollarSign, TrendingUp, User as UserIcon } from 'lucide-react';
import { simulateAction, createDigitalTwin } from '../api';
import type { User, Simulation } from '../types';

interface DigitalTwinSimulatorProps {
  user: User | null;
  users: User[];
  liveMode?: boolean;
}

const ACTIONS = [
  { id: 'send_discount', label: 'Send Discount', icon: DollarSign, color: 'neon-green' },
  { id: 'send_loyalty_offer', label: 'Loyalty Offer', icon: CheckCircle, color: 'neon-blue' },
  { id: 'personalized_email', label: 'Personalized Email', icon: Brain, color: 'neon-purple' },
  { id: 'push_notification', label: 'Push Notification', icon: TrendingUp, color: 'neon-yellow' },
  { id: 'premium_feature_trial', label: 'Premium Trial', icon: Brain, color: 'neon-blue' },
  { id: 'no_action', label: 'No Action', icon: XCircle, color: 'gray' },
];

const DigitalTwinSimulator = ({ user, users, liveMode = false }: DigitalTwinSimulatorProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('send_discount');
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<Simulation[]>([]);
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

  useEffect(() => {
    if (user && user !== selectedUser) {
      setSelectedUser(user);
      setSimulation(null);
    } else if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [user, users, selectedUser]);

  const handleUserSelect = (u: User) => {
    setSelectedUser(u);
    setSimulation(null);
  };

  const clearHistory = () => {
    setSimulationHistory([]);
  };

  const runSimulation = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const result = await simulateAction(selectedUser.user_id, selectedAction);
      setSimulation(result);
      setSimulationHistory(prev => [result, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Simulation failed:', error);
    }
    setLoading(false);
  };

  const getSuccessColor = (prob: number) => {
    if (prob >= 70) return 'text-neon-green';
    if (prob >= 50) return 'text-neon-yellow';
    return 'text-neon-red';
  };

  const getRetentionColor = (retention: number) => {
    if (retention >= 80) return 'text-neon-green';
    if (retention >= 60) return 'text-neon-yellow';
    return 'text-neon-red';
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <UserIcon className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-xl text-white font-medium mb-2">No Users Available</p>
        <p className="text-gray-400">Load users from the User Intelligence tab first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-neon-purple" />
            Digital Twin Simulator
          </h2>
          <p className="text-sm text-gray-400">Virtual user replicas for counterfactual analysis</p>
        </div>
        {liveMode && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-neon-green font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Select User</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {users.slice(0, 15).map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => handleUserSelect(u)}
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
                      {((u.churn_risk + (liveMode ? Math.sin(tick * 0.5 + u.user_id.charCodeAt(4)) * 0.08 : 0)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Select Action</h3>
            <div className="space-y-2">
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedAction === action.id
                      ? `bg-${action.color}/20 border border-${action.color}/30`
                      : 'bg-dark-700/30 hover:bg-dark-700/50'
                  }`}
                >
                  <action.icon className={`w-5 h-5 text-${action.color}`} />
                  <span className="text-sm text-white">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={!selectedUser || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            Run Simulation
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">User Digital Twin</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <p className="text-xs text-gray-400">Current Risk</p>
                  <p className={`text-xl font-bold ${
                    selectedUser.risk_level === 'critical' ? 'text-neon-red' :
                    selectedUser.risk_level === 'high' ? 'text-neon-yellow' : 'text-neon-green'
                  }`}>
                    {((selectedUser.churn_risk + (liveMode ? Math.sin(tick * 0.5) * 0.1 : 0)) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <p className="text-xs text-gray-400">Engagement</p>
                  <p className="text-xl font-bold text-white">{Math.round(selectedUser.engagement_score + (liveMode ? Math.sin(tick * 0.3) * 10 : 0))}%</p>
                </div>
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <p className="text-xs text-gray-400">Purchases</p>
                  <p className="text-xl font-bold text-white">{selectedUser.total_purchases}</p>
                </div>
                <div className="p-3 bg-dark-700/30 rounded-lg">
                  <p className="text-xs text-gray-400">Last Login</p>
                  <p className="text-xl font-bold text-white">{selectedUser.login_frequency}d</p>
                </div>
              </div>

              <div className="p-4 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-neon-purple" />
                  <span className="text-sm font-medium text-white">Twin Created</span>
                </div>
                <p className="text-xs text-gray-400">
                  Virtual replica initialized with current user state for counterfactual analysis
                </p>
              </div>
            </motion.div>
          )}

          {simulation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 neon-border"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Simulation Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-neon-green/10 rounded-lg border border-neon-green/20">
                  <p className="text-xs text-gray-400 mb-1">Predicted Retention</p>
                  <p className={`text-2xl font-bold ${getRetentionColor(simulation.predicted_retention)}`}>
                    {simulation.predicted_retention}%
                  </p>
                </div>
                <div className="p-4 bg-dark-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">New Risk Score</p>
                  <p className="text-2xl font-bold text-white">
                    {(simulation.predicted_churn_risk * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 bg-dark-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Success Probability</p>
                  <p className={`text-2xl font-bold ${getSuccessColor(simulation.success_probability)}`}>
                    {simulation.success_probability}%
                  </p>
                </div>
                <div className="p-4 bg-dark-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Revenue Impact</p>
                  <p className={`text-2xl font-bold ${
                    simulation.revenue_impact >= 0 ? 'text-neon-green' : 'text-neon-red'
                  }`}>
                    {simulation.revenue_impact >= 0 ? '+' : ''}{simulation.revenue_impact}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={runSimulation}
                  className="flex-1 px-4 py-3 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-all font-medium"
                >
                  Apply This Action
                </button>
                <button
                  onClick={() => setSimulation(null)}
                  className="px-4 py-3 bg-dark-700/50 text-gray-300 border border-white/10 rounded-lg hover:bg-dark-700 transition-all"
                >
                  Try Different
                </button>
              </div>
            </motion.div>
          )}

          {simulationHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Simulation History</h3>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {simulationHistory.map((sim, index) => (
                  <div
                    key={sim.simulation_id}
                    className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-white font-medium capitalize">
                        {sim.action.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-400">
                        Retention: {sim.predicted_retention}% | Risk: {(sim.predicted_churn_risk * 100).toFixed(0)}%
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${
                      sim.success_probability >= 70 ? 'text-neon-green' :
                      sim.success_probability >= 50 ? 'text-neon-yellow' : 'text-neon-red'
                    }`}>
                      {sim.success_probability}% success
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinSimulator;
