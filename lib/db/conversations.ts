import { supabase } from '@/lib/supabase'

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createConversation(userId: string, title: string) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateConversationTitle(id: string, title: string) {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}