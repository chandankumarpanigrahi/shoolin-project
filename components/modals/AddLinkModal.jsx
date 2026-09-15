'use client';

import React, { useState } from 'react';
import {
  X,
  Link2,
  Plus,
  Globe,
  FileText,
  Share2,
  HardDrive,
  FileSpreadsheet,
  Layout,
  BookOpen,
  Image,
  Shield,
  Sparkles,
  Smartphone,
  Terminal,
  GitBranch,
  Cloud,
  Layers,
  Activity,
  FolderKanban
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

export const CATEGORIES_CONFIG = {
  'Social': [
    { name: 'Instagram', icon: InstagramSvg, textColor: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800' },
    { name: 'Facebook', icon: FacebookSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
    { name: 'LinkedIn', icon: LinkedinSvg, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800' },
    { name: 'YouTube', icon: YoutubeSvg, textColor: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800' },
    { name: 'X (Twitter)', icon: XSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
    { name: 'WhatsApp', icon: WhatsappSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
    { name: 'TikTok', icon: TiktokSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
    { name: 'Telegram', icon: TelegramSvg, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800' },
    { name: 'Discord', icon: DiscordSvg, textColor: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' },
    { name: 'Pinterest', icon: PinterestSvg, textColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800' },
    { name: 'Other Social', icon: Share2, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' }
  ],
  'Websites': [
    { name: 'Official Website', icon: Globe, textColor: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800' },
    { name: 'Admin Panel', icon: Shield, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
    { name: 'Staging / QA', icon: Sparkles, textColor: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800' },
    { name: 'App Store', icon: Smartphone, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800' },
    { name: 'API Portal', icon: Terminal, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
    { name: 'Stripe Portal', icon: StripeSvg, textColor: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' }
  ],
  'Assets': [
    { name: 'Google Drive', icon: GoogledriveSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
    { name: 'Google Sheets', icon: GooglesheetsSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
    { name: 'Google Docs', icon: GoogledocsSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
    { name: 'Google Slides', icon: GoogleslidesSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
    { name: 'Google Forms', icon: GoogleformsSvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
    { name: 'Google Meet', icon: GooglemeetSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
    { name: 'Google Calendar', icon: GooglecalendarSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
    { name: 'Gmail', icon: GmailSvg, textColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800' },
    { name: 'Figma', icon: FigmaSvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
    { name: 'Canva', icon: CanvaSvg, textColor: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800' },
    { name: 'Notion', icon: NotionSvg, textColor: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
    { name: 'Airtable', icon: AirtableSvg, textColor: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800' },
    { name: 'Miro', icon: MiroSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
    { name: 'Brand Assets / Logo', icon: Image, textColor: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800' }
  ],
  'Tools': [
    { name: 'GitHub', icon: GithubSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
    { name: 'GitLab', icon: GitlabSvg, textColor: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800' },
    { name: 'AWS Console', icon: AwsSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
    { name: 'Docker', icon: DockerSvg, textColor: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800' },
    { name: 'Vercel', icon: VercelSvg, textColor: 'text-slate-900 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
    { name: 'Postman', icon: PostmanSvg, textColor: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800' },
    { name: 'Jira', icon: JiraSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
    { name: 'Trello', icon: TrelloSvg, textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
    { name: 'ClickUp', icon: ClickupSvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
    { name: 'Asana', icon: AsanaSvg, textColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800' },
    { name: 'Sentry', icon: SentrySvg, textColor: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
    { name: 'Firebase', icon: FirebaseSvg, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
    { name: 'Supabase', icon: SupabaseSvg, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' }
  ]
};

// Resilient Category Matcher so custom/manual renames never disconnect existing links
export function normalizeCategoryKey(cat) {
  if (!cat) return 'websites';
  const c = String(cat).toLowerCase().trim();
  if (c.includes('social')) return 'social';
  if (c.includes('web') || c.includes('portal') || c.includes('site')) return 'websites';
  if (c.includes('asset') || c.includes('doc') || c.includes('file')) return 'assets';
  if (c.includes('tool') || c.includes('dev') || c.includes('cloud')) return 'tools';
  return c;
}

export function isCategoryMatch(catA, catB) {
  if (!catA || !catB) return false;
  if (catA === catB) return true;
  if (String(catA).toLowerCase().trim() === String(catB).toLowerCase().trim()) return true;
  return normalizeCategoryKey(catA) === normalizeCategoryKey(catB);
}

export function getCategoryConfig(catName) {
  if (CATEGORIES_CONFIG[catName]) return CATEGORIES_CONFIG[catName];
  const matchedKey = Object.keys(CATEGORIES_CONFIG).find(k => isCategoryMatch(k, catName));
  return matchedKey ? CATEGORIES_CONFIG[matchedKey] : (CATEGORIES_CONFIG['Websites'] || Object.values(CATEGORIES_CONFIG)[0] || []);
}

export function resolveCategoryKey(catName) {
  if (CATEGORIES_CONFIG[catName]) return catName;
  const matchedKey = Object.keys(CATEGORIES_CONFIG).find(k => isCategoryMatch(k, catName));
  return matchedKey || Object.keys(CATEGORIES_CONFIG)[0] || 'Social';
}

export function AddLinkModal({
  isOpen,
  onClose,
  currentUser,
  onAddLink,
  onUpdateLink,
  initialData = null
}) {
  const defaultCategory = Object.keys(CATEGORIES_CONFIG)[0] || 'Social';
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [brand, setBrand] = useState('PMV');
  const [category, setCategory] = useState(defaultCategory);
  const [subCategory, setSubCategory] = useState('Instagram');

  const isEditMode = !!initialData;

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setUrl(initialData.url || '');
      setBrand(initialData.brand || 'PMV');
      setCategory(resolveCategoryKey(initialData.category));
      setSubCategory(initialData.subCategory || initialData.type || 'Instagram');
    } else {
      setName('');
      setUrl('');
      setBrand('PMV');
      setCategory(defaultCategory);
      const firstSub = getCategoryConfig(defaultCategory)[0]?.name || 'Instagram';
      setSubCategory(firstSub);
    }
  }, [initialData, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const subList = getCategoryConfig(cat) || [];
    setSubCategory(subList[0]?.name || 'Other');
  };

  const currentSubCategoryMeta = (getCategoryConfig(category) || []).find(s => s.name === subCategory) || {
    name: subCategory,
    icon: Globe,
    textColor: 'text-cyan-600',
    bg: 'bg-cyan-50 border-cyan-200'
  };

  const SubIcon = currentSubCategoryMeta.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    if (isEditMode && initialData) {
      const updatedLink = {
        ...initialData,
        name: name.trim(),
        url: cleanUrl,
        brand,
        category,
        type: subCategory,
        subCategory,
        updatedDate: new Date().toISOString().split('T')[0]
      };
      if (onUpdateLink) onUpdateLink(updatedLink);
    } else {
      const newLink = {
        id: "lnk-" + Date.now(),
        name: name.trim(),
        url: cleanUrl,
        brand,
        category,
        type: subCategory,
        subCategory,
        addedBy: currentUser?.id || 'usr-1',
        sharedBy: currentUser?.name || 'Sambit',
        updatedDate: new Date().toISOString().split('T')[0],
        description: "Shared project resource link."
      };
      if (onAddLink) onAddLink(newLink);
    }

    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-sm shadow-2xl overflow-hidden text-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isEditMode ? 'Edit Resource Link' : 'Pin Project Resource Link'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Folder</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="PMV">PMV Maritime</option>
                <option value="FreshPod">FreshPod App</option>
                <option value="Lagos">Lagos Logistics</option>
                <option value="Internal">Internal Org</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                {Object.keys(CATEGORIES_CONFIG).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub-Category</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                {(getCategoryConfig(category) || []).map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Instagram Creator Channel or Production Portal"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-sm text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resource URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/brand or https://drive.google.com/..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-sm text-xs font-mono text-brand focus:outline-none focus:border-brand"
            />
          </div>


          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-gray-100 dark:bg-gray-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-sm shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pin Resource Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
