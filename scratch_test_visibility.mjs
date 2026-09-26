import { connectDB } from './lib/db.js';
import { Meeting } from './lib/models/Meeting.js';
import { User } from './lib/models/User.js';

await connectDB();

const users = await User.find({});
const meetings = await Meeting.find({});
const m = meetings.find(x => x.title && x.title.includes('PMV'));

console.log('Meeting:', m?.title, 'Status:', m?.status, 'isArchived:', m?.isArchived);

users.forEach(u => {
  const currentId = String(u.id || u._id || '').toLowerCase();
  const currentEmail = String(u.email || '').toLowerCase();
  const currentName = String(u.name || '').trim().toLowerCase();

  const matchesCurrentUser = (val) => {
    if (!val) return false;
    const target = String(val.id || val._id || val.email || val.name || val).trim().toLowerCase();
    return target === currentId || target === currentEmail || target === currentName;
  };

  const isSuperAdminOrAdmin = () => {
    const role = String(u.role || '').toLowerCase();
    return role === 'super admin' || role === 'admin' || role.includes('admin');
  };

  const isMeetingCreator = () => {
    if (!m) return false;
    return matchesCurrentUser(m.requestedBy) || matchesCurrentUser(m.requestedByEmail) || matchesCurrentUser(m.requestedByName);
  };

  const isMeetingVisibleToUser = () => {
    if (isSuperAdminOrAdmin()) return true;
    if (!m) return false;
    const isCreator = isMeetingCreator();
    const attendeeIds = [...(m.participants || []), ...(m.participantIds || [])];
    const isAttendee = attendeeIds.some(id => matchesCurrentUser(id));
    return isCreator || isAttendee;
  };

  const isMeetingArchived = () => {
    if (!m) return false;
    if (m.isArchived === true || m.status === 'Archived' || m.status === 'Cancelled' || m.status === 'Declined') return true;
    return false;
  };

  const visible = isMeetingVisibleToUser();
  const inActive = visible && !isMeetingArchived();
  const inArchive = visible && isMeetingArchived();

  console.log(u.name, '(' + u.role + ') -> visible:', visible, 'inActive:', inActive, 'inArchive:', inArchive);
});

process.exit(0);
