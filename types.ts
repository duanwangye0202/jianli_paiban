export enum ProcessingStatus {
  IDLE = 'IDLE',
  READING = 'READING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface DocFile {
  id: string;
  file: File;
  rawText: string;
  status: ProcessingStatus;
  error?: string;
  result?: FormattedProfile;
}

// Matches the user's specific categorization requirements
export interface FormattedProfile {
  name: string; // For the title "某某简介"
  titles: string[]; // 职称头衔
  education: string[]; // 教育经历
  career: string[]; // 从业经历
  researchDirection: string[]; // 研究方向
  topics: string[]; // 主讲课题
  teachingStyle: string; // 授课风格 (often a paragraph)
  achievements: string[]; // 研究成果
  teachingExperience: string[]; // 授课经历
}

// Schema structure for Gemini
export const PROFILE_SCHEMA_PROPS = {
  name: { type: 'STRING', description: "The name of the person." },
  titles: { type: 'ARRAY', items: { type: 'STRING' }, description: "Professional titles, ranks, or honorifics (职称头衔)." },
  education: { type: 'ARRAY', items: { type: 'STRING' }, description: "Educational background details (教育经历)." },
  career: { type: 'ARRAY', items: { type: 'STRING' }, description: "Work history and professional experience (从业经历)." },
  researchDirection: { type: 'ARRAY', items: { type: 'STRING' }, description: "Fields of research or specialization (研究方向)." },
  topics: { type: 'ARRAY', items: { type: 'STRING' }, description: "Main subjects or courses taught (主讲课题)." },
  teachingStyle: { type: 'STRING', description: "Description of teaching style or personality (授课风格)." },
  achievements: { type: 'ARRAY', items: { type: 'STRING' }, description: "Academic or professional achievements, publications, awards (研究成果)." },
  teachingExperience: { type: 'ARRAY', items: { type: 'STRING' }, description: "Specific teaching history or training experience (授课经历)." },
};