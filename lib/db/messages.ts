import { supabase } from '@/lib/supabase'

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })

  if (error) throw error
}