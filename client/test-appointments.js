const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qjealtvlmkusxeuymdpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZWFsdHZsbWt1c3hldXltZHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ3MTExOCwiZXhwIjoyMDgzMDQ3MTE4fQ.Vb__yeFBwrH1SmtGOL-B0RpCe1xUVwJ3tFH5SYb8QF0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointments() {
  console.log('Checking all appointments in database...\n');
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} appointments total:\n`);
  console.log(JSON.stringify(data, null, 2));
}

checkAppointments();
