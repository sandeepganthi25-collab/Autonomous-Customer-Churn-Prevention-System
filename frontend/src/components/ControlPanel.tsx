import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsOverview, SystemHealth, ChurnEvent } from '../types';

interface ControlPanelProps {
  overview: AnalyticsOverview | null;
  systemHealth: SystemHealth | null;
  events: ChurnEvent[];
  liveMode?: boolean;
  onRefresh?: () => void;
}

const ControlPanel = ({ overview, systemHealth, events, liveMode = false }: ControlPanelProps) => {
  const [tick, setTick] = useState(0);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('day');
  
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

  const getTimeRangeConfig = () => {
    switch (timeFilter) {
      case 'week':
        return { points: 7, label: 'Day', getLabel: (i: number) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        }};
      case 'month':
        return { points: 30, label: 'Day', getLabel: (i: number) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return d.getDate().toString();
        }};
      case 'year':
        return { points: 12, label: 'Month', getLabel: (i: number) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (11 - i));
          return d.toLocaleDateString('en-US', { month: 'short' });
        }};
      default:
        return { points: 24, label: 'Hour', getLabel: (i: number) => {
          const h = new Date();
          h.setHours(h.getHours() - (23 - i));
          return h.toLocaleTimeString('en-US', { hour: '2-digit' });
        }};
    }
  };

  const trendData = useMemo(() => {
    const config = getTimeRangeConfig();
    const baseChurn = overview?.churn_rate ? overview.churn_rate / 100 : 0.328;
    const baseRetention = overview?.retention_rate ? overview.retention_rate / 100 : 0.672;
    
    if (liveMode) {
      const data = [];
      const now = new Date();
      
      for (let i = config.points - 1; i >= 0; i--) {
        let date: Date;
        let label: string;
        
        switch (timeFilter) {
          case 'week':
            date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            break;
          case 'month':
            date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            break;
          case 'year':
            date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
            label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            break;
          default: // day
            date = new Date(now.getTime() - i * 60 * 60 * 1000);
            label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Add variance based on how far back in time
        const timeDecay = (config.points - i) / config.points;
        const variance = (Math.sin(i * 0.5 + tick * 0.1) * 0.03) + (Math.random() * 0.02 - 0.01);
        
        data.push({
          time: label,
          churnRate: Math.max(0.05, Math.min(0.50, baseChurn + variance + (timeDecay * 0.02))),
          retentionRate: Math.max(0.50, Math.min(0.95, baseRetention - variance - (timeDecay * 0.015))),
        });
      }
      return data;
    }
    
    const data = [];
    for (let i = 0; i < config.points; i++) {
      const variance = Math.random() * 0.02 - 0.01;
      data.push({
        time: config.getLabel(i),
        churnRate: Math.max(0.05, Math.min(0.50, baseChurn + variance)),
        retentionRate: Math.max(0.50, Math.min(0.95, baseRetention - variance)),
      });
    }
    return data;
  }, [overview, tick, timeFilter, liveMode]);

  const liveValues = useMemo(() => {
    if (!liveMode) return null;
    
    return {
      churnRate: overview?.churn_rate !== undefined 
        ? overview.churn_rate + (Math.sin(tick) * 3) 
        : ((overview?.averages?.churn_risk ?? 0.328) * 100) + (Math.sin(tick) * 3),
      activeUsers: overview?.active_users !== undefined 
        ? overview.active_users + Math.floor(Math.sin(tick * 0.5) * 20)
        : Math.floor((overview?.total_users || 1000) * 0.85) + Math.floor(Math.sin(tick * 0.5) * 20),
      revenueAtRisk: overview?.revenue_at_risk !== undefined 
        ? overview.revenue_at_risk + Math.floor(Math.sin(tick * 0.3) * 5000)
        : 66900 + Math.floor(Math.sin(tick * 0.3) * 5000),
      criticalUsers: overview?.risk_distribution?.critical !== undefined 
        ? overview.risk_distribution.critical + Math.floor(Math.sin(tick * 0.7) * 10)
        : 59 + Math.floor(Math.sin(tick * 0.7) * 10),
      retentionRate: overview?.retention_rate !== undefined 
        ? overview.retention_rate - (Math.sin(tick) * 2)
        : ((1 - (overview?.averages.churn_risk || 0.328)) * 100) - (Math.sin(tick) * 2),
      potentialSavings: overview?.potential_savings !== undefined 
        ? overview.potential_savings + Math.floor(Math.sin(tick * 0.4) * 2000)
        : 25000 + Math.floor(Math.sin(tick * 0.4) * 2000),
      riskDistribution: {
        critical: (overview?.risk_distribution?.critical || 59) + Math.floor(Math.sin(tick * 0.7) * 10),
        high: (overview?.risk_distribution?.high || 98) + Math.floor(Math.sin(tick * 0.6) * 8),
        medium: (overview?.risk_distribution?.medium || 203) + Math.floor(Math.sin(tick * 0.5) * 10),
        low: (overview?.risk_distribution?.low || 640) + Math.floor(Math.sin(tick * 0.4) * 15),
      },
    };
  }, [overview, liveMode, tick]);

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-neon-green">Loading dashboard...</div>
      </div>
    );
  }

  const churnRate = liveValues ? Math.max(20, Math.min(50, liveValues.churnRate)) : (overview.churn_rate !== undefined ? overview.churn_rate : (overview.averages.churn_risk * 100));
  const retentionRate = liveValues ? Math.max(50, Math.min(85, liveValues.retentionRate)) : (overview.retention_rate !== undefined ? overview.retention_rate : ((1 - overview.averages.churn_risk) * 100));
  const activeUsers = liveValues ? Math.max(700, Math.min(950, liveValues.activeUsers)) : (overview.active_users !== undefined ? overview.active_users : Math.round(overview.total_users * 0.85));
  const revenueAtRisk = liveValues ? Math.max(40000, Math.min(100000, liveValues.revenueAtRisk)) : overview.revenue_at_risk;
  const criticalUsers = liveValues ? Math.max(20, Math.min(400, liveValues.criticalUsers)) : overview.risk_distribution.critical;
  const potentialSavings = liveValues ? Math.max(20000, Math.min(60000, liveValues.potentialSavings)) : overview.potential_savings;
  const riskDistribution = liveValues ? liveValues.riskDistribution : overview.risk_distribution;

  const stats = [
    {
      label: 'Churn Rate',
      value: `${churnRate.toFixed(1)}%`,
      trend: churnRate > 15 ? -1 : 1,
      icon: TrendingDown,
      color: churnRate > 15 ? 'text-neon-red' : 'text-neon-green',
    },
    {
      label: 'Active Users',
      value: activeUsers.toLocaleString(),
      trend: 1,
      icon: Users,
      color: 'text-neon-blue',
    },
    {
      label: 'Revenue at Risk',
      value: `$${revenueAtRisk.toLocaleString()}`,
      trend: -1,
      icon: DollarSign,
      color: 'text-neon-yellow',
    },
    {
      label: 'Critical Users',
      value: Math.max(0, criticalUsers).toString(),
      trend: criticalUsers > 50 ? -1 : 1,
      icon: AlertTriangle,
      color: criticalUsers > 50 ? 'text-neon-red' : 'text-neon-yellow',
    },
    {
      label: 'Retention Rate',
      value: `${retentionRate.toFixed(1)}%`,
      trend: 1,
      icon: CheckCircle,
      color: 'text-neon-green',
    },
    {
      label: 'AI Decisions/h',
      value: Math.round((events.length + tick) * 12).toString(),
      trend: 1,
      icon: Activity,
      color: 'text-neon-purple',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Control Panel</h2>
        {liveMode && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-neon-green font-medium">LIVE MODE</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-4 ${liveMode ? 'neon-border' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-bold ${liveMode ? 'animate-pulse' : ''} ${stat.color}`}>{stat.value}</span>
              {stat.trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-neon-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-neon-red" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Real-Time Churn Trend</h3>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-dark-700/50 rounded-lg p-1">
                {(['day', 'week', 'month', 'year'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      timeFilter === filter
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              {liveMode && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/20 border border-neon-green/30">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-xs text-neon-green font-medium">LIVE</span>
                </div>
              )}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4757" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff4757" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 37, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="churnRate"
                  stroke="#ff4757"
                  fill="url(#churnGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="retentionRate"
                  stroke="#00ff88"
                  fill="url(#retentionGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Risk Distribution</h3>
            {liveMode && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/20 border border-neon-green/30">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-xs text-neon-green font-medium">LIVE</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {Object.entries(riskDistribution).map(([level, count]) => {
              const total = Object.values(riskDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = {
                critical: 'bg-neon-red',
                high: 'bg-neon-yellow',
                medium: 'bg-neon-blue',
                low: 'bg-neon-green',
              };
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`capitalize ${level === 'critical' ? 'text-neon-red' : level === 'high' ? 'text-neon-yellow' : level === 'medium' ? 'text-neon-blue' : 'text-neon-green'}`}>
                      {level}
                    </span>
                    <span className="text-gray-400">
                      {Math.max(0, count).toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      key={`${level}-${tick}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${colors[level as keyof typeof colors]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Potential Savings</span>
              <span className="text-xl font-bold text-neon-green">
                ${Math.max(0, potentialSavings).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent AI Decisions</h3>
          {liveMode && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/20 border border-neon-green/30">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-neon-green font-medium">LIVE</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {events.slice(-5).reverse().map((event, index) => (
            <motion.div
              key={event.event_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  event.data?.risk_level === 'critical' ? 'bg-neon-red animate-pulse' :
                  event.data?.risk_level === 'high' ? 'bg-neon-yellow' :
                  event.data?.risk_level === 'medium' ? 'bg-neon-blue' : 'bg-neon-green'
                }`} />
                <div>
                  <p className="text-sm text-white">{event.data?.user_name || event.user_id}</p>
                  <p className="text-xs text-gray-400">{event.data?.description || event.event_type}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  event.data?.risk_level === 'critical' ? 'text-neon-red' :
                  event.data?.risk_level === 'high' ? 'text-neon-yellow' : 'text-neon-green'
                }`}>
                  {event.data?.risk_score ? `${(event.data.risk_score * 100).toFixed(0)}%` : ''}
                </span>
                <p className="text-xs text-gray-400">{event.data?.action_taken || 'Analyzing...'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ControlPanel;
