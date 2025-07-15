import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydskboviymdwvynheef.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2tib3ZpeW1oZHd2eW5oZWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTU1MzcsImV4cCI6MjA2NzI5MTUzN30.AmAhnKnZvDTNTuJ53ctZwyrjYCIjmAgkB8ibV352tmk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testAccounts = [
  {
    email: 'test.user@example.com',
    password: 'testuser123',
    firstName: 'John',
    lastName: 'Doe',
    homeCountry: 'US',
    phone: '+1 555-0123',
    isAdmin: false
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    homeCountry: 'US',
    phone: '+1 555-0124',
    isAdmin: true
  }
]

async function createTestAccounts() {
  console.log('🚀 Creating test accounts for Schengen Visa Calculator...\n')

  for (const account of testAccounts) {
    try {
      console.log(`📧 Creating account for ${account.email}`)
      
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            first_name: account.firstName,
            last_name: account.lastName,
            home_country: account.homeCountry,
            phone: account.phone,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          console.log(`   ⚠️  User ${account.email} already exists - this is ok!`)
        } else {
          console.error(`   ❌ Error creating ${account.email}:`, error.message)
          continue
        }
      } else {
        console.log(`   ✅ User created successfully: ${account.email}`)
        if (data.user) {
          console.log(`   🔑 User ID: ${data.user.id}`)
        }
      }

      if (account.isAdmin) {
        console.log(`   👑 This account needs admin privileges`)
        console.log(`   📝 Run this SQL in Supabase: UPDATE profiles SET is_admin = true WHERE email = '${account.email}';`)
      }

      console.log('') // Empty line for readability

    } catch (err) {
      console.error(`   ❌ Unexpected error for ${account.email}:`, err.message)
    }
  }

  console.log('✨ Account creation process completed!\n')
  console.log('📋 ACCOUNT SUMMARY:')
  console.log('==================')
  console.log('👤 Regular User:')
  console.log('   Email: test.user@example.com')
  console.log('   Password: testuser123')
  console.log('   Login URL: http://localhost:3000/login')
  console.log('')
  console.log('👑 Admin User:')
  console.log('   Email: admin@example.com')  
  console.log('   Password: admin123')
  console.log('   Login URL: http://localhost:3000/login')
  console.log('   Admin Panel: http://localhost:3000/admin/analytics')
  console.log('')
  console.log('🔧 NEXT STEPS:')
  console.log('==============')
  console.log('1. Set admin privileges in Supabase:')
  console.log('   UPDATE profiles SET is_admin = true WHERE email = \'admin@example.com\';')
  console.log('')
  console.log('2. Test the accounts:')
  console.log('   - Login at http://localhost:3000/login')
  console.log('   - Try both accounts')
  console.log('   - Access admin panel with admin account')
  console.log('')
  console.log('3. Add sample data (optional):')
  console.log('   - Run the SQL from scripts/sample-visa-data.sql')
  console.log('')
  console.log('Happy testing! 🎉')
}

createTestAccounts().catch(console.error) 