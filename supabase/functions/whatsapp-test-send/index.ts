import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const token = Deno.env.get('META_ACCESS_TOKEN');
  const phoneId = Deno.env.get('META_PHONE_NUMBER_ID');
  const { action = 'send', to = '5541997830472', pin = '123456' } = await req.json().catch(() => ({}));

  const url = `https://graph.facebook.com/v21.0/${phoneId}/${action === 'register' ? 'register' : 'messages'}`;
  const body = action === 'register'
    ? { messaging_product: 'whatsapp', pin }
    : {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: { name: 'hello_world', language: { code: 'en_US' } },
      };

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new Response(JSON.stringify({ status: res.status, body: JSON.parse(text) }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
