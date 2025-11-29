import React, { useState, useEffect, useRef } from 'react';
import { FormattedProfile } from '../types';

interface ProfileRendererProps {
  data: FormattedProfile;
  onUpdate: (updatedData: FormattedProfile) => void;
}

interface EditableSectionProps {
  title: string;
  value: string[] | string;
  fieldKey: keyof FormattedProfile;
  icon?: React.ReactNode;
  isArray: boolean;
  onSave: (key: keyof FormattedProfile, val: string[] | string) => void;
  sideElement?: React.ReactNode; // New prop for side content (e.g., image)
}

// Helper component for Image Upload
const ImageUploader: React.FC<{ value?: string; onChange: (base64: string) => void }> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="relative w-[150px] h-[200px] border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 transition-colors flex flex-col items-center justify-center cursor-pointer bg-slate-50 group overflow-hidden"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {value ? (
        <>
          <img src={value} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="text-white text-xs font-medium px-2 py-1 border border-white rounded">Change Photo</span>
          </div>
        </>
      ) : (
        <div className="text-center p-2">
          <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-slate-400 font-medium">Add Photo</span>
        </div>
      )}
    </div>
  );
};

const EditableSection: React.FC<EditableSectionProps> = ({ title, value, fieldKey, icon, isArray, onSave, sideElement }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const isEmpty = Array.isArray(value) ? value.length === 0 : !value;

  useEffect(() => {
    if (isEditing) {
      setEditValue(Array.isArray(value) ? value.join('\n') : value || '');
    }
  }, [isEditing, value]);

  const handleSave = () => {
    let newValue: string | string[];
    
    if (isArray) {
      // Filter out empty lines for arrays
      newValue = editValue.split('\n').map(s => s.trim()).filter(s => s !== '');
    } else {
      newValue = editValue.trim();
    }
    
    onSave(fieldKey, newValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="mb-8 group">
      <h3 className="flex items-center justify-between text-lg font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 font-serif tracking-wide">
        <div className="flex items-center">
          <span className="mr-2 text-indigo-600">{icon}</span>
          {title}
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-indigo-600"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
        )}
      </h3>
      
      <div className="pl-1 flex gap-6">
        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3 animate-fade-in">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none min-h-[120px] text-slate-700 leading-relaxed text-sm font-sans bg-white"
                placeholder={isArray ? "Enter each item on a new line..." : "Enter text..."}
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              {isEmpty ? (
                <div 
                  onClick={() => setIsEditing(true)}
                  className="text-slate-300 italic text-sm cursor-pointer hover:text-slate-400 border border-dashed border-transparent hover:border-slate-200 p-2 rounded"
                >
                  (No content - Click to add)
                </div>
              ) : (
                <div>
                  {Array.isArray(value) ? (
                    <ul className="space-y-2">
                      {value.map((item, idx) => (
                        <li key={idx} className="flex items-start text-slate-700 leading-relaxed">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-3 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Side Element (Image) */}
        {sideElement && (
          <div className="flex-shrink-0">
            {sideElement}
          </div>
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
  ),
  Other: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
  ),
  Images: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  )
};

export const ProfileRenderer: React.FC<ProfileRendererProps> = ({ data, onUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(data.name);

  useEffect(() => {
    setNameValue(data.name);
  }, [data.name]);

  const handleUpdate = (key: keyof FormattedProfile, value: string[] | string) => {
    onUpdate({
      ...data,
      [key]: value
    });
  };

  const saveName = () => {
    handleUpdate('name', nameValue);
    setIsEditingName(false);
  };

  return (
    <div className="bg-white text-slate-900 w-full max-w-4xl mx-auto shadow-sm border border-slate-100 p-8 md:p-12 min-h-[29.7cm]">
      <header className="text-center mb-12 border-b-4 border-slate-800 pb-6 group relative">
        {isEditingName ? (
          <div className="flex flex-col items-center gap-2">
            <input 
              value={nameValue} 
              onChange={(e) => setNameValue(e.target.value)}
              className="text-4xl font-serif font-bold tracking-wider text-slate-900 text-center border-b border-indigo-500 outline-none w-full max-w-md bg-white"
              autoFocus
            />
            <div className="flex gap-2">
               <button onClick={() => setIsEditingName(false)} className="text-xs px-2 py-1 bg-gray-200 rounded">Cancel</button>
               <button onClick={saveName} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">Save</button>
            </div>
          </div>
        ) : (
          <h1 className="text-4xl font-serif font-bold tracking-wider text-slate-900 mb-2 relative inline-block">
             {data.name}简介
             <button 
               onClick={() => setIsEditingName(true)}
               className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
             </button>
          </h1>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4">
        <EditableSection 
          title="职称头衔" 
          fieldKey="titles"
          value={data.titles} 
          icon={Icons.Title} 
          isArray={true}
          onSave={handleUpdate}
          sideElement={
            <ImageUploader 
              value={data.profileImage} 
              onChange={(base64) => handleUpdate('profileImage', base64)} 
            />
          }
        />
        <EditableSection 
          title="从业经历" 
          fieldKey="career"
          value={data.career} 
          icon={Icons.Career} 
          isArray={true}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="教育经历" 
          fieldKey="education"
          value={data.education} 
          icon={Icons.Education} 
          isArray={true}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="研究方向" 
          fieldKey="researchDirection"
          value={data.researchDirection} 
          icon={Icons.Research} 
          isArray={true}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="主讲课题" 
          fieldKey="topics"
          value={data.topics} 
          icon={Icons.Topic} 
          isArray={true}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="授课风格" 
          fieldKey="teachingStyle"
          value={data.teachingStyle} 
          icon={Icons.Style} 
          isArray={false}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="研究成果" 
          fieldKey="achievements"
          value={data.achievements} 
          icon={Icons.Achievement} 
          isArray={true}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="授课经历" 
          fieldKey="teachingExperience"
          value={data.teachingExperience} 
          icon={Icons.TeachingExp} 
          isArray={true}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="其他内容" 
          fieldKey="otherContent"
          value={data.otherContent} 
          icon={Icons.Other} 
          isArray={true}
          onSave={handleUpdate}
        />
        <EditableSection 
          title="授课图片" 
          fieldKey="teachingImages"
          value={data.teachingImages} 
          icon={Icons.Images} 
          isArray={true}
          onSave={handleUpdate}
        />
      </div>

      <footer className="mt-16 pt-6 border-t border-slate-100 text-center text-slate-400 text-sm">
        Generated by BioCraft AI • Hover over sections to edit
      </footer>
    </div>
  );
};