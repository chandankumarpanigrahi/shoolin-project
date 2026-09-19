// Master DB-Synced Users Directory (Mirrors MongoDB Atlas 'users' collection)
export const USERS = [
  {
    id: "6aabb521cbf3ba42b78c9c82",
    _id: "6aabb521cbf3ba42b78c9c82",
    name: "Admin Shoolin",
    email: "admin@shoolin.co.uk",
    role: "Super Admin",
    department: "Executive & Tech Lead",
    avatar: "https://mrchamp-old.netlify.app/assets/link_share/logo.png",
    phone: "+1 (555) 234-5678",
    status: "Active",
    lastActive: "Just now"
  },
  {
    id: "6aabbdadb13fc718a3944238",
    _id: "6aabbdadb13fc718a3944238",
    name: "Chandan Kumar Panigrahi",
    email: "uxdesigner@shoolin.co.uk",
    role: "Admin",
    department: "UI/UX & Web Dev",
    avatar: "https://avatars.githubusercontent.com/u/91644974?v=4",
    phone: "8339869602",
    status: "Active",
    lastActive: "Just now"
  },
  {
    id: "6aacfafdad63c64a59987a28",
    _id: "6aacfafdad63c64a59987a28",
    name: "Sasmita Tripathy",
    email: "sasmita@shoolin.co.uk",
    role: "User",
    department: "Tech & Innovations",
    avatar: "https://i.pravatar.cc/150?img=47",
    phone: "+1 (555) 000-0000",
    status: "Active",
    lastActive: "Just now"
  }
];

export const CURRENT_USER_DEFAULT = USERS[0];
