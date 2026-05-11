const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing auth token' }) };
  }

  const token = authHeader.slice(7);
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error: authError } = await sb.auth.getUser(token);
  if (authError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
  }

  const { data: reqProfile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (reqProfile?.role !== 'admin') {
    return { statusCode: 403, body: JSON.stringify({ error: 'Access denied' }) };
  }

  const [authUsers, profiles, posts, beta] = await Promise.all([
    sb.auth.admin.listUsers({ perPage: 1000 }),
    sb.from('profiles').select('*'),
    sb.from('free_posts').select('*').order('created_at', { ascending: false }),
    sb.from('beta_users').select('*').order('created_at', { ascending: false }),
  ]);

  if (authUsers.error) {
    return { statusCode: 500, body: JSON.stringify({ error: authUsers.error.message }) };
  }

  const profileMap = {};
  (profiles.data || []).forEach(p => { profileMap[p.id] = p; });

  const members = (authUsers.data.users || []).map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    username: profileMap[u.id]?.username || '—',
    role: profileMap[u.id]?.role || 'member',
    subscription: profileMap[u.id]?.subscription || 'free',
    training_level: profileMap[u.id]?.training_level || '—',
    goal: profileMap[u.id]?.goal || '—',
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      members,
      posts: posts.data || [],
      beta: beta.data || [],
    }),
  };
};
