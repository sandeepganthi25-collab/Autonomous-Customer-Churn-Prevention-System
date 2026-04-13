import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, ArrowUp, ArrowDown, Minus, User, ShoppingCart, Mail, Bell } from 'lucide-react';
import type { ChurnEvent } from '../types';

interface EventStreamTickerProps {
  events: ChurnEvent[];
  isConnected: boolean;
  onRefresh?: () => void;
  liveMode?: boolean;
}

const EventStreamTicker = ({ events, isConnected, liveMode = false }: EventStreamTickerProps) => {
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
  const getEventIcon = (eventType: string) => {
    if (eventType.includes('login')) return User;
    if (eventType.includes('purchase')) return ShoppingCart;
    if (eventType.includes('email')) return Mail;
    if (eventType.includes('churn')) return Minus;
    return Bell;
  };

  const getEventColor = (eventType: string, data?: any) => {
    if (eventType === 'ai_decision') return 'border-neon-purple';
    if (eventType.includes('increase') || data?.risk_level === 'critical') return 'border-neon-red';
    if (eventType.includes('decrease')) return 'border-neon-green';
    if (eventType.includes('purchase')) return 'border-neon-blue';
    return 'border-gray-500';
  };

  const getEventBg = (eventType: string) => {
    if (eventType === 'ai_decision') return 'bg-neon-purple/10';
    if (eventType.includes('increase')) return 'bg-neon-red/10';
    if (eventType.includes('decrease')) return 'bg-neon-green/10';
    return 'bg-dark-700/30';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-neon-blue" />
            Real-Time Event Stream
          </h2>
          <p className="text-sm text-gray-400">Live feed of user events and AI decisions</p>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isConnected ? 'bg-neon-green/20 border border-neon-green/30' : 'bg-neon-red/20 border border-neon-red/30'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-neon-green font-medium">Connected</span>
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-neon-red" />
              <span className="text-sm text-neon-red font-medium">Disconnected</span>
            </>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-dark-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Event Ticker</span>
            <span className="text-sm text-gray-400">{events.length} events</span>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4">
          <div className="space-y-2">
            {events.slice().reverse().map((event, index) => {
              const Icon = getEventIcon(event.event_type);
              const borderColor = getEventColor(event.event_type, event.data);
              const bgColor = getEventBg(event.event_type);

              return (
                <motion.div
                  key={event.event_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${bgColor} ${borderColor}`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-700/50">
                    <Icon className={`w-5 h-5 ${
                      event.event_type === 'ai_decision' ? 'text-neon-purple' :
                      event.event_type.includes('increase') ? 'text-neon-red' :
                      event.event_type.includes('decrease') ? 'text-neon-green' :
                      'text-gray-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {event.data?.user_name || event.user_id}
                      </span>
                      {event.data?.action_taken && (
                        <span className="px-2 py-0.5 rounded text-xs bg-neon-purple/20 text-neon-purple">
                          {event.data.action_taken}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {event.data?.description || event.event_type}
                      {event.data?.risk_score && (
                        <span className={`ml-2 ${
                          event.data.risk_score > 0.7 ? 'text-neon-red' :
                          event.data.risk_score > 0.4 ? 'text-neon-yellow' : 'text-neon-green'
                        }`}>
                          Risk: {(event.data.risk_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Activity className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400">Waiting for events...</p>
              <p className="text-sm text-gray-500">Events will appear here in real-time</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'AI Decisions', count: events.filter(e => e.event_type === 'ai_decision').length + (liveMode ? tick : 0), color: 'neon-purple' },
          { label: 'Risk Increases', count: events.filter(e => e.event_type.includes('increase')).length + (liveMode ? Math.floor(tick * 0.5) : 0), color: 'neon-red' },
          { label: 'Risk Decreases', count: events.filter(e => e.event_type.includes('decrease')).length + (liveMode ? Math.floor(tick * 0.3) : 0), color: 'neon-green' },
          { label: 'User Events', count: events.filter(e => !e.event_type.includes('increase') && !e.event_type.includes('decrease') && e.event_type !== 'ai_decision').length + (liveMode ? tick : 0), color: 'neon-blue' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 text-center"
          >
            <div className={`text-3xl font-bold ${liveMode ? 'animate-pulse' : ''} ${stat.color === 'neon-purple' ? 'text-neon-purple' : stat.color === 'neon-red' ? 'text-neon-red' : stat.color === 'neon-green' ? 'text-neon-green' : 'text-neon-blue'} mb-1`}>
              {stat.count}
            </div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventStreamTicker;
