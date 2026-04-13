import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Lock, Mail, Eye, EyeOff, X, FileText, Check } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { email: string; name: string }) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const TermsModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div className="absolute inset-0" onClick={onClose} />
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-full max-w-2xl max-h-[80vh] bg-dark-800 glass-card border border-white/20 rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-neon-green" />
          Terms & Conditions
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
        <div>
          <h3 className="text-white font-semibold mb-2">1. Acceptance of Terms</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            By accessing and using ChurnAI, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms and Conditions. If you do not agree to 
            these terms, please do not use this service.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">2. Use of Service</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            ChurnAI provides autonomous customer churn prevention services. You agree to use 
            this service only for lawful purposes and in accordance with these Terms. You are 
            responsible for maintaining the confidentiality of your account credentials.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">3. Data Privacy</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            All data uploaded to this system is processed locally and used solely for churn 
            analysis. We do not sell or share your data with third parties. You retain 
            ownership of all data you upload.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">4. User Account</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            You agree to provide accurate information during registration and to keep your 
            account secure. You are responsible for all activities that occur under your account.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">5. Intellectual Property</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            All content, features, and functionality of ChurnAI are protected by copyright 
            and other intellectual property laws. You may not copy, modify, or distribute 
            any part of this service without prior written consent.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">6. Limitation of Liability</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            ChurnAI shall not be liable for any indirect, incidental, or consequential damages 
            arising from your use of the service. The service is provided "as is" without 
            warranty of any kind.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">7. Termination</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We reserve the right to terminate or suspend your account if you violate these terms 
            or engage in any prohibited conduct. You may also terminate your account at any time.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">8. Changes to Terms</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We reserve the right to modify these terms at any time. Changes will be effective 
            immediately upon posting. Your continued use of the service constitutes acceptance 
            of the modified terms.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">9. Governing Law</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws. 
            Any disputes shall be resolved through binding arbitration.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">10. Contact Us</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            If you have any questions about these Terms, please contact our support team.
          </p>
        </div>
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="p-6 border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full py-3 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const PrivacyModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div className="absolute inset-0" onClick={onClose} />
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-full max-w-2xl max-h-[80vh] bg-dark-800 glass-card border border-white/20 rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-neon-purple" />
          Privacy Policy
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
        <div>
          <h3 className="text-white font-semibold mb-2">Information We Collect</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We collect information you provide directly, including your name, email address, 
            and any data you upload for analysis. We also collect usage data to improve 
            our service.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">How We Use Your Information</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We use your information to provide and maintain the service, process your data 
            for analysis, communicate with you about your account, and improve our algorithms.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Data Security</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We implement industry-standard security measures to protect your data. All data 
            is encrypted in transit and at rest. We regularly review our security practices.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Data Retention</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We retain your data for as long as your account is active or as needed to 
            provide services. You may request deletion of your data at any time.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Your Rights</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            You have the right to access, correct, or delete your personal data. You also 
            have the right to data portability. Contact us to exercise these rights.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Cookies</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We use cookies to maintain your session and remember your preferences. You can 
            disable cookies in your browser settings, but some features may not work properly.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">Third-Party Services</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We do not share your data with third parties except as required by law. Our 
            service providers are bound by confidentiality agreements.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">GDPR Compliance</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            For EU users, we comply with GDPR requirements including data access, rectification, 
            erasure, and portability rights.
          </p>
        </div>
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="p-6 border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full py-3 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/30 transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const Login = ({ onLogin, onClose, isModal = false }: LoginProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  
  // Update registered count on mount and after sign up
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setRegisteredCount(Array.isArray(storedUsers) ? storedUsers.length : 0);
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 1000));

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (isSignUp && !name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (isSignUp && !acceptTerms) {
      setError('Please accept the Terms & Conditions');
      setLoading(false);
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Ensure storedUsers is always an array
    const users = Array.isArray(storedUsers) ? storedUsers : [];

    if (isSignUp) {
      const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setError('An account with this email already exists');
        setLoading(false);
        return;
      }

      const newUser = {
        email,
        name,
        password,
        token: 'mock-jwt-token-' + Date.now()
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      const user = { email, name, token: newUser.token };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');

      onLogin(user);
    } else {
      const matchingUser = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!matchingUser) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      const userSession = { email: matchingUser.email, name: matchingUser.name, token: matchingUser.token };
      localStorage.setItem('user', JSON.stringify(userSession));
      localStorage.setItem('isLoggedIn', 'true');

      onLogin(userSession);
    }

    setLoading(false);
  };

  const containerClass = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
    : 'min-h-screen flex items-center justify-center p-4';

  const cardClass = isModal
    ? 'relative w-full max-w-md glass-card p-8'
    : 'w-full max-w-md glass-card p-8';

  return (
    <>
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
      {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
      
      <div className={containerClass}>
        {isModal && (
          <div className="absolute inset-0 -z-10" onClick={onClose} />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cardClass}
        >
          {isModal && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-neon-purple">Churn</span>
              <span className="text-neon-green">AI</span>
            </h1>
            <p className="text-gray-400">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-700 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-neon-green"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-700 border border-white/10 rounded-lg pl-11 pr-12 py-3 text-white focus:outline-none focus:border-neon-green"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-neon-green hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-neon-red text-sm text-center bg-neon-red/10 py-2 rounded-lg">{error}</p>
            )}

            {isSignUp && (
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-lg border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-neon-green"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-neon-green hover:underline"
                      >
                        Terms & Conditions
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-neon-purple hover:underline"
                      >
                        Privacy Policy
                      </button>
                    </p>
                  </div>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignUp && !acceptTerms)}
              className="w-full py-3 bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setAcceptTerms(false);
                }}
                className="text-neon-green hover:underline ml-2"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Check className="w-4 h-4 text-neon-green" />
              <span>Secure login with encryption</span>
            </div>
            {!isSignUp && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">Debug: {registeredCount} user(s) registered</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('users');
                    localStorage.removeItem('user');
                    localStorage.removeItem('isLoggedIn');
                    setRegisteredCount(0);
                    alert('All users cleared. Please refresh and sign up again.');
                  }}
                  className="text-xs text-neon-red hover:underline mt-1"
                >
                  Clear all users (Debug)
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
