#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydskboviymdwvynheef.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2tib3ZpeW1oZHd2eW5oZWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcxNTUzNywiZXhwIjoyMDY3MjkxNTM3fQ.LG8M_LH_k5QCvO0KS_jGN8RkJDK9NHO2pHQ_5D9Uq-k' // This would need to be the service role key

// Initialize Supabase client with anon key for auth operations
const supabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2tib3ZpeW1oZHd2eW5oZWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTU1MzcsImV4cCI6MjA2NzI5MTUzN30.AmAhnKnZvDTNTuJ53ctZwyrjYCIjmAgkB8ibV352tmk')

const testAccounts = [
  {
    email: 'test.user@example.com',
    password: 'testuser123',
    firstName: 'John',
    lastName: 'Doe',
    homeCountry: 'US',
    isAdmin: false
  },
  {
    email: 'admin@example.com', 
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    homeCountry: 'US',
    isAdmin: true
  }
]

const sampleVisaEntries = [
  {
    countryCode: 'FR',
    startDate: '2024-06-01',
    endDate: '2024-06-15',
  },
  {
    countryCode: 'IT', 
    startDate: '2024-07-10',
    endDate: '2024-07-25',
  },
  {
    countryCode: 'ES',
    startDate: '2024-08-05', 
    endDate: '2024-08-12',
  }
]

async function createTestAccounts() {
  console.log('🚀 Creating test accounts...')

  for (const account of testAccounts) {
    try {
      console.log(`\n📧 Creating account for ${account.email}`)
      
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            first_name: account.firstName,
            last_name: account.lastName,
            home_country: account.homeCountry,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`   ⚠️  User ${account.email} already exists`)
        } else {
          console.error(`   ❌ Error creating ${account.email}:`, error.message)
          continue
        }
      } else {
        console.log(`   ✅ User created: ${account.email}`)
      }

      // If this should be an admin, we'll need to update the profile
      if (account.isAdmin) {
        console.log(`   👑 Setting ${account.email} as admin...`)
        // Note: This would require service role key or manual database update
        console.log(`   ⚠️  Admin status needs to be set manually in database`)
        console.log(`   📝 Run this SQL: UPDATE profiles SET is_admin = true WHERE email = '${account.email}';`)
      }

      // For regular user, add some sample visa entries
      if (!account.isAdmin && data?.user) {
        console.log(`   📋 Adding sample visa entries for ${account.email}...`)
        // Note: Would need to sign in as this user to add entries due to RLS
        console.log(`   ⚠️  Sample entries need to be added after login`)
      }

    } catch (err) {
      console.error(`   ❌ Unexpected error for ${account.email}:`, err)
    }
  }

  console.log('\n✨ Test account creation completed!')
  console.log('\n📋 Summary:')
  console.log('👤 Regular User:')
  console.log('   Email: test.user@example.com')
  console.log('   Password: testuser123')
  console.log('')
  console.log('👑 Admin User:') 
  console.log('   Email: admin@example.com')
  console.log('   Password: admin123')
  console.log('   ⚠️  Remember to set admin status in database!')
  console.log('')
  console.log('🔧 Next steps:')
  console.log('1. Set admin status: UPDATE profiles SET is_admin = true WHERE email = \'admin@example.com\';')
  console.log('2. Login with test accounts to verify they work')
  console.log('3. Add sample visa entries through the UI')
}

// Run the script
createTestAccounts().catch(console.error) 