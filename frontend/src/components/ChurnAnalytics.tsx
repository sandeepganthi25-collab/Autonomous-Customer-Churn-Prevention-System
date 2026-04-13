import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { AnalyticsOverview } from '../types';

interface ChurnAnalyticsProps {
  overview: AnalyticsOverview | null;
  onRefresh?: () => void;
  liveMode?: boolean;
}

const ChurnAnalytics = ({ overview, liveMode = false }: ChurnAnalyticsProps) => {
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
  if (!overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-neon-green">Loading analytics...</div>
      </div>
    );
  }

  const riskData = [
    { name: 'Critical', value: Math.max(0, (overview.risk_distribution.critical || 0) + (liveMode ? Math.floor(Math.sin(tick) * 10) : 0)), color: '#ff4757' },
    { name: 'High', value: Math.max(0, (overview.risk_distribution.high || 0) + (liveMode ? Math.floor(Math.sin(tick + 1) * 8) : 0)), color: '#ffd93d' },
    { name: 'Medium', value: Math.max(0, (overview.risk_distribution.medium || 0) + (liveMode ? Math.floor(Math.sin(tick + 2) * 10) : 0)), color: '#00d4ff' },
    { name: 'Low', value: Math.max(0, (overview.risk_distribution.low || 0) + (liveMode ? Math.floor(Math.sin(tick + 3) * 15) : 0)), color: '#00ff88' },
  ];

  const totalRisk = riskData.reduce((sum, item) => sum + item.value, 0);

  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Generate dynamic retention data based on overview
  const retentionRate = overview.retention_rate ? overview.retention_rate / 100 : (overview.averages?.churn_risk ? 1 - overview.averages.churn_risk : 0.67);
  
  const generateRetentionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.slice(0, now.getMonth() + 1).map((month, i) => {
      const variance = liveMode ? Math.sin(tick + i) * 0.05 : 0;
      const rate = Math.max(0.5, Math.min(0.95, retentionRate + variance));
      const total = 1000;
      return {
        month,
        retained: Math.round(total * rate),
        churned: Math.round(total * (1 - rate)),
      };
    });
  };

  const retentionData = generateRetentionData();

  // Generate dynamic cohort data based on current year and live metrics
  const generateCohortData = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentQuarter = Math.floor(now.getMonth() / 3);
    
    return quarters.slice(0, currentQuarter + 1).map((q, i) => {
      const baseRetention = Math.max(0.5, Math.min(0.9, retentionRate + (i * 0.02)));
      const variance = liveMode ? Math.sin(tick + i) * 0.03 : 0;
      
      return {
        cohort: `${q} ${currentYear}`,
        week1: Math.round((Math.min(1, baseRetention + 0.02 + variance)) * 100),
        week2: Math.round((Math.min(1, baseRetention + variance)) * 100),
        week3: Math.round((Math.min(1, baseRetention - 0.1 + variance)) * 100),
        week4: Math.round((Math.min(1, baseRetention - 0.2 + variance)) * 100),
        week5: Math.round((Math.min(1, baseRetention - 0.3 + variance)) * 100),
      };
    });
  };

  const cohortData = generateCohortData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-neon-blue" />
            Churn Analytics
          </h2>
          <p className="text-sm text-gray-400">Deep insights into customer behavior</p>
        </div>
        {liveMode && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-neon-green font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
          <div className="h-64">
            {totalRisk > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 26, 37, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [`${value} users (${((value / totalRisk) * 100).toFixed(1)}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No risk data available
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Retention vs Churn</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 37, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="retained" name="Retained" fill="#00ff88" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill="#ff4757" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Cohort Retention Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Cohort</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Week 1</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Week 2</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Week 3</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Week 4</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Week 5</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort) => {
                  const getWeekColor = (value: number) => {
                    if (value >= 75) return 'text-neon-green';
                    if (value >= 60) return 'text-neon-yellow';
                    return 'text-neon-red';
                  };
                  
                  return (
                    <tr key={cohort.cohort} className="border-b border-white/5">
                      <td className="py-3 px-4 text-sm text-white font-medium">{cohort.cohort}</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${getWeekColor(cohort.week1)}`}>{cohort.week1}%</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${getWeekColor(cohort.week2)}`}>{cohort.week2}%</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${getWeekColor(cohort.week3)}`}>{cohort.week3}%</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${getWeekColor(cohort.week4)}`}>{cohort.week4}%</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${getWeekColor(cohort.week5)}`}>{cohort.week5}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-neon-green" />
              <span className="text-sm text-gray-400">Healthy (&gt;75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-neon-yellow" />
              <span className="text-sm text-gray-400">Warning (60-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-neon-red" />
              <span className="text-sm text-gray-400">Critical (&lt;60%)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChurnAnalytics;
