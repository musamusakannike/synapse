const Course = require("../models/course.model");
const GeminiService = require("../config/gemini.config");
const PDFDocument = require("pdfkit");

// POST /api/courses
// Body: { title, description?, settings? }
async function createCourse(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, description, settings = {} } = req.body || {};
    if (!title) return res.status(400).json({ message: "Title is required" });

    // Create course with initial status
    const course = await Course.create({
      userId,
      title,
      description: description || undefined,
      settings: {
        level: settings.level || "intermediate",
        includeExamples: settings.includeExamples !== false,
        includePracticeQuestions: settings.includePracticeQuestions || false,
        detailLevel: settings.detailLevel || "moderate",
      },
      status: "generating_outline",
      outline: [],
      content: [],
    });

    // Generate outline asynchronously
    generateCourseOutlineAsync(course._id, title, description, course.settings);

    return res.status(201).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Async function to generate outline and content
async function generateCourseOutlineAsync(courseId, title, description, settings) {
  try {
    // Generate outline
    const outlineData = await GeminiService.generateCourseOutline(
      title,
      description,
      settings
    );

    const course = await Course.findById(courseId);
    if (!course) return;

    course.outline = outlineData.outline || [];
    course.status = "generating_content";
    await course.save();

    // Generate content for each section and subsection
    const contentArray = [];
    for (const section of course.outline) {
      // Generate content for main section
      const sectionContent = await GeminiService.generateSectionContent(
        title,
        section.section,
        null,
        settings
      );
      contentArray.push({
        section: section.section,
        subsection: null,
        explanation: sectionContent,
      });

      // Generate content for each subsection
      if (section.subsections && section.subsections.length > 0) {
        for (const subsection of section.subsections) {
          const subsectionContent = await GeminiService.generateSectionContent(
            title,
            section.section,
            subsection,
            settings
          );
          contentArray.push({
            section: section.section,
            subsection: subsection,
            explanation: subsectionContent,
          });
        }
      }
    }

    course.content = contentArray;
    course.status = "completed";
    await course.save();
  } catch (error) {
    console.error("Error generating course:", error);
    const course = await Course.findById(courseId);
    if (course) {
      course.status = "failed";
      await course.save();
    }
  }
}

// GET /api/courses
async function listCourses(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const courses = await Course.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/courses/:id
async function getCourse(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, userId });
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.status(200).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/courses/:id
async function deleteCourse(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const course = await Course.findOneAndDelete({ _id: id, userId });
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/courses/:id/regenerate
async function regenerateCourse(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { settings } = req.body || {};

    const course = await Course.findOne({ _id: id, userId });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Update settings if provided
    if (settings) {
      course.settings = {
        level: settings.level || course.settings.level,
        includeExamples: settings.includeExamples !== undefined ? settings.includeExamples : course.settings.includeExamples,
        includePracticeQuestions: settings.includePracticeQuestions !== undefined ? settings.includePracticeQuestions : course.settings.includePracticeQuestions,
        detailLevel: settings.detailLevel || course.settings.detailLevel,
      };
    }

    course.status = "generating_outline";
    course.outline = [];
    course.content = [];
    await course.save();

    // Regenerate asynchronously
    generateCourseOutlineAsync(course._id, course.title, course.description, course.settings);

    return res.status(200).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/courses/:id/pdf
async function generateCoursePDF(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, userId });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.status !== "completed") {
      return res.status(400).json({ message: "Course is not yet completed" });
    }

    // Create PDF with better margins
    const doc = new PDFDocument({ 
      margin: 60,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: course.title,
        Author: 'Synapse Learning Platform',
        Subject: course.description || course.title,
        Keywords: `${course.settings.level}, education, course`,
      }
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${course.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Define color scheme
    const colors = {
      primary: '#2563eb',      // Blue
      secondary: '#64748b',    // Slate gray
      accent: '#0ea5e9',       // Sky blue
      text: '#1e293b',         // Dark slate
      lightGray: '#f1f5f9',    // Light background
    };

    // Helper function to add decorative line
    const addDecorativeLine = (y, color = colors.primary) => {
      doc.strokeColor(color)
         .lineWidth(2)
         .moveTo(60, y)
         .lineTo(doc.page.width - 60, y)
         .stroke();
    };

    // Add title page with enhanced styling
    doc.moveDown(4);
    
    // Add decorative top line
    addDecorativeLine(doc.y);
    doc.moveDown(2);

    // Main title with shadow effect
    doc.fillColor(colors.primary)
       .fontSize(36)
       .font("Helvetica-Bold")
       .text(course.title, { 
         align: "center",
         lineGap: 8
       });
    
    doc.moveDown(1.5);
    
    // Add decorative bottom line
    addDecorativeLine(doc.y);
    doc.moveDown(2);

    // Description with better styling
    if (course.description) {
      doc.fillColor(colors.text)
         .fontSize(14)
         .font("Helvetica")
         .text(course.description, { 
           align: "center",
           width: 400,
           lineGap: 4
         });
      doc.moveDown(2);
    }

    // Course metadata in a styled box
    const metadataY = doc.y;
    doc.roundedRect(150, metadataY, doc.page.width - 300, 80, 5)
       .fillAndStroke(colors.lightGray, colors.primary);
    
    doc.fillColor(colors.text)
       .fontSize(12)
       .font("Helvetica-Bold")
       .text("Course Details", 150, metadataY + 15, { 
         width: doc.page.width - 300,
         align: "center" 
       });
    
    doc.fontSize(11)
       .font("Helvetica")
       .fillColor(colors.secondary)
       .text(`Level: ${course.settings.level.charAt(0).toUpperCase() + course.settings.level.slice(1)}`, {
         align: "center"
       })
       .text(`Generated: ${new Date(course.createdAt).toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       })}`, {
         align: "center"
       });

    // Add footer to title page
    doc.fontSize(10)
       .fillColor(colors.secondary)
       .text("Powered by Synapse Learning Platform", 
         60, 
         doc.page.height - 80, 
         { align: "center", width: doc.page.width - 120 }
       );

    doc.addPage();

    // Add table of contents with enhanced styling
    doc.fillColor(colors.primary)
       .fontSize(28)
       .font("Helvetica-Bold")
       .text("Table of Contents");
    
    addDecorativeLine(doc.y + 10, colors.accent);
    doc.moveDown(2);

    doc.fontSize(12).font("Helvetica").fillColor(colors.text);

    course.outline.forEach((section, index) => {
      // Main section in TOC
      doc.fillColor(colors.primary)
         .font("Helvetica-Bold")
         .text(`${index + 1}. ${section.section}`, { continued: false });
      
      doc.moveDown(0.3);
      
      // Subsections in TOC
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection, subIndex) => {
          doc.fillColor(colors.text)
             .font("Helvetica")
             .text(`     ${index + 1}.${subIndex + 1}  ${subsection}`, {
               indent: 20
             });
          doc.moveDown(0.2);
        });
      }
      doc.moveDown(0.5);
    });

    doc.addPage();

    // Add content with improved typography
    course.outline.forEach((section, sectionIndex) => {
      // Main section header with background
      const headerY = doc.y;
      
      // Add colored background for section header
      doc.rect(50, headerY - 5, doc.page.width - 100, 35)
         .fillAndStroke(colors.lightGray, colors.primary);
      
      doc.fillColor(colors.primary)
         .fontSize(22)
         .font("Helvetica-Bold")
         .text(`${sectionIndex + 1}. ${section.section}`, 60, headerY + 5);
      
      doc.moveDown(2);

      // Section content with better formatting
      const sectionContent = course.content.find(
        (c) => c.section === section.section && !c.subsection
      );
      
      if (sectionContent) {
        // Format content with proper paragraphs
        const paragraphs = sectionContent.explanation.split('\n\n');
        paragraphs.forEach((paragraph, pIndex) => {
          if (paragraph.trim()) {
            doc.fillColor(colors.text)
               .fontSize(11)
               .font("Helvetica")
               .text(paragraph.trim(), { 
                 align: "justify",
                 lineGap: 3,
                 paragraphGap: 8
               });
            
            if (pIndex < paragraphs.length - 1) {
              doc.moveDown(0.8);
            }
          }
        });
        doc.moveDown(1.5);
      }

      // Subsections with improved styling
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection, subIndex) => {
          // Subsection header
          doc.fillColor(colors.accent)
             .fontSize(16)
             .font("Helvetica-Bold")
             .text(`${sectionIndex + 1}.${subIndex + 1}  ${subsection}`);
          
          // Add subtle underline
          const lineY = doc.y + 3;
          doc.strokeColor(colors.accent)
             .lineWidth(1)
             .moveTo(60, lineY)
             .lineTo(250, lineY)
             .stroke();
          
          doc.moveDown(1);

          const subsectionContent = course.content.find(
            (c) => c.section === section.section && c.subsection === subsection
          );
          
          if (subsectionContent) {
            const paragraphs = subsectionContent.explanation.split('\n\n');
            paragraphs.forEach((paragraph, pIndex) => {
              if (paragraph.trim()) {
                doc.fillColor(colors.text)
                   .fontSize(11)
                   .font("Helvetica")
                   .text(paragraph.trim(), { 
                     align: "justify",
                     lineGap: 3,
                     paragraphGap: 8
                   });
                
                if (pIndex < paragraphs.length - 1) {
                  doc.moveDown(0.8);
                }
              }
            });
            doc.moveDown(1.5);
          }
        });
      }

      // Add page break after each main section (except the last one)
      if (sectionIndex < course.outline.length - 1) {
        doc.addPage();
      }
    });

    // Add page numbers to all pages except the first
    const pages = doc.bufferedPageRange();
    for (let i = 1; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Add footer line
      doc.strokeColor(colors.secondary)
         .lineWidth(0.5)
         .moveTo(60, doc.page.height - 60)
         .lineTo(doc.page.width - 60, doc.page.height - 60)
         .stroke();
      
      // Add page number
      doc.fillColor(colors.secondary)
         .fontSize(9)
         .font("Helvetica")
         .text(
           `Page ${i} of ${pages.count - 1}`,
           60,
           doc.page.height - 50,
           { align: "center", width: doc.page.width - 120 }
         );
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createCourse,
  listCourses,
  getCourse,
  deleteCourse,
  regenerateCourse,
  generateCoursePDF,
};
