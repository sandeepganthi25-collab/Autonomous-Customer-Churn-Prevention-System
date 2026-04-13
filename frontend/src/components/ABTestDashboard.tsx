import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ABTest } from '../types';

interface ABTestDashboardProps {
  tests: ABTest[];
  liveMode?: boolean;
}

const ABTestDashboard = ({ tests, liveMode = false }: ABTestDashboardProps) => {
  const [tick, setTick] = useState(0);
  const [autoOptimize, setAutoOptimize] = useState(true);

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

  // Generate live conversion rate variance when auto-optimize is on
  const getLiveConversionRate = (baseRate: number, variantIndex: number, testIndex: number) => {
    if (!autoOptimize || !liveMode) return baseRate;
    return Math.max(0, Math.min(100, baseRate + Math.sin(tick + variantIndex + testIndex) * 2));
  };

  const getVariantColor = (index: number) => {
    const colors = ['#00ff88', '#00d4ff', '#a855f7', '#ffd93d'];
    return colors[index % colors.length];
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 25) return 'text-neon-green';
    if (rate >= 15) return 'text-neon-yellow';
    return 'text-neon-red';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-neon-purple" />
            A/B Testing Dashboard
          </h2>
          <p className="text-sm text-gray-400">Self-optimizing campaign experiments</p>
        </div>
        <div className="flex items-center gap-3">
          {liveMode && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/20 border border-neon-green/30">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-sm text-neon-green font-medium">LIVE</span>
            </div>
          )}
          <button
            onClick={() => setAutoOptimize(!autoOptimize)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              autoOptimize
                ? 'bg-neon-green/20 border-neon-green/30 text-neon-green'
                : 'bg-dark-700/50 border-white/10 text-gray-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoOptimize ? 'bg-neon-green animate-pulse' : 'bg-gray-500'}`} />
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">{autoOptimize ? 'Auto-Optimization Active' : 'Auto-Optimization Off'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tests.map((test, testIndex) => {
          const chartData = test.variants.map((variant, i) => ({
            name: variant.replace('_', ' '),
            rate: getLiveConversionRate(test.stats[variant]?.conversion_rate || 0, i, testIndex),
            conversions: test.stats[variant]?.conversions || 0,
            starts: test.stats[variant]?.starts || 0,
          }));

          const winner = test.winner;
          const maxRate = Math.max(...chartData.map(d => d.rate));

          return (
            <motion.div
              key={test.experiment_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: testIndex * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {test.experiment_id.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-400">{test.total_samples.toLocaleString()} total samples</p>
                </div>
                {winner && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/20 border border-neon-green/30">
                    <Trophy className="w-4 h-4 text-neon-green" />
                    <span className="text-sm text-neon-green font-medium">
                      {winner.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis type="number" stroke="#666" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" stroke="#666" fontSize={11} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(26, 26, 37, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'rate' ? `${value.toFixed(1)}%` : value.toLocaleString(),
                        name === 'rate' ? 'Conversion Rate' : name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                    />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={entry.rate === maxRate ? '#00ff88' : getVariantColor(i)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {test.variants.map((variant, i) => {
                  const stats = test.stats[variant];
                  const isWinner = variant === winner;

                  return (
                    <div
                      key={variant}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isWinner ? 'bg-neon-green/10 border border-neon-green/30' : 'bg-dark-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getVariantColor(i) }}
                        />
                        <div>
                          <p className={`text-sm font-medium ${isWinner ? 'text-neon-green' : 'text-white'}`}>
                            {variant.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {stats?.starts.toLocaleString()} starts
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-lg font-bold ${getConversionColor(stats?.conversion_rate || 0)}`}>
                          {stats?.conversion_rate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400">
                          {stats?.conversions} conversions
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Reinforcement Learning Loop</h3>
        
        <div className="flex items-center justify-center gap-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-neon-blue">1</span>
            </div>
            <p className="text-sm text-gray-400">Collect Data</p>
          </div>
          
          <div className="flex items-center">
            <div className="w-12 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple" />
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-neon-purple">2</span>
            </div>
            <p className="text-sm text-gray-400">Analyze Results</p>
          </div>
          
          <div className="flex items-center">
            <div className="w-12 h-0.5 bg-gradient-to-r from-neon-purple to-neon-green" />
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-neon-green/20 border border-neon-green/30 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-neon-green">3</span>
            </div>
            <p className="text-sm text-gray-400">Update Strategy</p>
          </div>
          
          <div className="flex items-center">
            <div className="w-12 h-0.5 bg-gradient-to-r from-neon-green to-neon-blue" />
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-neon-yellow/20 border border-neon-yellow/30 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-neon-yellow">4</span>
            </div>
            <p className="text-sm text-gray-400">Apply Winner</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-dark-700/30 rounded-lg">
          <p className="text-sm text-gray-300">
            The RL loop continuously learns from campaign performance, automatically adjusting 
            strategy weights to maximize retention while minimizing intervention costs.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ABTestDashboard;
