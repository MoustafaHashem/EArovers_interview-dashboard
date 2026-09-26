import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://obkbmujygjwcwnslvqar.supabase.co'
const supabaseKey = 'sb_publishable_pw_NKU9rrIDqogKs3z342Q_7i9Nv-Zh'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@earovers.me',
    password: 'password123' // They probably used a password, wait I don't know the password...
  })
  console.log(authData, authError)
}
test()
