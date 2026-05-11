const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

// Maps preferred_time values to the UTC hour when the SMS fires
const TIME_TO_UTC_HOUR = {
  early_morning: 11,  // 6am ET
  morning:       13,  // 8am ET
  midday:        17,  // 12pm ET
  afternoon:     20,  // 3pm ET
  evening:       23,  // 6pm ET
  night:          1,  // 8pm ET
};

// 30-day rotating schedule (same logic as the workout page)
const SCHEDULE = [
  'push-a','pull-a','legs-a','core','push-b','pull-b','legs-b','recovery',
  'push-a','pull-a','legs-a','core','push-b','pull-b','legs-b','recovery',
  'push-a','pull-a','legs-a','core','push-b','pull-b','legs-b','recovery',
  'push-a','pull-a','legs-a','core','push-b','pull-b',
];

const WORKOUT_INFO = {
  'push-a':    { label: 'Push Day A',          focus: 'Chest · Shoulders · Triceps',        exercises: 6 },
  'pull-a':    { label: 'Pull Day A',          focus: 'Back · Biceps · Rear Delts',         exercises: 6 },
  'legs-a':    { label: 'Legs Day A',          focus: 'Quads · Hamstrings · Glutes',        exercises: 6 },
  'core':      { label: 'Core & Mobility Day', focus: 'Stability · Anti-Rotation · Flex',   exercises: 6 },
  'push-b':    { label: 'Push Day B',          focus: 'Chest · Shoulders · Triceps',        exercises: 6 },
  'pull-b':    { label: 'Pull Day B',          focus: 'Back · Biceps (Strength + Stretch)', exercises: 6 },
  'legs-b':    { label: 'Legs Day B',          focus: 'Quads · Glutes · Hamstrings',        exercises: 6 },
  'recovery':  { label: 'Active Recovery',     focus: 'Cardio · Mobility · Blood Flow',     exercises: 6 },
};

function getTodayWorkout() {
  const epochDay = Math.floor(Date.now() / 86400000);
  const key = SCHEDULE[epochDay % SCHEDULE.length];
  return WORKOUT_INFO[key];
}

function buildMessage(workout, username) {
  const name = username && username !== '—' ? username : 'there';
  return [
    `NGM Daily Reminder`,
    `Hey ${name} — today is ${workout.label}.`,
    `${workout.focus}`,
    `${workout.exercises} exercises ready at noguessmethod.com/workout`,
    `Reply STOP to unsubscribe.`,
  ].join('\n');
}

exports.handler = async (event) => {
  const currentHour = new Date().getUTCHours();

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Find which preferred_time values map to this UTC hour
  const matchingTimes = Object.entries(TIME_TO_UTC_HOUR)
    .filter(([, hour]) => hour === currentHour)
    .map(([key]) => key);

  if (!matchingTimes.length) {
    return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'No users scheduled for this hour' }) };
  }

  // Fetch users with a phone number whose preferred_time matches this hour
  const { data: users, error } = await sb
    .from('profiles')
    .select('username, phone_number, preferred_time')
    .in('preferred_time', matchingTimes)
    .not('phone_number', 'is', null);

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  if (!users?.length) {
    return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'No users with phone numbers at this hour' }) };
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const workout = getTodayWorkout();
  const results = { sent: 0, failed: 0, errors: [] };

  await Promise.allSettled(
    users.map(async (user) => {
      try {
        await client.messages.create({
          body: buildMessage(workout, user.username),
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phone_number,
        });
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push({ phone: user.phone_number, error: err.message });
      }
    })
  );

  console.log(`SMS reminders: sent=${results.sent} failed=${results.failed}`);
  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
