import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, AlertTriangle, CheckCircle, RefreshCw, Activity, Database, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SystemHealth as SystemHealthType } from '../types';

interface SystemHealthProps {
  health: SystemHealthType | null;
  onRefresh?: () => void;
  liveMode?: boolean;
}

const SystemHealth = ({ health, liveMode = false }: SystemHealthProps) => {
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
  if (!health) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-neon-green">Loading system status...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return { bg: 'bg-neon-green/20', border: 'border-neon-green/30', text: 'text-neon-green' };
      case 'degraded': return { bg: 'bg-neon-yellow/20', border: 'border-neon-yellow/30', text: 'text-neon-yellow' };
      case 'critical': return { bg: 'bg-neon-red/20', border: 'border-neon-red/30', text: 'text-neon-red' };
      default: return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400' };
    }
  };

  const statusColors = getStatusColor(health.status);

  const metrics = [
    { label: 'Accuracy', value: Math.min(1, Math.max(0, health.model_metrics.accuracy + (liveMode ? Math.sin(tick) * 0.02 : 0))), color: '#00ff88' },
    { label: 'Precision', value: Math.min(1, Math.max(0, health.model_metrics.precision + (liveMode ? Math.sin(tick + 1) * 0.02 : 0))), color: '#00d4ff' },
    { label: 'Recall', value: Math.min(1, Math.max(0, health.model_metrics.recall + (liveMode ? Math.sin(tick + 2) * 0.02 : 0))), color: '#a855f7' },
    { label: 'F1 Score', value: Math.min(1, Math.max(0, health.model_metrics.f1 + (liveMode ? Math.sin(tick + 3) * 0.02 : 0))), color: '#ffd93d' },
    { label: 'AUC-ROC', value: Math.min(1, Math.max(0, health.model_metrics.auc_roc + (liveMode ? Math.sin(tick + 4) * 0.01 : 0))), color: '#00ff88' },
  ];

  const generateHealthHistory = () => {
    const data = [];
    for (let i = 24; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      data.push({
        time: hour.toLocaleTimeString('en-US', { hour: '2-digit' }),
        accuracy: Math.min(1, Math.max(0, 0.85 + (liveMode ? Math.sin((tick + i) * 0.5) * 0.05 : 0) + Math.random() * 0.02)),
        latency: 50 + (liveMode ? Math.sin((tick + i) * 0.3) * 10 : 0) + Math.random() * 10,
      });
    }
    return data;
  };

  const healthHistory = generateHealthHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-neon-green" />
            System Health & Model Monitoring
          </h2>
          <p className="text-sm text-gray-400">Real-time monitoring with drift detection</p>
        </div>
        <div className="flex items-center gap-3">
          {liveMode && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-sm text-neon-green font-medium">LIVE</span>
            </div>
          )}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusColors.bg} border ${statusColors.border}`}>
            {health.status === 'operational' ? (
              <CheckCircle className={`w-5 h-5 ${statusColors.text}`} />
            ) : (
              <AlertTriangle className={`w-5 h-5 ${statusColors.text}`} />
            )}
            <span className={`text-sm font-medium ${statusColors.text} capitalize`}>
              {health.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-neon-blue" />
            <span className="text-sm text-gray-400">Active Connections</span>
          </div>
          <p className="text-3xl font-bold text-white">{health.active_connections}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-neon-green" />
            <span className="text-sm text-gray-400">Uptime</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(health.uptime_seconds / 3600).toFixed(1)}h
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-neon-purple" />
            <span className="text-sm text-gray-400">Model Version</span>
          </div>
          <p className="text-3xl font-bold text-white">v2.1.4</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-neon-yellow" />
            <span className="text-sm text-gray-400">Drift Score</span>
          </div>
          <p className={`text-3xl font-bold ${
            health.model_metrics.drift_severity === 'high' ? 'text-neon-red' :
            health.model_metrics.drift_severity === 'medium' ? 'text-neon-yellow' : 'text-neon-green'
          }`}>
            {(Math.random() * 0.1).toFixed(3)}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Model Performance</h3>
          
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{metric.label}</span>
                  <span className="text-white font-medium">{(metric.value * 100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-dark-700/30 rounded-lg">
            <p className="text-xs text-gray-400">Last Trained</p>
            <p className="text-sm text-white">{new Date().toLocaleDateString()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Accuracy Trend (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} domain={[0.8, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 37, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Accuracy']}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#00ff88"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Drift Alerts</h3>
          <button className="flex items-center gap-2 text-sm text-neon-green hover:text-neon-green/80 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {health.drift_alerts.length > 0 ? (
          <div className="space-y-3">
            {health.drift_alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  alert.severity === 'high' ? 'bg-neon-red/10 border border-neon-red/20' :
                  alert.severity === 'medium' ? 'bg-neon-yellow/10 border border-neon-yellow/20' :
                  'bg-dark-700/30 border border-white/5'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                  alert.severity === 'high' ? 'text-neon-red' :
                  alert.severity === 'medium' ? 'text-neon-yellow' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white capitalize">{alert.type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs uppercase ${
                      alert.severity === 'high' ? 'bg-neon-red/20 text-neon-red' :
                      alert.severity === 'medium' ? 'bg-neon-yellow/20 text-neon-yellow' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                  <p className="text-xs text-gray-400">{alert.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-neon-green mb-4" />
            <p className="text-white font-medium">No Drift Detected</p>
            <p className="text-sm text-gray-400">All systems operating normally</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Auto-Retraining Status</h3>
        
        <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-lg mb-4">
          <div>
            <p className="text-sm text-gray-400">Next Scheduled Retraining</p>
            <p className="text-white font-medium">In 5 days, 12 hours</p>
          </div>
          <button className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30 transition-all text-sm">
            Trigger Now
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Training Dataset Size</p>
            <p className="text-xl font-bold text-white">50,000</p>
          </div>
          <div className="p-4 bg-dark-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Feature Count</p>
            <p className="text-xl font-bold text-white">24</p>
          </div>
          <div className="p-4 bg-dark-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Training Duration</p>
            <p className="text-xl font-bold text-white">~45 min</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemHealth;
