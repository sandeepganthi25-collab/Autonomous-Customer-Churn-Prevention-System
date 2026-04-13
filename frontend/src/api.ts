const API_BASE = '/api';

export async function fetchUsers(riskLevel?: string, limit = 50): Promise<any[]> {
  const params = new URLSearchParams();
  if (riskLevel) params.set('risk_level', riskLevel);
  params.set('limit', limit.toString());
  
  const response = await fetch(`${API_BASE}/users?${params}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function fetchHighRiskUsers(limit = 100): Promise<any[]> {
  const response = await fetch(`${API_BASE}/users/high-risk?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch high risk users');
  return response.json();
}

export async function fetchLiveUsers(limit = 20): Promise<any[]> {
  const response = await fetch(`${API_BASE}/users/live?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch live users');
  return response.json();
}

export async function fetchLiveABTests(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/ab-tests`);
  if (!response.ok) throw new Error('Failed to fetch A/B tests');
  return response.json();
}

export async function fetchLiveSystemHealth(): Promise<any> {
  const response = await fetch(`${API_BASE}/system/health`);
  if (!response.ok) throw new Error('Failed to fetch system health');
  return response.json();
}

export async function fetchUser(userId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/users/${userId}`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
}

export async function predictChurn(userId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) throw new Error('Prediction failed');
  return response.json();
}

export async function getAIDecision(userId: string, forceRefresh = false): Promise<any> {
  const response = await fetch(`${API_BASE}/ai-decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, force_refresh: forceRefresh }),
  });
  if (!response.ok) throw new Error('AI decision failed');
  return response.json();
}

export async function fetchAnalyticsOverview(): Promise<any> {
  const response = await fetch(`${API_BASE}/analytics/overview`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export async function fetchLiveAnalytics(): Promise<any> {
  const response = await fetch(`${API_BASE}/analytics/live`);
  if (!response.ok) throw new Error('Failed to fetch live analytics');
  return response.json();
}

export async function fetchAnalyticsTrends(days = 30): Promise<any[]> {
  const response = await fetch(`${API_BASE}/analytics/trends?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch trends');
  return response.json();
}

export async function fetchABTests(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/ab-tests`);
  if (!response.ok) throw new Error('Failed to fetch A/B tests');
  return response.json();
}

export async function fetchSystemHealth(): Promise<any> {
  const response = await fetch(`${API_BASE}/system/health`);
  if (!response.ok) throw new Error('Failed to fetch system health');
  return response.json();
}

export async function executeAction(userId: string, actionType: string, channel = 'auto'): Promise<any> {
  const response = await fetch(`${API_BASE}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, action_type: actionType, channel }),
  });
  if (!response.ok) throw new Error('Action execution failed');
  return response.json();
}

export async function simulateAction(userId: string, action: string, params = {}): Promise<any> {
  const response = await fetch(`${API_BASE}/digital-twin/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, action, params }),
  });
  if (!response.ok) throw new Error('Simulation failed');
  return response.json();
}

export async function createDigitalTwin(userId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/digital-twin/create?user_id=${userId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to create digital twin');
  return response.json();
}
