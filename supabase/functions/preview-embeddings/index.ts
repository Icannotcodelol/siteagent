// supabase/functions/preview-embeddings/index.ts

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { OpenAI } from 'npm:openai@4';

// Constants
const EMBEDDING_MODEL = 'text-embedding-3-large';
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const BATCH_SIZE = 32;

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\uFFFD/g, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\x80-\xFF]/g, '')
    .trim();
}

function splitText(text: string, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  let start = 0;
  const max = Math.min(text.length, 500_000);
  const src = text.slice(0, max);

  while (start < src.length && chunks.length < 1000) {
    const end = Math.min(start + size, src.length);
    const chunk = src.slice(start, end);
    if (chunk.trim()) chunks.push(chunk);
    const next = end - overlap;
    start = next <= start ? end : next;
  }
  return chunks.slice(0, 32); // hard-cap for preview speed
}

async function updateSession(
  supabase: SupabaseClient,
  token: string,
  fields: Record<string, any>,
) {
  await supabase.from('preview_sessions').update(fields).eq('session_token', token);
}

Deno.serve(async (req: Request) => {
  let sessionToken: string | undefined;
  try {
    const body = await req.json();
    sessionToken = body.sessionToken as string;
    const rawContent = body.content as string;

    if (!sessionToken || typeof rawContent !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // mark processing
    await updateSession(supabase, sessionToken, { embedding_status: 'processing' });

    const sanitized = sanitizeText(rawContent);
    if (!sanitized) throw new Error('No valid text content');

    const chunks = splitText(sanitized);

    // get embeddings in batches
    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const resp = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: batch });
      embeddings.push(...resp.data.map((d: any) => d.embedding));
    }

    const rows = chunks.map((txt, i) => ({
      session_token: sessionToken,
      chunk_text: txt,
      embedding: embeddings[i],
      token_count: Math.ceil(txt.length / 4),
    }));

    const { error: insertErr } = await supabase.from('preview_document_chunks').insert(rows);
    if (insertErr) throw new Error(`Insert error: ${insertErr.message}`);

    // simple suggested qs
    const defaultQs = [
      'What is this about?',
      'Can you summarise the main points?',
      'What are key details?',
    ];
    await updateSession(supabase, sessionToken, {
      embedding_status: 'completed',
      suggested_questions: defaultQs,
      content_text: sanitized.slice(0, 10000),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('preview-embeddings error', e);
    if (sessionToken) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      await updateSession(supabase, sessionToken, {
        embedding_status: 'failed',
        error_message: e instanceof Error ? e.message : 'Unknown error',
      });
    }
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 