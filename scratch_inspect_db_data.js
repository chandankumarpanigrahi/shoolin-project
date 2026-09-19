import fs from 'fs';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';

const env = fs.readFileSync('.env.local', 'utf8');
let uri = '';
env.split('\n').forEach(line => {
  if (line.startsWith('MONGO_URI=')) {
    uri = line.substring('MONGO_URI='.length).trim().replace(/^['"]|['"]$/g, '');
  }
});

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  console.log('=== USERS (' + users.length + ') ===');
  users.forEach(u => console.log(`- ${u.name} | ${u.email} | ${u.role} | ID: ${u.id || u._id}`));

  const tasks = await db.collection('tasks').find({}).toArray();
  console.log('\n=== TASKS (' + tasks.length + ') ===');
  const noAssignee = tasks.filter(t => !t.assigneeId && (!t.assignees || t.assignees.length === 0));
  console.log('Tasks with NO assignee:', noAssignee.length);
  noAssignee.forEach(t => console.log(`  - Task [${t.code || t.id}]: "${t.title}" (status: ${t.status})`));

  const taskStatuses = [...new Set(tasks.map(t => t.status))];
  console.log('Unique Task statuses:', taskStatuses);

  const meetings = await db.collection('meetings').find({}).toArray();
  console.log('\n=== MEETINGS (' + meetings.length + ') ===');
  meetings.forEach(m => {
    console.log(`- "${m.title}" | Status: ${m.status} | ApproverId: ${m.approverId || 'NONE'} | Host: ${m.requestedBy}`);
  });

  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
