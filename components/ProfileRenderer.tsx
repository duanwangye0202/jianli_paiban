import React from 'react';
import { FormattedProfile } from '../types';

interface ProfileRendererProps {
  data: FormattedProfile;
}

const Section: React.FC<{ title: string; items: string[] | string; icon?: React.ReactNode }> = ({ title, items, icon }) => {
  const hasContent = Array.isArray(items) ? items.length > 0 : !!items;

  if (!hasContent) return null;

  return (
    <div className="mb-8">
      <h3 className="flex items-center text-lg font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 font-serif tracking-wide">
        <span className="mr-2 text-indigo-600">{icon}</span>
        {title}
      </h3>
      <div className="pl-1">
        {Array.isArray(items) ? (
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start text-slate-700 leading-relaxed">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-3 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{items}</p>
        )}
      </div>
    </div>
  );
};

// Icons as simple SVGs
const Icons = {
  Title: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
  ),
  Education: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 0 6-1 6-1v-7"/></svg>
  ),
  Career: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  Research: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M12 2v2"/><path d="M12 20v2"/></svg>
  ),
  Topic: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  Style: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  ),
  Achievement: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
  ),
  TeachingExp: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  )
};

export const ProfileRenderer: React.FC<ProfileRendererProps> = ({ data }) => {
  return (
    <div className="bg-white text-slate-900 w-full max-w-4xl mx-auto shadow-sm border border-slate-100 p-8 md:p-12 min-h-[29.7cm]">
      <header className="text-center mb-12 border-b-4 border-slate-800 pb-6">
        <h1 className="text-4xl font-serif font-bold tracking-wider text-slate-900 mb-2">
          {data.name}简介
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <Section title="职称头衔" items={data.titles} icon={Icons.Title} />
        <Section title="教育经历" items={data.education} icon={Icons.Education} />
        <Section title="从业经历" items={data.career} icon={Icons.Career} />
        <Section title="研究方向" items={data.researchDirection} icon={Icons.Research} />
        <Section title="主讲课题" items={data.topics} icon={Icons.Topic} />
        <Section title="授课风格" items={data.teachingStyle} icon={Icons.Style} />
        <Section title="研究成果" items={data.achievements} icon={Icons.Achievement} />
        <Section title="授课经历" items={data.teachingExperience} icon={Icons.TeachingExp} />
      </div>

      <footer className="mt-16 pt-6 border-t border-slate-100 text-center text-slate-400 text-sm">
        Generated by BioCraft AI
      </footer>
    </div>
  );
};