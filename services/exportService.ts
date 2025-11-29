import { FormattedProfile } from '../types';

declare const docx: any;

export const generateAndDownloadDocx = async (profile: FormattedProfile) => {
  if (typeof docx === 'undefined') {
    alert("Docx library not loaded. Please check your internet connection.");
    return;
  }

  const { 
    Document, 
    Packer, 
    Paragraph, 
    TextRun, 
    HeadingLevel, 
    AlignmentType, 
    ImageRun, 
    HorizontalPositionRelativeFrom, 
    HorizontalPositionAlign, 
    VerticalPositionRelativeFrom, 
    VerticalPositionAlign, 
    TextWrappingType, 
    TextWrappingSide 
  } = docx;

  // Helper to create a consistent section with a title and content
  const createSection = (title: string, content: string[] | string, imageBase64?: string) => {
    // Skip empty sections (except if we have an image for titles, we might want to show it even if titles are empty)
    if ((!content || (Array.isArray(content) && content.length === 0)) && !imageBase64) {
      return [];
    }

    const sectionElements = [];

    // Section Title (Styled as Heading 2 with a bottom border)
    sectionElements.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: "94a3b8", // Slate-400 equivalent
            space: 4,
            style: "single",
            size: 6,
          },
        },
      })
    );

    // Special handling for the section with an image (likely "职称头衔")
    if (imageBase64) {
      // 1. Prepare the Image
      // Strip the data:image/png;base64, prefix if present
      const base64Data = imageBase64.split(',')[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create a Floating Image Run
      // This tells Word to position the image absolutely on the right, allowing text to exist on the left.
      // No table is used, so no borders will appear.
      const imageRun = new ImageRun({
        data: bytes,
        transformation: {
          width: 150, // Fixed width
          height: 200, // Fixed height (maintain ~3:4 aspect)
        },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.COLUMN, // Align relative to the page margin/column
            align: HorizontalPositionAlign.RIGHT,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PARAGRAPH, // Align relative to the top of the paragraph it's inserted in
            align: VerticalPositionAlign.TOP,
          },
          wrap: {
            type: TextWrappingType.SQUARE, // Text wraps around the box
            side: TextWrappingSide.LEFT, // Text stays on the left side
          },
          margins: {
            left: 200, // Add some breathing room between text and image
            bottom: 100,
          }
        },
      });

      // 2. Render Content with Image injected into the first paragraph
      if (Array.isArray(content) && content.length > 0) {
        content.forEach((item, index) => {
          const children: any[] = [new TextRun({ text: item, size: 24 })];
          
          // Inject the floating image into the VERY FIRST paragraph of the list.
          // In Word, a floating image must be anchored to a paragraph.
          if (index === 0) {
            children.unshift(imageRun);
          }

          sectionElements.push(
            new Paragraph({
              children: children,
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );
        });
      } else if (typeof content === 'string' && content.length > 0) {
        // Single paragraph string
        sectionElements.push(
          new Paragraph({
            children: [imageRun, new TextRun({ text: content, size: 24 })],
            spacing: { after: 100 },
          })
        );
      } else {
        // Image only, no text
         sectionElements.push(
          new Paragraph({
            children: [imageRun],
            spacing: { after: 100 },
          })
        );
      }

    } else {
      // Standard text-only content rendering (No Image)
      if (Array.isArray(content)) {
        content.forEach((item) => {
          sectionElements.push(
            new Paragraph({
              children: [new TextRun({ text: item, size: 24 })], // 12pt font
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );
        });
      } else {
        // String content (paragraphs)
        sectionElements.push(
          new Paragraph({
            children: [new TextRun({ text: content, size: 24 })], // 12pt font
            spacing: { after: 100 },
          })
        );
      }
    }

    return sectionElements;
  };

  // Construct the document structure with the new order
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Main Title: [Name]简介
          new Paragraph({
            text: `${profile.name}简介`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          // Sections in the specific requested order:
          // 1. 职称头衔 (Pass profileImage here)
          ...createSection("职称头衔", profile.titles, profile.profileImage),
          // 2. 从业经历
          ...createSection("从业经历", profile.career),
          // 3. 教育经历
          ...createSection("教育经历", profile.education),
          // 4. 研究方向
          ...createSection("研究方向", profile.researchDirection),
          // 5. 主讲课题
          ...createSection("主讲课题", profile.topics),
          // 6. 授课风格
          ...createSection("授课风格", profile.teachingStyle),
          // 7. 研究成果
          ...createSection("研究成果", profile.achievements),
          // 8. 授课经历
          ...createSection("授课经历", profile.teachingExperience),
          // 9. 其他内容
          ...createSection("其他内容", profile.otherContent),
          // 10. 授课图片
          ...createSection("授课图片", profile.teachingImages),
        ],
      },
    ],
    // Global Styles
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 48, // 24pt
            bold: true,
            font: "Merriweather", 
            color: "1e293b", // Slate-800
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 32, // 16pt
            bold: true,
            font: "Merriweather",
            color: "334155", // Slate-700
          },
        },
        {
          id: "Normal",
          name: "Normal",
          quickFormat: true,
          run: {
            size: 24, // 12pt
            font: "Inter",
            color: "334155",
          },
        }
      ]
    }
  });

  try {
    // Generate Blob and trigger download
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const anchorElement = document.createElement("a");
    document.body.appendChild(anchorElement);
    anchorElement.href = url;
    anchorElement.download = `${profile.name}_简介.docx`;
    anchorElement.click();
    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating docx:", error);
    alert("Failed to generate document.");
  }
};