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

// Updated to match the user's new specific categorization and order requirements
export interface FormattedProfile {
  name: string; // For the title "某某简介"
  titles: string[]; // 1. 职称头衔
  career: string[]; // 2. 从业经历
  education: string[]; // 3. 教育经历
  researchDirection: string[]; // 4. 研究方向
  topics: string[]; // 5. 主讲课题
  teachingStyle: string; // 6. 授课风格
  achievements: string[]; // 7. 研究成果
  teachingExperience: string[]; // 8. 授课经历 (Includes serving clients/enterprises)
  otherContent: string[]; // 9. 其他内容 (Unmatched content)
  teachingImages: string[]; // 10. 授课图片 (Textual descriptions or placeholders)
  profileImage?: string; // Base64 string of the uploaded profile image
}

// Schema structure for Gemini
export const PROFILE_SCHEMA_PROPS = {
  name: { type: 'STRING', description: "The name of the person." },
  titles: { type: 'ARRAY', items: { type: 'STRING' }, description: "Professional titles, ranks, or honorifics (职称头衔)." },
  career: { type: 'ARRAY', items: { type: 'STRING' }, description: "Work history and professional experience (从业经历)." },
  education: { type: 'ARRAY', items: { type: 'STRING' }, description: "Educational background details (教育经历)." },
  researchDirection: { type: 'ARRAY', items: { type: 'STRING' }, description: "Fields of research or specialization (研究方向)." },
  topics: { type: 'ARRAY', items: { type: 'STRING' }, description: "Main subjects or courses taught (主讲课题)." },
  teachingStyle: { type: 'STRING', description: "Description of teaching style or personality (授课风格)." },
  achievements: { type: 'ARRAY', items: { type: 'STRING' }, description: "Academic or professional achievements, publications, awards (研究成果)." },
  teachingExperience: { type: 'ARRAY', items: { type: 'STRING' }, description: "Specific teaching history, training experience, and details about serving clients or enterprises (授课经历，含服务客户/企业)." },
  otherContent: { type: 'ARRAY', items: { type: 'STRING' }, description: "Any content that does not fit into the other categories (其他内容)." },
  teachingImages: { type: 'ARRAY', items: { type: 'STRING' }, description: "Descriptions or captions of teaching images found in text (授课图片)." },
};