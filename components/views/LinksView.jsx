'use client';

import React, { useState, useMemo } from 'react';
import {
  Link2,
  Plus,
  ExternalLink,
  Copy,
  Search,
  Globe,
  Share2,
  FileText,
  Check,
  Building,
  Trash2,
  FolderKanban,
  HardDrive,
  FileSpreadsheet,
  Layout,
  BookOpen,
  Image as ImageIcon,
  Shield,
  Sparkles,
  Smartphone,
  Terminal,
  GitBranch,
  Cloud,
  Layers,
  Activity,
  ChevronRight,
  ArrowLeft,
  Filter,
  Folder,
  MoreHorizontal,
  Pencil
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  LinkedinIcon,
  YoutubeIcon,
  TwitterIcon,
  WhatsappIcon
} from '@/components/common/SocialIcons';

// Official brand SVG icons from barrel @thesvg/react
import {
  Instagram as InstagramSvg,
  Facebook as FacebookSvg,
  Linkedin as LinkedinSvg,
  Youtube as YoutubeSvg,
  X as XSvg,
  Whatsapp as WhatsappSvg,
  Tiktok as TiktokSvg,
  Telegram as TelegramSvg,
  Discord as DiscordSvg,
  Pinterest as PinterestSvg,
  GoogleDrive2026 as GoogledriveSvg,
  GoogleSheets2026 as GooglesheetsSvg,
  GoogleDocs2026 as GoogledocsSvg,
  GoogleSlides2026 as GoogleslidesSvg,
  GoogleForms2026 as GoogleformsSvg,
  GoogleMeet2026 as GooglemeetSvg,
  GoogleCalendar2026 as GooglecalendarSvg,
  Gmail2026 as GmailSvg,
  Figma as FigmaSvg,
  Canva as CanvaSvg,
  Notion as NotionSvg,
  Airtable as AirtableSvg,
  Miro as MiroSvg,
  Github as GithubSvg,
  Gitlab as GitlabSvg,
  Aws as AwsSvg,
  Docker as DockerSvg,
  Vercel as VercelSvg,
  Postman as PostmanSvg,
  Jira as JiraSvg,
  Trello as TrelloSvg,
  Clickup as ClickupSvg,
  Asana as AsanaSvg,
  Sentry as SentrySvg,
  Firebase as FirebaseSvg,
  Supabase as SupabaseSvg,
  Stripe as StripeSvg
} from '@thesvg/react';

import { UserAvatar } from '@/components/common/UserAvatar';
import {
  CATEGORIES_CONFIG,
  AddLinkModal,
  isCategoryMatch,
  normalizeCategoryKey,
  getCategoryConfig
} from '@/components/modals/AddLinkModal';

import Image from 'next/image';
import bg1 from '@/public/list-header-design-1.png';
import bg2 from '@/public/list-header-design-2.png';
import bg3 from '@/public/list-header-design-3.png';
import bg4 from '@/public/list-header-design-4.png';

// Document / Brand File Icon Badge Component matching SS style
function FileIconBadge({ link, meta }) {
  const subCat = link.subCategory || link.type || '';
  const nameLower = (link.name || '').toLowerCase();
  const SubCatIcon = meta.icon;

  if (
    subCat.includes('Docs') ||
    subCat.includes('Word') ||
    nameLower.endsWith('.doc') ||
    nameLower.endsWith('.docx')
  ) {
    return (
      <div className="w-8.5 h-8.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-md shadow-2xs flex items-center justify-center p-1.5 text-blue-600 dark:text-blue-400 shrink-0">
        <GoogledocsSvg className="w-5 h-5 shrink-0" />
      </div>
    );
  }

  if (
    subCat.includes('Sheets') ||
    subCat.includes('Excel') ||
    nameLower.endsWith('.xls') ||
    nameLower.endsWith('.xlsx') ||
    nameLower.endsWith('.csv')
  ) {
    return (
      <div className="w-8.5 h-8.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md shadow-2xs flex items-center justify-center p-1.5 text-emerald-600 dark:text-emerald-400 shrink-0">
        <GooglesheetsSvg className="w-5 h-5 shrink-0" />
      </div>
    );
  }

  if (
    subCat.includes('Drive') ||
    subCat.includes('Presentation') ||
    nameLower.endsWith('.ppt') ||
    nameLower.endsWith('.pptx') ||
    nameLower.endsWith('.pdf')
  ) {
    return (
      <div className="w-8.5 h-8.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-md shadow-2xs flex items-center justify-center p-1.5 text-amber-600 dark:text-amber-400 shrink-0">
        <GoogledriveSvg className="w-5 h-5 shrink-0" />
      </div>
    );
  }

  // Fallback to vibrant official theSVG brand badge
  return (
    <div className={`w-8.5 h-8.5 rounded-md flex items-center justify-center border shrink-0 shadow-2xs p-1.5 ${meta.bg} ${meta.textColor}`}>
      <SubCatIcon className="w-4 h-4 shrink-0" />
    </div>
  );
}

// Sub-Category Icon & Color Map using official 2026 theSVG brand icons
const SUB_CATEGORY_ICON_MAP = {
  'Instagram': { icon: InstagramSvg, textColor: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800' },
  'Facebook': { icon: FacebookSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  'LinkedIn': { icon: LinkedinSvg, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800' },
  'YouTube': { icon: YoutubeSvg, textColor: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800' },
  'X (Twitter)': { icon: XSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
  'WhatsApp': { icon: WhatsappSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  'TikTok': { icon: TiktokSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
  'Telegram': { icon: TelegramSvg, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800' },
  'Discord': { icon: DiscordSvg, textColor: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' },
  'Pinterest': { icon: PinterestSvg, textColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
  'Other Social': { icon: Share2, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },

  'Official Website': { icon: Globe, textColor: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800' },
  'Admin Panel': { icon: Shield, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  'Staging / QA': { icon: Sparkles, textColor: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800' },
  'App Store': { icon: Smartphone, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800' },
  'API Portal': { icon: Terminal, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  'Stripe Portal': { icon: StripeSvg, textColor: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' },

  'Google Drive': { icon: GoogledriveSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  'Google Sheets': { icon: GooglesheetsSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  'Google Docs': { icon: GoogledocsSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  'Google Slides': { icon: GoogleslidesSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  'Google Forms': { icon: GoogleformsSvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  'Google Meet': { icon: GooglemeetSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  'Google Calendar': { icon: GooglecalendarSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  'Gmail': { icon: GmailSvg, textColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
  'Figma': { icon: FigmaSvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  'Canva': { icon: CanvaSvg, textColor: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800' },
  'Notion': { icon: NotionSvg, textColor: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
  'Airtable': { icon: AirtableSvg, textColor: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800' },
  'Miro': { icon: MiroSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  'Brand Assets / Logo': { icon: ImageIcon, textColor: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800' },

  'GitHub': { icon: GithubSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
  'GitLab': { icon: GitlabSvg, textColor: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800' },
  'AWS Console': { icon: AwsSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  'Docker': { icon: DockerSvg, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800' },
  'Vercel': { icon: VercelSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
  'Postman': { icon: PostmanSvg, textColor: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800' },
  'Jira': { icon: JiraSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  'Trello': { icon: TrelloSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  'ClickUp': { icon: ClickupSvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  'Asana': { icon: AsanaSvg, textColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
  'Sentry': { icon: SentrySvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  'Firebase': { icon: FirebaseSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  'Supabase': { icon: SupabaseSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' }
};

const PROJECT_FOLDERS = [
  {
    brand: 'PMV',
    name: 'PMV Maritime',
    code: 'PMV',
    bgColor: 'bg-blue-600',
    backTab: "after:bg-blue-600 before:bg-blue-600",
    frontGradient: 'from-blue-600 to-blue-500',
    frontTab: 'after:bg-blue-500 before:bg-blue-500',
    shadowInset: 'group-hover:shadow-[inset_0_20px_40px_#60a5fa,_inset_0_-20px_40px_#2563eb]',
    badgeBg: 'bg-blue-900/50 text-blue-100 border-blue-400/40'
  },
  {
    brand: 'FreshPod',
    name: 'FreshPod App',
    code: 'FPD',
    bgColor: 'bg-emerald-600',
    backTab: "after:bg-emerald-600 before:bg-emerald-600",
    frontGradient: 'from-emerald-600 to-emerald-500',
    frontTab: 'after:bg-emerald-500 before:bg-emerald-500',
    shadowInset: 'group-hover:shadow-[inset_0_20px_40px_#34d399,_inset_0_-20px_40px_#059669]',
    badgeBg: 'bg-emerald-900/50 text-emerald-100 border-emerald-400/40'
  },
  {
    brand: 'Lagos',
    name: 'Lagos Logistics',
    code: 'LGS',
    bgColor: 'bg-amber-600',
    backTab: "after:bg-amber-600 before:bg-amber-600",
    frontGradient: 'from-amber-500 to-amber-400',
    frontTab: 'after:bg-amber-400 before:bg-amber-400',
    shadowInset: 'group-hover:shadow-[inset_0_20px_40px_#fbbf24,_inset_0_-20px_40px_#d97706]',
    badgeBg: 'bg-amber-900/50 text-amber-100 border-amber-400/40'
  },
  {
    brand: 'Internal',
    name: 'Internal Org',
    code: 'INT',
    bgColor: 'bg-purple-600',
    backTab: "after:bg-purple-600 before:bg-purple-600",
    frontGradient: 'from-purple-600 to-purple-500',
    frontTab: 'after:bg-purple-500 before:bg-purple-500',
    shadowInset: 'group-hover:shadow-[inset_0_20px_40px_#c084fc,_inset_0_-20px_40px_#9333ea]',
    badgeBg: 'bg-purple-900/50 text-purple-100 border-purple-400/40'
  }
];

// Exact UIVerse 3D Opening Folder Component (Responsive & Fluid)
function ProjectFolder3DCard({ project, count, onClick }) {
  return (
    <section className="relative group flex flex-col items-center justify-center w-full select-none py-2">
      <div
        onClick={onClick}
        className="file relative w-full max-w-[320px] aspect-[1.5/1] min-h-[165px] cursor-pointer origin-bottom [perspective:1500px] z-20"
      >
        {/* Back Flap Cover (Work-5) */}
        <div className={`work-5 ${project.bgColor} w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[35%] after:h-4 after:${project.bgColor} after:rounded-t-[10px] before:absolute before:content-[''] before:-top-[15px] before:left-[calc(35%-4.5px)] before:w-4 before:h-4 before:${project.bgColor} before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]`} />

        {/* Paper Sheet 3 (Work-4) */}
        <div className="work-4 absolute inset-1 bg-zinc-400 dark:bg-slate-600 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:[transform:rotateX(-20deg)] p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-white font-mono font-bold">
            <span>{project.code} Folder</span>
            <span>{count} items</span>
          </div>
        </div>

        {/* Paper Sheet 2 (Work-3) */}
        <div className="work-3 absolute inset-1 bg-zinc-300 dark:bg-slate-700 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)] p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-200 font-mono font-bold">
            <span>Resource Links</span>
            <span>Active</span>
          </div>
        </div>

        {/* Paper Sheet 1 (Work-2) */}
        <div className="work-2 absolute inset-1 bg-zinc-200 dark:bg-slate-800 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-38deg)] p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-100">
          </div>
        </div>

        {/* Front Opening Cover Flap (Work-1) */}
        <div className={`work-1 absolute bottom-0 bg-gradient-to-t ${project.frontGradient} w-full h-[78%] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[61%] after:h-[20px] ${project.frontTab} after:rounded-t-[10px] before:absolute before:content-[''] before:-top-[10px] before:right-[calc(61%-4px)] before:size-3 ${project.frontTab} before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease duration-300 origin-bottom flex items-end ${project.shadowInset} group-hover:[transform:rotateX(-46deg)_translateY(1px)] p-3.5 sm:p-4`}>
          <div className="w-full flex items-end justify-between text-white font-bold text-xs pointer-events-none gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] font-bold opacity-90">[{project.code}]</div>
              <div className="text-xs sm:text-sm font-extrabold tracking-tight drop-shadow-sm truncate">{project.name}</div>
            </div>
            <div className="font-mono text-[10px] bg-black/25 px-2 py-0.5 rounded-full border border-white/20 shrink-0">
              {count} Links
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LinksView({
  links = [],
  users = [],
  onOpenAddLink,
  onAddLink,
  onUpdateLink,
  onDeleteLink
}) {
  // Navigation State: 'FOLDERS' | specific brand code (e.g. 'PMV')
  const [activeFolderBrand, setActiveFolderBrand] = useState('FOLDERS');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingLink, setEditingLink] = useState(null);

  const handleCopy = (url, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSubCategoryMeta = (link) => {
    const subCatKey = link.subCategory || link.type || 'Official Website';
    return SUB_CATEGORY_ICON_MAP[subCatKey] || {
      icon: Globe,
      textColor: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800'
    };
  };

  // Filter links based on search query and category/sub-category
  const filteredLinks = useMemo(() => {
    return links.filter(l => {
      if (activeFolderBrand !== 'FOLDERS' && l.brand !== activeFolderBrand) return false;
      if (selectedCategory !== 'ALL' && !isCategoryMatch(l.category, selectedCategory)) return false;

      const linkSubCat = l.subCategory || l.type;
      if (selectedSubCategory !== 'ALL' && linkSubCat !== selectedSubCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = l.name.toLowerCase().includes(q);
        const matchUrl = l.url.toLowerCase().includes(q);
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchBrand = (l.brand || '').toLowerCase().includes(q);
        if (!matchTitle && !matchUrl && !matchDesc && !matchBrand) return false;
      }
      return true;
    });
  }, [links, activeFolderBrand, selectedCategory, selectedSubCategory, searchQuery]);

  const activeProjectInfo = useMemo(() => {
    return PROJECT_FOLDERS.find(p => p.brand === activeFolderBrand);
  }, [activeFolderBrand]);

  const availableSubCategories = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return Object.values(CATEGORIES_CONFIG).flat();
    }
    return getCategoryConfig(selectedCategory) || [];
  }, [selectedCategory]);

  return (
    <div className="space-y-4 pb-12 text-xs select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs">
        <div className="flex items-center gap-3">
          {activeFolderBrand !== 'FOLDERS' && (
            <button
              type="button"
              onClick={() => setActiveFolderBrand('FOLDERS')}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-sm transition-colors"
              title="Back to All Project Folders"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-brand" />
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {activeFolderBrand === 'FOLDERS' ? 'Project Link Folders Directory' : `${activeProjectInfo?.name} Links`}
              </h1>
              <span className="text-[11px] px-2 py-0.5 bg-brand-light/30 text-brand font-mono font-semibold rounded-xs border border-brand/30">
                {filteredLinks.length} Links Pinned
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeFolderBrand === 'FOLDERS'
                ? 'Hover & click any 3D Project Folder below to enter and view categorized Kanban link boards.'
                : `Kanban view of all pinned resources, social media handles, and docs for ${activeProjectInfo?.name}.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-active rounded-sm shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pin New Link</span>
        </button>
      </div>

      {/* Navigation Bar & Filters */}
      <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-sm shadow-2xs space-y-3">
        {/* Project Folder Breadcrumb & Quick Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => setActiveFolderBrand('FOLDERS')}
              className={`px-3 py-1 rounded-xs font-semibold text-xs transition-all shrink-0 ${activeFolderBrand === 'FOLDERS'
                ? 'bg-brand text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              All Project Folders ({links.length})
            </button>
            {PROJECT_FOLDERS.map(p => {
              const count = links.filter(l => l.brand === p.brand).length;
              return (
                <button
                  key={p.brand}
                  type="button"
                  onClick={() => setActiveFolderBrand(p.brand)}
                  className={`px-2.5 py-1 rounded-xs font-semibold text-xs transition-all shrink-0 flex items-center gap-1.5 ${activeFolderBrand === p.brand
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  <span>{p.name}</span>
                  <span className="font-mono text-[10px] bg-black/20 px-1 py-0.2 rounded-xs">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls: Search & Category Dropdowns */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search links by name, URL, sub-category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory('ALL');
                }}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand font-medium shadow-2xs"
              >
                <option value="ALL">All Categories</option>
                {Object.keys(CATEGORIES_CONFIG).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sub-Category:</span>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand font-medium shadow-2xs"
              >
                <option value="ALL">All Sub-Categories</option>
                {availableSubCategories.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: EXACT 3D OPENING FOLDER CARDS GRID (When activeFolderBrand === 'FOLDERS') */}
      {activeFolderBrand === 'FOLDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Folder className="w-4 h-4 text-brand" />
              <span>Interactive Project Folders ({PROJECT_FOLDERS.length})</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hover over folders to reveal 3D opening paper sheets · Click to enter
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 sm:gap-6 pt-2">
            {PROJECT_FOLDERS.map((proj) => {
              const projLinkCount = links.filter(l => l.brand === proj.brand).length;

              return (
                <ProjectFolder3DCard
                  key={proj.brand}
                  project={proj}
                  count={projLinkCount}
                  onClick={() => setActiveFolderBrand(proj.brand)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: INSIDE OPEN PROJECT FOLDER - KANBAN CATEGORY COLUMNS */}
      {activeFolderBrand !== 'FOLDERS' && (
        <div className="space-y-4">
          {/* Active Folder Header Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-sm">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-xs font-mono font-bold text-xs shadow-2xs ${activeProjectInfo?.bgColor} text-white`}>
                {activeProjectInfo?.code}
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{activeProjectInfo?.name} Resource Kanban Board</span>
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Categorized columns with brand icon indicators &amp; quick link actions
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveFolderBrand('FOLDERS')}
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Folders</span>
            </button>
          </div>

          {/* Kanban Board Grid (Columns per Category) matching SS layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {Object.keys(CATEGORIES_CONFIG).map((catName, idx) => {
              if (selectedCategory !== 'ALL' && !isCategoryMatch(selectedCategory, catName)) return null;

              const catLinks = filteredLinks.filter(l => isCategoryMatch(l.category, catName));
              const columnHeaderBg = [bg1, bg2, bg3, bg4][idx % 4];

              return (
                <div
                  key={catName}
                  className="bg-gray-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col space-y-3 p-2"
                >
                  {/* Column Header (Title, Count, Header BG Image) */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-0.5 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
                        {catName}
                      </h3>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/60 dark:border-slate-700 shrink-0">
                        {catLinks.length}
                      </span>
                    </div>

                    <div className="h-7 w-20 shrink-0 flex items-center justify-end">
                      <Image
                        src={columnHeaderBg}
                        alt={catName}
                        width={100}
                        height={32}
                        className="h-full w-auto object-contain object-right scale-125 -translate-x-2.5"
                      />
                    </div>
                  </div>

                  {/* Column Link Cards List */}
                  <div className="space-y-2 flex-1">
                    {catLinks.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg text-xs font-medium">
                        No links in {catName}
                      </div>
                    ) : (
                      catLinks.map((link) => {
                        const meta = getSubCategoryMeta(link);
                        const subCatName = link.subCategory || link.type || 'Resource';

                        return (
                          <div
                            key={link.id}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-2xs hover:shadow-md hover:border-brand/40 dark:hover:border-brand/40 transition-all group flex flex-col justify-between gap-2.5"
                          >
                            {/* Top Row: Icon Badge & Title */}
                            <div className="flex items-start gap-2.5 min-w-0">
                              <FileIconBadge link={link} meta={meta} />

                              <div className="min-w-0 flex-1 pt-0.5">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="-translate-y-0.5 font-bold text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 hover:text-brand transition-colors line-clamp-2 leading-snug block"
                                  title={link.name}
                                >
                                  {link.name}
                                </a>
                              </div>
                            </div>
                            <p className="text-[11px] p-1 border border-gray-200 bg-amber-50 rounded-sm line-clamp-1 overflow-hidden">{link.url}</p>
                            {/* Bottom Row: Metadata on Left & Action Icons on Right */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 min-w-0 flex-1">
                                {/* {subCatName && (
                                  <span className="font-medium text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                                    {subCatName}
                                  </span>
                                )} */}
                                {/* <span>•</span> */}
                                <span className="truncate">{link.sharedBy || 'Sambit'}</span>
                              </div>

                              {/* Action Buttons Group */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(link.url, link.id)}
                                  className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand rounded transition-colors border border-slate-200/70 dark:border-slate-700"
                                  title="Copy URL"
                                >
                                  {copiedId === link.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand rounded transition-colors border border-slate-200/70 dark:border-slate-700"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => setEditingLink(link)}
                                  className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand rounded transition-colors border border-slate-200/70 dark:border-slate-700"
                                  title="Edit / Update link"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                {onDeleteLink && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteLink(link.id)}
                                    className="p-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-500 hover:text-rose-600 dark:text-rose-400 rounded transition-colors border border-rose-200/70 dark:border-rose-800/80"
                                    title="Delete link"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Link Modal Dialog */}
      <AddLinkModal
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        currentUser={users[0]}
        onUpdateLink={onUpdateLink}
        initialData={editingLink}
      />
    </div>
  );
}
