import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Moon, Globe, LogOut, User, Lock, Eye, EyeOff, Save, X, Check, FileText, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentUser: { email: string; name: string } | null;
  onSettingsChange?: (settings: { darkMode: boolean; animations: boolean }) => void;
}

const SettingsPanel = ({ isOpen, onClose, onLogout, currentUser, onSettingsChange }: SettingsProps) => {
  const [activeTab, setActiveTab] = useState('security');
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      pushNotifications: true,
      weeklyReport: false,
      criticalOnly: true
    };
  });
  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('security');
    return saved ? JSON.parse(saved) : {
      twoFactor: false,
      sessionTimeout: '30',
      ipWhitelist: false,
      ipAddresses: []
    };
  });
  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('appearance');
    return saved ? JSON.parse(saved) : {
      darkMode: true,
      compactView: false,
      animations: true
    };
  });
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // IP whitelist modal state
  const [newIpAddress, setNewIpAddress] = useState('');
  
  // Session timeout notification
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('security', JSON.stringify(security));
  }, [security]);

  useEffect(() => {
    localStorage.setItem('appearance', JSON.stringify(appearance));
    onSettingsChange?.(appearance);
  }, [appearance, onSettingsChange]);

  useEffect(() => {
    if (!localStorage.getItem('appearance')) {
      const defaultSettings = { darkMode: true, compactView: false, animations: true };
      localStorage.setItem('appearance', JSON.stringify(defaultSettings));
    }
  }, []);

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'terms', label: 'Terms & Privacy', icon: FileText },
    { id: 'account', label: 'Account', icon: User },
  ];

  const handleLogout = () => {
    onLogout();
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userEmail = currentUser?.email;
    const userIndex = storedUsers.findIndex((u: any) => u.email === userEmail);
    
    if (userIndex === -1 || storedUsers[userIndex].password !== currentPassword) {
      setPasswordError('Current password is incorrect');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    storedUsers[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(storedUsers));
    
    setPasswordSuccess('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  };

  const handleAddIpAddress = () => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIpAddress)) {
      return;
    }
    
    const ips = security.ipAddresses || [];
    if (!ips.includes(newIpAddress)) {
      setSecurity({
        ...security,
        ipAddresses: [...ips, newIpAddress]
      });
    }
    setNewIpAddress('');
  };

  const handleRemoveIpAddress = (ip: string) => {
    const ips = security.ipAddresses || [];
    setSecurity({
      ...security,
      ipAddresses: ips.filter((i: string) => i !== ip)
    });
  };

  // Session timeout handler
  useEffect(() => {
    if (security.sessionTimeout === 'never' || security.sessionTimeout === '0') return;
    
    const timeoutMs = parseInt(security.sessionTimeout) * 60 * 1000;
    const warningMs = timeoutMs - 60000; // 1 minute warning
    
    const warningTimer = setTimeout(() => {
      setSessionWarning(true);
    }, warningMs);
    
    const logoutTimer = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
    
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, [security.sessionTimeout]);

  const handleCloseSettings = () => {
    setSessionWarning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseSettings} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative ml-auto w-full max-w-2xl h-full bg-dark-800 glass-card border-l border-white/10 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-neon-green" />
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button onClick={handleCloseSettings} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* Sidebar */}
          <div className="w-56 border-r border-white/10 p-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neon-green/20 text-neon-green'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Session Warning Banner */}
            {sessionWarning && (
              <div className="mb-4 p-4 bg-neon-yellow/20 border border-neon-yellow/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-neon-yellow" />
                <p className="text-neon-yellow text-sm">Your session will expire in 1 minute. Save your work!</p>
                <button onClick={() => setSessionWarning(false)} className="ml-auto text-neon-yellow hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-neon-green" />
                  Security Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass-card">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">Add extra security to your account</p>
                      {security.twoFactor && (
                        <p className="text-xs text-neon-green mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        security.twoFactor ? 'bg-neon-green' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        security.twoFactor ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 glass-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-medium">Session Timeout</p>
                      <span className="text-sm text-neon-green">{security.sessionTimeout === 'never' ? 'Disabled' : `${security.sessionTimeout} min`}</span>
                    </div>
                    <div className="flex gap-2">
                      {['15', '30', '60', 'never'].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSecurity({ ...security, sessionTimeout: val })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                            security.sessionTimeout === val
                              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                              : 'bg-dark-700 text-gray-400 border border-transparent hover:text-white'
                          }`}
                        >
                          {val === 'never' ? 'Never' : `${val}m`}
                        </button>
                      ))}
                    </div>
                    {security.sessionTimeout !== 'never' && (
                      <p className="text-xs text-gray-500 mt-2">
                        Auto logout after {security.sessionTimeout} minutes of inactivity
                      </p>
                    )}
                  </div>

                  <div className="p-4 glass-card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">IP Whitelist</p>
                        <p className="text-sm text-gray-400">Restrict access by IP address</p>
                      </div>
                      <button
                        onClick={() => setSecurity({ ...security, ipWhitelist: !security.ipWhitelist })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          security.ipWhitelist ? 'bg-neon-green' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                          security.ipWhitelist ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    
                    {security.ipWhitelist && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g., 192.168.1.1"
                            value={newIpAddress}
                            onChange={(e) => setNewIpAddress(e.target.value)}
                            className="flex-1 bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <button
                            onClick={handleAddIpAddress}
                            className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30"
                          >
                            Add
                          </button>
                        </div>
                        {(security.ipAddresses || []).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {(security.ipAddresses || []).map((ip: string) => (
                              <div key={ip} className="flex items-center justify-between bg-dark-700/50 px-3 py-2 rounded">
                                <span className="text-sm text-white font-mono">{ip}</span>
                                <button
                                  onClick={() => handleRemoveIpAddress(ip)}
                                  className="text-neon-red hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {(security.ipAddresses || []).length === 0 && (
                          <p className="text-xs text-gray-500">No IP addresses added yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-neon-green" />
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  {[
                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Get notified via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Summary of activity' },
                    { key: 'criticalOnly', label: 'Critical Alerts Only', desc: 'Only for high-risk users' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? 'bg-neon-green' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Moon className="w-5 h-5 text-neon-green" />
                  Appearance
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass-card">
                    <div>
                      <p className="text-white font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-400">Use dark theme</p>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, darkMode: !appearance.darkMode })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        appearance.darkMode ? 'bg-neon-green' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        appearance.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card">
                    <div>
                      <p className="text-white font-medium">Animations</p>
                      <p className="text-sm text-gray-400">Enable smooth animations</p>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        appearance.animations ? 'bg-neon-green' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        appearance.animations ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neon-green" />
                  Terms & Privacy Policy
                </h3>

                <div className="glass-card p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  <div>
                    <h4 className="text-white font-semibold mb-2">1. Terms of Service</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      By accessing and using ChurnAI, you agree to be bound by these Terms of Service. 
                      The service is provided "as is" without warranty of any kind. We reserve the right to 
                      modify these terms at any time without prior notice.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">2. Data Usage</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      All data uploaded to this system is processed locally and used solely for churn analysis 
                      and prediction purposes. We do not share your data with third parties. You retain 
                      ownership of all data you upload.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">3. Privacy Policy</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      We collect minimal information necessary to provide our services, including account 
                      credentials and usage analytics. Your personal information is encrypted and stored 
                      securely. You may request deletion of your account and associated data at any time.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">4. User Responsibilities</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      You agree to use the service in compliance with all applicable laws and regulations. 
                      You are responsible for maintaining the confidentiality of your account credentials 
                      and for all activities that occur under your account.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">5. Limitation of Liability</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      ChurnAI shall not be liable for any indirect, incidental, special, consequential, 
                      or punitive damages resulting from your use of or inability to use the service. 
                      Our total liability shall not exceed the amount paid by you for the service.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">6. Intellectual Property</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      All content, features, and functionality of ChurnAI are owned by us and are protected 
                      by copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">7. Cookie Policy</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      We use cookies and similar technologies to enhance your experience, analyze usage 
                      patterns, and deliver personalized content. You can control cookie preferences through 
                      your browser settings.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">8. GDPR Compliance</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      For users in the European Union, we comply with GDPR requirements including the right 
                      to access, rectify, erase, and port your personal data. Contact us to exercise these rights.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-neon-green" />
                  Account Settings
                </h3>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-neon-green">
                        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg">{currentUser?.name || 'User'}</p>
                      <p className="text-gray-400">{currentUser?.email || 'user@example.com'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="w-full py-3 px-4 glass-card hover:bg-white/5 text-left text-white rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Change Password
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {showPasswordForm && (
                      <div className="p-4 bg-dark-700/50 rounded-lg space-y-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block">Current Password</label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block">Confirm New Password</label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                          
                          {passwordError && (
                            <div className="flex items-center gap-2 text-neon-red text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {passwordError}
                            </div>
                          )}
                          
                          {passwordSuccess && (
                            <div className="flex items-center gap-2 text-neon-green text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              {passwordSuccess}
                            </div>
                          )}
                          
                          <button
                            onClick={handlePasswordChange}
                            className="w-full py-2 px-4 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Update Password
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-4 px-6 bg-neon-red/20 text-neon-red border border-neon-red/30 rounded-lg hover:bg-neon-red/30 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;
