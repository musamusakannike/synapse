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

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${course.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add title page
    doc.fontSize(28).font("Helvetica-Bold").text(course.title, { align: "center" });
    doc.moveDown();

    if (course.description) {
      doc.fontSize(12).font("Helvetica").text(course.description, { align: "center" });
      doc.moveDown();
    }

    doc.fontSize(10).text(`Level: ${course.settings.level}`, { align: "center" });
    doc.fontSize(10).text(`Generated: ${new Date(course.createdAt).toLocaleDateString()}`, { align: "center" });
    doc.addPage();

    // Add table of contents
    doc.fontSize(20).font("Helvetica-Bold").text("Table of Contents", { underline: true });
    doc.moveDown();
    doc.fontSize(12).font("Helvetica");

    course.outline.forEach((section, index) => {
      doc.text(`${index + 1}. ${section.section}`);
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection, subIndex) => {
          doc.text(`   ${index + 1}.${subIndex + 1}. ${subsection}`);
        });
      }
      doc.moveDown(0.5);
    });

    doc.addPage();

    // Add content
    course.outline.forEach((section, sectionIndex) => {
      // Main section
      doc.fontSize(18).font("Helvetica-Bold").text(`${sectionIndex + 1}. ${section.section}`);
      doc.moveDown();

      const sectionContent = course.content.find(
        (c) => c.section === section.section && !c.subsection
      );
      if (sectionContent) {
        doc.fontSize(11).font("Helvetica").text(sectionContent.explanation, { align: "justify" });
        doc.moveDown();
      }

      // Subsections
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection, subIndex) => {
          doc.fontSize(14).font("Helvetica-Bold").text(`${sectionIndex + 1}.${subIndex + 1}. ${subsection}`);
          doc.moveDown(0.5);

          const subsectionContent = course.content.find(
            (c) => c.section === section.section && c.subsection === subsection
          );
          if (subsectionContent) {
            doc.fontSize(11).font("Helvetica").text(subsectionContent.explanation, { align: "justify" });
            doc.moveDown();
          }
        });
      }

      // Add page break after each main section (except the last one)
      if (sectionIndex < course.outline.length - 1) {
        doc.addPage();
      }
    });

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
