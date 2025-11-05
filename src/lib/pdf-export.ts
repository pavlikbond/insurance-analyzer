import jsPDF from "jspdf";

interface PDFElement {
  type: "heading" | "paragraph" | "list" | "code" | "blockquote" | "horizontalRule";
  level?: number; // For headings (1-6)
  text?: string; // Optional - not needed for lists and horizontalRule
  items?: PDFListItem[]; // For lists
  ordered?: boolean; // For lists
}

interface PDFListItem {
  text: string;
  level: number; // Nesting level (0 = top level, 1 = nested, etc.)
}

/**
 * Export markdown content as a text-based PDF
 * @param markdownContent - The markdown content to export
 * @param filename - The filename for the PDF
 */
export async function exportMarkdownToPDF(markdownContent: string, filename: string): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Ensure proper font is set for all text
  pdf.setFont("helvetica");

  // Parse markdown into structured elements
  const elements = parseMarkdown(markdownContent);

  // PDF settings
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  const lineHeight = 6;
  const paragraphSpacing = 3;

  // Process each element
  for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
    const element = elements[elementIndex];
    // Check if we need a new page
    if (yPosition > pageHeight - margin - 20) {
      pdf.addPage();
      yPosition = margin;
    }

    switch (element.type) {
      case "heading": {
        const headingSize = 18 - (element.level || 1) * 2;
        pdf.setFontSize(headingSize);
        pdf.setFont("helvetica", "bold");
        const cleanedHeading = cleanTextForPDF(element.text || "");
        const headingText = pdf.splitTextToSize(cleanedHeading, maxWidth);
        pdf.text(headingText, margin, yPosition);
        yPosition += headingText.length * (headingSize * 0.35) + paragraphSpacing;
        break;
      }

      case "paragraph": {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const cleanedParagraph = cleanTextForPDF(element.text || "");
        const paragraphText = pdf.splitTextToSize(cleanedParagraph, maxWidth);
        pdf.text(paragraphText, margin, yPosition);
        yPosition += paragraphText.length * lineHeight + paragraphSpacing;
        break;
      }

      case "list":
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        if (element.items) {
          for (let i = 0; i < element.items.length; i++) {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            const item = element.items[i];
            // Calculate indentation: 10mm per nesting level (level 0 = no extra indent, level 1 = 10mm, etc.)
            const indentAmount = item.level * 10; // 10mm indent per nesting level
            const indent = margin + indentAmount;
            const itemWidth = maxWidth - indentAmount;

            // Determine prefix based on list type and level
            let prefix = "";
            if (element.ordered) {
              // For ordered lists, use numbers
              prefix = `${i + 1}. `;
            } else {
              // For unordered lists, use simple ASCII characters for better compatibility
              const bullets = ["-", "-", "-", "-"]; // Use simple dash for all levels
              prefix = `${bullets[Math.min(item.level, bullets.length - 1)]} `;
            }

            // Clean the text and ensure proper encoding
            const cleanedText = cleanTextForPDF(item.text);
            const fullText = prefix + cleanedText;
            const listLines = pdf.splitTextToSize(fullText, itemWidth);
            pdf.text(listLines, indent, yPosition);
            yPosition += listLines.length * lineHeight + 1;
          }
        }
        // Only add spacing after list if not the last element
        if (elementIndex < elements.length - 1) {
          yPosition += paragraphSpacing;
        }
        break;

      case "code": {
        pdf.setFontSize(10);
        pdf.setFont("courier", "normal");
        const cleanedCode = cleanTextForPDF(element.text || "");
        const codeLines = pdf.splitTextToSize(cleanedCode, maxWidth);
        pdf.text(codeLines, margin, yPosition);
        yPosition += codeLines.length * lineHeight + paragraphSpacing;
        break;
      }

      case "blockquote": {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "italic");
        const cleanedQuote = cleanTextForPDF(element.text || "");
        const quoteLines = pdf.splitTextToSize(cleanedQuote, maxWidth - 10);
        pdf.text(quoteLines, margin + 5, yPosition);
        yPosition += quoteLines.length * lineHeight + paragraphSpacing;
        break;
      }

      case "horizontalRule":
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5; // Reduced from 10
        break;
    }
  }

  // Download PDF
  pdf.save(filename);
}

/**
 * Parse markdown into structured elements for PDF generation
 */
function parseMarkdown(markdown: string): PDFElement[] {
  const elements: PDFElement[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inList = false;
  let listItems: PDFListItem[] = [];
  let listOrdered = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const originalLine = lines[i];

    // Handle code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        if (codeBlockContent.length > 0) {
          elements.push({
            type: "code",
            text: codeBlockContent.join("\n"),
          });
        }
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(originalLine);
      continue;
    }

    // Handle headers
    if (line.startsWith("#")) {
      // Close any open list
      if (inList) {
        elements.push({
          type: "list",
          items: listItems,
          ordered: listOrdered,
          text: "", // Required by interface but not used for lists
        });
        listItems = [];
        inList = false;
      }

      const match = line.match(/^(#+)\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = stripMarkdown(match[2]);
        elements.push({
          type: "heading",
          level: Math.min(level, 6),
          text: text,
        });
      }
      continue;
    }

    // Handle horizontal rules
    if (line === "---" || line === "***") {
      if (inList) {
        elements.push({
          type: "list",
          items: listItems,
          ordered: listOrdered,
        });
        listItems = [];
        inList = false;
      }
      elements.push({ type: "horizontalRule", text: "" }); // Required by interface but not used
      continue;
    }

    // Handle lists (including nested lists)
    // Use originalLine (not trimmed) to preserve indentation for nested lists
    const unorderedMatchOriginal = originalLine.match(/^(\s*)[*-]\s+(.+)$/);
    const orderedMatchOriginal = originalLine.match(/^(\s*)\d+\.\s+(.+)$/);

    if (unorderedMatchOriginal || orderedMatchOriginal) {
      const isOrdered = !!orderedMatchOriginal;
      const match = unorderedMatchOriginal || orderedMatchOriginal;
      const leadingWhitespace = match![1];
      // Count spaces (tabs count as 4 spaces for markdown)
      const indent = leadingWhitespace.replace(/\t/g, "    ").length;
      // Standard markdown uses 2 spaces per level, but also support 4
      // Calculate level: 0-1 spaces = level 0, 2-3 spaces = level 1, 4-5 = level 2, etc.
      // For 4-space indentation: 0-3 = level 0, 4-7 = level 1, 8-11 = level 2, etc.
      const spacesPerLevel = indent >= 4 && indent % 4 === 0 ? 4 : 2;
      const level = Math.max(0, Math.floor(indent / spacesPerLevel));
      const itemText = stripMarkdown(unorderedMatchOriginal ? unorderedMatchOriginal[2] : orderedMatchOriginal![2]);

      if (!inList || listOrdered !== isOrdered) {
        if (inList) {
          elements.push({
            type: "list",
            items: listItems,
            ordered: listOrdered,
            text: "", // Required by interface but not used for lists
          });
        }
        listItems = [];
        listOrdered = isOrdered;
        inList = true;
      }
      listItems.push({
        text: itemText,
        level: level,
      });
      continue;
    } else {
      // Close list if we're not in a list item anymore
      if (inList) {
        elements.push({
          type: "list",
          items: listItems,
          ordered: listOrdered,
          text: "", // Required by interface but not used for lists
        });
        listItems = [];
        inList = false;
      }
    }

    // Handle blockquotes
    if (line.startsWith(">")) {
      const quoteText = stripMarkdown(line.substring(1).trim());
      elements.push({
        type: "blockquote",
        text: quoteText,
      });
      continue;
    }

    // Handle regular paragraphs
    if (line) {
      const cleanText = stripMarkdown(line);
      if (cleanText && cleanText.trim()) {
        elements.push({
          type: "paragraph",
          text: cleanText,
        });
      }
    }
    // Skip empty lines - don't add spacing paragraphs
  }

  // Close any remaining list or code block
  if (inList && listItems.length > 0) {
    elements.push({
      type: "list",
      items: listItems,
      ordered: listOrdered,
      text: "", // Required by interface but not used for lists
    });
  }

  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push({
      type: "code",
      text: codeBlockContent.join("\n"),
    });
  }

  return elements;
}

/**
 * Clean text for PDF output - removes problematic characters and ensures proper encoding
 */
function cleanTextForPDF(text: string): string {
  return (
    text
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      // Replace non-breaking spaces with regular spaces
      .replace(/\u00A0/g, " ")
      // Replace smart quotes with regular quotes
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      // Replace em dashes and en dashes with regular dashes
      .replace(/\u2014/g, "--")
      .replace(/\u2013/g, "-")
      // Replace ellipsis with three periods
      .replace(/\u2026/g, "...")
      // Remove any other problematic Unicode characters
      .replace(/[\u2022]/g, "-") // Bullet to dash
      .trim()
  );
}

/**
 * Strip markdown formatting and return plain text
 * Also cleans up any problematic characters
 */
function stripMarkdown(text: string): string {
  return (
    text
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove bold
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      // Remove italic
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      // Clean up any remaining markdown-like syntax
      .replace(/^#{1,6}\s+/gm, "") // Remove header markers
      .replace(/^>\s+/gm, "") // Remove blockquote markers
      .trim()
  );
}
