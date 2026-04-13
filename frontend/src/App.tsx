import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Users, TrendingDown, Zap, Shield, Wifi, WifiOff, Upload, RefreshCw, Database, Settings, Clock, Calendar, LogOut } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import UserIntelligence from './components/UserIntelligence';
import AIDecisionFeed from './components/AIDecisionFeed';
import ChurnAnalytics from './components/ChurnAnalytics';
import ABTestDashboard from './components/ABTestDashboard';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import EventStreamTicker from './components/EventStreamTicker';
import DigitalTwinSimulator from './components/DigitalTwinSimulator';
import SystemHealth from './components/SystemHealth';
import DatasetUpload from './components/DatasetUpload';
import Login from './components/Login';
import SettingsPanel from './components/Settings';
import { fetchAnalyticsOverview, fetchLiveAnalytics, fetchHighRiskUsers, fetchLiveUsers, fetchABTests, fetchLiveABTests, fetchSystemHealth, fetchLiveSystemHealth } from './api';
import type { AnalyticsOverview, User, ABTest, SystemHealth as SystemHealthType, ChurnEvent } from './types';

type TabType = 'overview' | 'users' | 'ai' | 'analytics' | 'ab-tests' | 'explainability' | 'events' | 'twin' | 'health' | 'upload';

const tabs = [
  { id: 'overview', label: 'Control Panel', icon: Activity },
  { id: 'users', label: 'User Intelligence', icon: Users },
  { id: 'ai', label: 'AI Decisions', icon: Brain },
  { id: 'analytics', label: 'Analytics', icon: TrendingDown },
  { id: 'ab-tests', label: 'A/B Tests', icon: Zap },
  { id: 'explainability', label: 'Explainability', icon: Shield },
  { id: 'events', label: 'Event Stream', icon: Activity },
  { id: 'twin', label: 'Digital Twin', icon: Brain },
  { id: 'health', label: 'System Health', icon: Shield },
  { id: 'upload', label: 'Upload Dataset', icon: Upload },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [highRiskUsers, setHighRiskUsers] = useState<User[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthType | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [isConnected, setIsConnected] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [events, setEvents] = useState<ChurnEvent[]>([]);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appearance');
    return saved ? JSON.parse(saved) : { darkMode: true, compactView: false, animations: true };
  });

  // Real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Apply appearance settings
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
    
    if (settings.animations) {
      document.body.classList.add('animations-enabled');
      document.body.classList.remove('animations-disabled');
    } else {
      document.body.classList.add('animations-disabled');
      document.body.classList.remove('animations-enabled');
    }
  }, [settings.darkMode, settings.animations]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (user: { email: string; name: string }) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowSettings(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  };

  const fetchDashboardData = useCallback(async (useLive = false) => {
    setIsRefreshing(true);
    try {
      let overviewData, usersData, abTestsData, healthData;
      
      if (useLive) {
        [overviewData, usersData, abTestsData, healthData] = await Promise.all([
          fetchLiveAnalytics(),
          fetchLiveUsers(100),
          fetchLiveABTests(),
          fetchLiveSystemHealth(),
        ]);
        
        // Generate live events
        const eventTypes = [
          { type: 'churn_risk_increase', desc: 'Churn risk increased', riskDelta: 0.05 },
          { type: 'churn_risk_decrease', desc: 'Churn risk decreased', riskDelta: -0.03 },
          { type: 'ai_decision', desc: 'AI decision made', riskDelta: 0 },
          { type: 'user_login', desc: 'User logged in', riskDelta: -0.01 },
          { type: 'purchase', desc: 'Purchase completed', riskDelta: -0.02 },
          { type: 'retention_offer', desc: 'Retention offer sent', riskDelta: -0.02 },
          { type: 'engagement_campaign', desc: 'Engagement campaign triggered', riskDelta: -0.01 },
        ];
        
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const randomUser = usersData[Math.floor(Math.random() * usersData.length)];
        const riskLevels = ['critical', 'high', 'medium', 'low'];
        
        const liveEvent: ChurnEvent = {
          event_id: `EVT_${Date.now()}`,
          user_id: randomUser?.user_id || 'SYSTEM',
          event_type: randomEvent.type,
          timestamp: new Date().toISOString(),
          data: {
            user_name: randomUser?.name || 'System',
            description: randomEvent.desc,
            risk_score: randomUser?.churn_risk || 0.5,
            risk_level: randomUser?.risk_level || riskLevels[Math.floor(Math.random() * riskLevels.length)],
            confidence: Math.round((0.7 + Math.random() * 0.25) * 100),
            action_taken: randomEvent.type.includes('decision') ? 'monitor' : randomEvent.type === 'purchase' ? 'success' : 'pending',
          }
        };
        setEvents(prev => [...prev.slice(-99), liveEvent]);
      } else {
        [overviewData, usersData, abTestsData, healthData] = await Promise.all([
          fetchAnalyticsOverview(),
          fetchHighRiskUsers(50),
          fetchABTests(),
          fetchSystemHealth(),
        ]);
        
        const eventTypes = [
          { type: 'churn_risk_increase', desc: 'Churn risk increased', riskDelta: 0.05 },
          { type: 'churn_risk_decrease', desc: 'Churn risk decreased', riskDelta: -0.03 },
          { type: 'ai_decision', desc: 'AI decision made', riskDelta: 0 },
          { type: 'user_login', desc: 'User logged in', riskDelta: -0.01 },
          { type: 'purchase', desc: 'Purchase completed', riskDelta: -0.02 },
        ];
        
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const randomUser = usersData[Math.floor(Math.random() * usersData.length)];
        
        const liveEvent: ChurnEvent = {
          event_id: `EVT_${Date.now()}`,
          user_id: randomUser?.user_id || 'SYSTEM',
          event_type: randomEvent.type,
          timestamp: new Date().toISOString(),
          data: {
            user_name: randomUser?.name || 'System',
            description: randomEvent.desc,
            risk_score: randomUser?.churn_risk || 0.5,
            risk_level: randomUser?.risk_level || 'medium',
          }
        };
        setEvents(prev => [...prev.slice(-99), liveEvent]);
      }
      
      setOverview(overviewData);
      setHighRiskUsers(usersData);
      setAbTests(abTestsData);
      setSystemHealth(healthData);
      setLastUpdated(new Date());
      
      const response = await fetch('/api/health');
      setIsConnected(response.ok);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setIsConnected(false);
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData(false);
    }
  }, [isLoggedIn, fetchDashboardData]);

  useEffect(() => {
    if (!isLoggedIn || !liveMode) return;
    
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [liveMode, isLoggedIn, fetchDashboardData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ControlPanel overview={overview} systemHealth={systemHealth} events={events} liveMode={liveMode} onRefresh={fetchDashboardData} />;
      case 'users':
        return <UserIntelligence users={highRiskUsers} onSelectUser={setSelectedUser} onRefresh={fetchDashboardData} liveMode={liveMode} />;
      case 'ai':
        return <AIDecisionFeed users={highRiskUsers} onRefresh={fetchDashboardData} liveMode={liveMode} onSelectUser={(user) => { setSelectedUser(user); setActiveTab('users'); }} />;
      case 'analytics':
        return <ChurnAnalytics overview={overview} onRefresh={fetchDashboardData} liveMode={liveMode} />;
      case 'ab-tests':
        return <ABTestDashboard tests={abTests} liveMode={liveMode} />;
      case 'explainability':
        return <ExplainabilityPanel user={selectedUser} users={highRiskUsers} liveMode={liveMode} />;
      case 'events':
        return <EventStreamTicker events={events} isConnected={isConnected} onRefresh={fetchDashboardData} liveMode={liveMode} />;
      case 'twin':
        return <DigitalTwinSimulator user={selectedUser} users={highRiskUsers} liveMode={liveMode} />;
      case 'health':
        return <SystemHealth health={systemHealth} onRefresh={fetchDashboardData} liveMode={liveMode} />;
      case 'upload':
        return <DatasetUpload onAnalysisComplete={fetchDashboardData} />;
      default:
        return <ControlPanel overview={overview} systemHealth={systemHealth} events={events} liveMode={liveMode} onRefresh={fetchDashboardData} />;
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern">
      <header className="glass-card border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Brain className="w-10 h-10 text-neon-green" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-10 h-10 text-neon-green/30" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Churn Prevention <span className="text-neon-green">AI</span>
                </h1>
                <p className="text-sm text-gray-400">Autonomous Customer Retention System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Real-time Clock */}
              <div className="flex items-center gap-4 px-4 py-2 glass-card rounded-lg">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Clock className="w-5 h-5 text-neon-green" />
                    {currentTime.toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => fetchDashboardData()}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>

              <button
                onClick={() => setLiveMode(!liveMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  liveMode 
                    ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
                    : 'bg-dark-700/50 text-gray-400 border-white/10'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${liveMode ? 'bg-neon-green animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm font-medium">{liveMode ? 'Live' : 'Offline'}</span>
                {liveMode && <RefreshCw className="w-3 h-3 animate-spin" />}
              </button>

              {overview && (
                <div className="text-right">
                  <div className={`text-2xl font-bold ${liveMode ? 'text-neon-green animate-pulse' : 'text-white'}`}>
                    {((liveMode && overview.active_users) || overview.total_users).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">{liveMode ? 'Active Users (Live)' : 'Total Users'}</div>
                </div>
              )}



              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700/50 text-gray-400 border border-white/10 hover:bg-dark-700 hover:text-white transition-all"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden md:inline">Settings</span>
              </button>

              {/* Quick Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-red/10 text-neon-red border border-neon-red/30 hover:bg-neon-red/20 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-neon-green">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-400">{currentUser?.email || ''}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                    : 'bg-dark-700/30 text-gray-400 border border-transparent hover:bg-dark-700/50 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-6">
        {renderContent()}
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
        currentUser={currentUser}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

export default App;
