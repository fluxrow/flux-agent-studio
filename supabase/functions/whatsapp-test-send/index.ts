import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const token = Deno.env.get('META_ACCESS_TOKEN');
  const phoneId = Deno.env.get('META_PHONE_NUMBER_ID');
  const { to } = await req.json().catch(() => ({ to: '5541997830472' }));

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: 'hello_world', language: { code: 'en_US' } },
    }),
  });

  const body = await res.text();
  return new Response(JSON.stringify({ status: res.status, body: JSON.parse(body) }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
