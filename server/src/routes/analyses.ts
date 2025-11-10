import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { eq, and, desc } from "drizzle-orm";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import { appConfig } from "../config/index.js";
import { db } from "../db/index.js";
import { contracts, analyses } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { sendErrorResponse } from "../utils/errors.js";
import { sendAnalysisCompleteEmail } from "../utils/email.js";
import { ErrorCode } from "../types/index.js";

// Initialize S3 client
const s3Client = new S3Client({
  region: appConfig.aws.region,
  credentials: {
    accessKeyId: appConfig.aws.accessKeyId,
    secretAccessKey: appConfig.aws.secretAccessKey,
  },
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: appConfig.openaiApiKey,
});

/**
 * Analysis prompt for OpenAI
 */
const ANALYSIS_PROMPT = `You are an expert insurance policy analyst. Analyze the provided insurance policy document and provide a comprehensive, detailed report in Markdown format.

Please examine the document thoroughly and provide a well-structured Markdown report that includes:

1. **Executive Summary**: A comprehensive high-level overview of the policy that should be 3-5 paragraphs. Include:
   - Overall policy purpose and type
   - Key features and notable aspects
   - Most important coverage highlights
   - Any critical information policyholders should know upfront

2. **Key Terms & Conditions**: Extract and summarize important terms including:
   - Deductibles (amounts and types)
   - Coverage limits (per category and aggregate)
   - Premium amounts and payment terms
   - Policy period dates
   - Renewal terms

3. **Coverage Details**: Detailed breakdown of what is covered, including:
   - Types of coverage (property, liability, etc.)
   - Coverage amounts and limits
   - Specific protections and benefits
   - Any special endorsements or riders

4. **Exclusions**: List all exclusions, limitations, and what is NOT covered:
   - Common exclusions
   - Specific policy exclusions
   - Any conditions that void coverage

5. **Premiums & Payment Information**: 
   - Premium amounts (annual, monthly, etc.)
   - Payment schedule
   - Payment methods accepted
   - Late payment terms

6. **Potential Issues & Concerns**: Identify any:
   - Hidden clauses or fine print
   - Coverage gaps that policyholders should be aware of
   - Unusual terms or conditions
   - Areas where the policy might be insufficient

7. **Roofing & Siding Analysis** (if applicable): If this is a property insurance policy, analyze:
   - Roof coverage specifics
   - Siding coverage details
   - Any special conditions or limitations for these items

8. **Recommendations**: Provide actionable recommendations for the policyholder regarding:
   - Areas to review carefully
   - Questions to ask their agent
   - Potential improvements or additional coverage to consider

**IMPORTANT**: 
- Format your entire response as a well-structured Markdown document. Use proper Markdown syntax including:
  - Headers (##, ###) for section titles
  - **Bold** for important terms
  - Bullet points (-) for lists
  - Tables where appropriate
  - Clear section breaks
- DO NOT wrap your response in code blocks (do not use triple backticks with markdown or any other language identifier)
- Return the markdown directly as plain text, not inside a code fence

Be thorough but concise, and focus on actionable insights that help the policyholder understand their coverage.`;

/**
 * POST /api/analyses
 * Generate an analysis for a policy using OpenAI
 */
async function createAnalysis(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Require authentication
    await requireAuth(request, reply);
    const user = request.user;
    if (!user) {
      request.log.warn("Authentication failed or user not found");
      return;
    }

    const body = request.body as { policyId: string };
    const { policyId } = body;

    if (!policyId) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "policyId is required");
    }

    // Get the policy/contract from database
    const [contract] = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, policyId), eq(contracts.userId, user.id), eq(contracts.isDeleted, false)))
      .limit(1);

    if (!contract) {
      return sendErrorResponse(reply, 404, ErrorCode.NOT_FOUND, "Policy not found");
    }

    // Check if analysis already exists
    const [existingAnalysis] = await db.select().from(analyses).where(eq(analyses.contractId, policyId)).limit(1);

    if (existingAnalysis) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "Analysis already exists for this policy");
    }

    // Update contract status to processing
    await db.update(contracts).set({ status: "processing", updatedAt: new Date() }).where(eq(contracts.id, policyId));

    try {
      // Download PDF from S3
      request.log.info(`Downloading PDF from S3: bucket=${contract.s3Bucket}, key=${contract.s3Key}`);
      const getObjectCommand = new GetObjectCommand({
        Bucket: contract.s3Bucket,
        Key: contract.s3Key,
      });

      const s3Response = await s3Client.send(getObjectCommand);

      if (!s3Response.Body) {
        throw new Error("Failed to retrieve file from S3");
      }

      // Convert stream to buffer
      // S3 Body is a Readable stream, convert to buffer
      const chunks: Buffer[] = [];
      const stream = s3Response.Body as NodeJS.ReadableStream;

      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const pdfBuffer = Buffer.concat(chunks);

      // Parse PDF
      request.log.info("Parsing PDF document");
      const pdfData = await pdfParse(pdfBuffer);
      const pdfText = pdfData.text;

      if (!pdfText || pdfText.trim().length === 0) {
        throw new Error("PDF appears to be empty or unreadable");
      }

      request.log.info(`PDF parsed successfully, extracted ${pdfText.length} characters`);

      // Call OpenAI API
      request.log.info("Calling OpenAI API for analysis");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert insurance policy analyst. Provide detailed, thorough analysis of insurance policies.",
          },
          {
            role: "user",
            content: `${ANALYSIS_PROMPT}\n\n---\n\nInsurance Policy Document:\n\n${pdfText}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      let analysisResult = completion.choices[0]?.message?.content;
      if (!analysisResult) {
        throw new Error("OpenAI did not return a valid response");
      }

      // Remove markdown code block wrapper if present
      // Sometimes OpenAI wraps the response in ```markdown ... ```
      analysisResult = analysisResult.trim();
      if (analysisResult.startsWith("```markdown")) {
        // Remove opening ```markdown
        analysisResult = analysisResult.replace(/^```markdown\s*/i, "");
        // Remove closing ```
        analysisResult = analysisResult.replace(/\s*```\s*$/, "");
      } else if (analysisResult.startsWith("```")) {
        // Handle generic code block
        analysisResult = analysisResult.replace(/^```\s*\w*\s*/i, "");
        analysisResult = analysisResult.replace(/\s*```\s*$/, "");
      }
      analysisResult = analysisResult.trim();

      const tokensUsed = completion.usage?.total_tokens || 0;

      request.log.info(`OpenAI analysis complete, tokens used: ${tokensUsed}`);

      // Store analysis in database
      // Store the full markdown in analysisResult
      request.log.info("Storing analysis in database");
      const [newAnalysis] = await db
        .insert(analyses)
        .values({
          contractId: policyId,
          aiModel: "gpt-4o-mini",
          aiTokensUsed: tokensUsed,
          analysisResult: analysisResult, // Full markdown report stored here
        })
        .returning();

      // Update contract status to analyzed
      await db
        .update(contracts)
        .set({
          status: "analyzed",
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, policyId));

      request.log.info(`Analysis stored successfully with id: ${newAnalysis.id}`);

      // Send email notification (non-blocking - don't fail if email fails)
      sendAnalysisCompleteEmail(
        user.email,
        user.name,
        contract.originalFileName,
        newAnalysis.id,
        policyId,
        request.log
      ).catch((error) => {
        // Log error but don't throw - analysis was successful
        request.log.error(error, "Failed to send analysis complete email (non-critical)");
      });

      return reply.status(201).send({
        success: true,
        analysis: {
          id: newAnalysis.id,
          contractId: newAnalysis.contractId,
          aiModel: newAnalysis.aiModel,
          aiTokensUsed: newAnalysis.aiTokensUsed,
          createdAt: newAnalysis.createdAt.toISOString(),
        },
      });
    } catch (error) {
      request.log.error(error, "Error during analysis generation");

      // Update contract status to failed
      await db
        .update(contracts)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, policyId));

      if (error instanceof Error) {
        return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, `Analysis failed: ${error.message}`);
      }
      return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to generate analysis");
    }
  } catch (error) {
    request.log.error(error, "Error creating analysis");
    return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to create analysis");
  }
}

/**
 * GET /api/analyses
 * Get all analyses for the authenticated user
 */
async function getAnalyses(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Require authentication
    await requireAuth(request, reply);
    const user = request.user;
    if (!user) {
      request.log.warn("Authentication failed or user not found");
      return;
    }

    // Get analyses with contract information
    const analysesList = await db
      .select({
        id: analyses.id,
        contractId: analyses.contractId,
        aiModel: analyses.aiModel,
        aiTokensUsed: analyses.aiTokensUsed,
        analysisResult: analyses.analysisResult,
        createdAt: analyses.createdAt,
        updatedAt: analyses.updatedAt,
        contract: {
          id: contracts.id,
          originalFileName: contracts.originalFileName,
          coverageStart: contracts.coverageStart,
          coverageEnd: contracts.coverageEnd,
          status: contracts.status,
        },
      })
      .from(analyses)
      .innerJoin(contracts, eq(analyses.contractId, contracts.id))
      .where(and(eq(contracts.userId, user.id), eq(contracts.isDeleted, false)))
      .orderBy(desc(analyses.createdAt));

    // Format response
    const formattedAnalyses = analysesList.map((analysis) => ({
      id: analysis.id,
      contractId: analysis.contractId,
      aiModel: analysis.aiModel,
      aiTokensUsed: analysis.aiTokensUsed,
      analysisResult: analysis.analysisResult,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
      policy: {
        id: analysis.contract.id,
        originalFileName: analysis.contract.originalFileName,
        coverageStart: analysis.contract.coverageStart,
        coverageEnd: analysis.contract.coverageEnd || undefined,
        status: analysis.contract.status,
      },
    }));

    return reply.status(200).send({
      analyses: formattedAnalyses,
      total: formattedAnalyses.length,
    });
  } catch (error) {
    request.log.error(error, "Error fetching analyses");
    return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to fetch analyses");
  }
}

/**
 * GET /api/analyses/:id
 * Get a single analysis by ID
 */
async function getAnalysis(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Require authentication
    await requireAuth(request, reply);
    const user = request.user;
    if (!user) {
      request.log.warn("Authentication failed or user not found");
      return;
    }

    const { id } = request.params as { id: string };

    if (!id) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "Analysis ID is required");
    }

    // Get analysis with contract information
    const [analysisData] = await db
      .select({
        id: analyses.id,
        contractId: analyses.contractId,
        aiModel: analyses.aiModel,
        aiTokensUsed: analyses.aiTokensUsed,
        analysisResult: analyses.analysisResult,
        createdAt: analyses.createdAt,
        updatedAt: analyses.updatedAt,
        contract: {
          id: contracts.id,
          originalFileName: contracts.originalFileName,
          coverageStart: contracts.coverageStart,
          coverageEnd: contracts.coverageEnd,
          status: contracts.status,
        },
      })
      .from(analyses)
      .innerJoin(contracts, eq(analyses.contractId, contracts.id))
      .where(and(eq(analyses.id, id), eq(contracts.userId, user.id), eq(contracts.isDeleted, false)))
      .limit(1);

    if (!analysisData) {
      return sendErrorResponse(reply, 404, ErrorCode.NOT_FOUND, "Analysis not found");
    }

    // Format response
    return reply.status(200).send({
      id: analysisData.id,
      contractId: analysisData.contractId,
      aiModel: analysisData.aiModel,
      aiTokensUsed: analysisData.aiTokensUsed,
      analysisResult: analysisData.analysisResult,
      createdAt: analysisData.createdAt.toISOString(),
      updatedAt: analysisData.updatedAt.toISOString(),
      policy: {
        id: analysisData.contract.id,
        originalFileName: analysisData.contract.originalFileName,
        coverageStart: analysisData.contract.coverageStart,
        coverageEnd: analysisData.contract.coverageEnd || undefined,
        status: analysisData.contract.status,
      },
    });
  } catch (error) {
    request.log.error(error, "Error fetching analysis");
    return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to fetch analysis");
  }
}

/**
 * Register analysis routes
 */
export async function analysesRoutes(fastify: FastifyInstance) {
  fastify.post("/api/analyses", createAnalysis);
  fastify.get("/api/analyses", getAnalyses);
  fastify.get("/api/analyses/:id", getAnalysis);
}
