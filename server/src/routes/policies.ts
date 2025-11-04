import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq, and, sql, desc } from "drizzle-orm";
import { appConfig } from "../config/index.js";
import { db } from "../db/index.js";
import { contracts, type Contract } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { sendErrorResponse } from "../utils/errors.js";
import { ErrorCode } from "../types/index.js";
import { randomUUID } from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
  region: appConfig.aws.region,
  credentials: {
    accessKeyId: appConfig.aws.accessKeyId,
    secretAccessKey: appConfig.aws.secretAccessKey,
  },
});

/**
 * GET /api/policies
 * Get all policies for the authenticated user
 */
async function getPolicies(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Require authentication
    await requireAuth(request, reply);
    const user = request.user;
    if (!user) {
      request.log.warn("Authentication failed or user not found");
      return;
    }

    // Parse query parameters
    const query = request.query as {
      year?: string;
      status?: string;
      limit?: string;
      offset?: string;
    };

    const year = query.year ? parseInt(query.year, 10) : undefined;
    const status = query.status;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    // Validate limit and offset
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "limit must be between 1 and 100");
    }

    if (isNaN(offset) || offset < 0) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "offset must be >= 0");
    }

    if (year && (isNaN(year) || year < 1900 || year > 2100)) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "year must be a valid year");
    }

    // Build where conditions
    const conditions = [
      eq(contracts.userId, user.id),
      eq(contracts.isDeleted, false), // Filter out deleted policies
    ];

    if (status) {
      // Validate status - use type inferred from schema
      type ContractStatus = Contract["status"];
      const validStatuses: readonly ContractStatus[] = ["uploaded", "processing", "analyzed", "failed"];
      const isValidStatus = (s: string): s is ContractStatus => {
        return validStatuses.includes(s as ContractStatus);
      };
      if (!isValidStatus(status)) {
        return sendErrorResponse(
          reply,
          400,
          ErrorCode.VALIDATION_ERROR,
          `status must be one of: ${validStatuses.join(", ")}`
        );
      }
      conditions.push(eq(contracts.status, status));
    }

    if (year) {
      // Filter by year using coverageStart date
      // Extract year from coverageStart using SQL
      conditions.push(sql`EXTRACT(YEAR FROM ${contracts.coverageStart}) = ${year}`);
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contracts)
      .where(and(...conditions));

    const total = Number(count);

    // Get policies with pagination
    const policiesList = await db
      .select({
        id: contracts.id,
        fileName: contracts.fileName,
        originalFileName: contracts.originalFileName,
        coverageStart: contracts.coverageStart,
        coverageEnd: contracts.coverageEnd,
        description: contracts.description,
        status: contracts.status,
        fileSize: contracts.fileSize,
        uploadedAt: contracts.uploadedAt,
        processedAt: contracts.processedAt,
      })
      .from(contracts)
      .where(and(...conditions))
      .orderBy(desc(contracts.uploadedAt))
      .limit(limit)
      .offset(offset);

    // Format response
    const policies = policiesList.map((policy) => ({
      id: policy.id,
      fileName: policy.fileName,
      originalFileName: policy.originalFileName,
      coverageStart: policy.coverageStart,
      coverageEnd: policy.coverageEnd || undefined,
      description: policy.description || undefined,
      status: policy.status,
      fileSize: policy.fileSize,
      uploadedAt: policy.uploadedAt.toISOString(),
      processedAt: policy.processedAt?.toISOString() || undefined,
    }));

    return reply.status(200).send({
      policies,
      total,
      limit,
      offset,
    });
  } catch (error) {
    request.log.error(error, "Error fetching policies");
    return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to fetch policies");
  }
}

/**
 * POST /api/policies/upload
 * Upload a PDF policy file
 */
async function uploadPolicy(request: FastifyRequest, reply: FastifyReply) {
  try {
    request.log.info("Starting policy upload");

    // Require authentication
    await requireAuth(request, reply);
    const user = request.user;
    if (!user) {
      request.log.warn("Authentication failed or user not found");
      return;
    }

    request.log.info("User authenticated, parsing multipart data");

    // Parse multipart form data
    // Fastify multipart: need to iterate through parts to get both file and fields
    let fileData: MultipartFile | null = null;
    let fileBuffer: Buffer | null = null;
    let coverageStart: string | undefined;
    let coverageEnd: string | undefined;
    let description: string | undefined;

    try {
      const parts = request.parts();
      request.log.debug("Starting to iterate parts");

      for await (const part of parts) {
        request.log.debug(`Processing part: type=${part.type}, fieldname=${part.fieldname}`);

        if (part.type === "file") {
          fileData = part;
          request.log.info(`File received: ${part.filename}, mimetype: ${part.mimetype}`);
          // IMPORTANT: Consume the file stream immediately to allow parser to continue
          // This prevents the multipart parser from hanging
          request.log.debug("Reading file buffer to consume stream");
          fileBuffer = await part.toBuffer();
          request.log.debug(`File buffer read: ${fileBuffer.length} bytes`);
        } else if (part.type === "field") {
          // Handle form fields
          if (part.fieldname === "coverageStart") {
            coverageStart = part.value as string;
            request.log.debug(`coverageStart: ${coverageStart}`);
          } else if (part.fieldname === "coverageEnd") {
            coverageEnd = part.value as string;
            request.log.debug(`coverageEnd: ${coverageEnd}`);
          } else if (part.fieldname === "description") {
            description = part.value as string;
            request.log.debug(`description: ${description?.substring(0, 50)}...`);
          }
        }
      }

      request.log.info("Finished parsing multipart data");
    } catch (multipartError) {
      request.log.error(multipartError, "Error parsing multipart data");
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "Failed to parse form data");
    }

    if (!fileData || !fileBuffer) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "No file provided");
    }

    // Validate file type
    if (fileData.mimetype !== "application/pdf") {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "File must be a PDF");
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileBuffer.length > maxSize) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "File size must be less than 10MB");
    }

    // Validate required fields
    if (!coverageStart) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "coverageStart is required");
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(coverageStart)) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "coverageStart must be in YYYY-MM-DD format");
    }

    if (coverageEnd && !dateRegex.test(coverageEnd)) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "coverageEnd must be in YYYY-MM-DD format");
    }

    // Validate date logic
    const startDate = new Date(coverageStart);
    const endDate = coverageEnd ? new Date(coverageEnd) : null;

    if (isNaN(startDate.getTime())) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "Invalid coverageStart date");
    }

    if (endDate && isNaN(endDate.getTime())) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "Invalid coverageEnd date");
    }

    if (endDate && endDate <= startDate) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "coverageEnd must be after coverageStart");
    }

    // Generate S3 key (path in bucket)
    const fileId = randomUUID();
    const originalFileName = fileData.filename || "policy.pdf";
    const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const s3Key = `policies/${user.id}/${fileId}/${sanitizedFileName}`;

    // Upload to S3
    request.log.info(`Uploading to S3: bucket=${appConfig.aws.bucketName}, key=${s3Key}`);
    const uploadCommand = new PutObjectCommand({
      Bucket: appConfig.aws.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "application/pdf",
      Metadata: {
        userId: user.id,
        originalFileName: originalFileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      await s3Client.send(uploadCommand);
      request.log.info("Successfully uploaded to S3");
    } catch (s3Error) {
      request.log.error(s3Error, "S3 upload failed");
      return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to upload file to storage");
    }

    // Calculate default coverageEnd if not provided (1 year from start)
    const finalCoverageEnd =
      endDate ||
      (() => {
        const defaultEnd = new Date(startDate);
        defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
        return defaultEnd;
      })();

    // Save policy metadata to database
    request.log.info("Saving policy metadata to database");
    try {
      const [policy] = await db
        .insert(contracts)
        .values({
          userId: user.id,
          fileName: fileId, // Use UUID as internal filename
          originalFileName: originalFileName,
          s3Key: s3Key,
          s3Bucket: appConfig.aws.bucketName,
          fileSize: fileBuffer.length,
          mimeType: "application/pdf",
          coverageStart: coverageStart,
          coverageEnd: finalCoverageEnd.toISOString().split("T")[0],
          description: description || null,
          status: "uploaded",
        })
        .returning();

      request.log.info(`Policy saved with id: ${policy.id}`);

      return reply.status(201).send({
        success: true,
        policy: {
          id: policy.id,
          fileName: policy.originalFileName,
          coverageStart: policy.coverageStart,
          coverageEnd: policy.coverageEnd,
          description: policy.description,
          status: policy.status,
          uploadedAt: policy.uploadedAt,
        },
      });
    } catch (dbError) {
      request.log.error(dbError, "Database insert failed");
      return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to save policy metadata");
    }
  } catch (error) {
    request.log.error(error, "Error uploading policy");

    // Handle S3 errors
    if (error instanceof Error && error.name === "S3ServiceException") {
      return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to upload file to storage");
    }

    return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to upload policy");
  }
}

/**
 * DELETE /api/policies/:id
 * Soft delete a policy (sets isDeleted flag to true)
 */
async function deletePolicy(request: FastifyRequest, reply: FastifyReply) {
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
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "Policy ID is required");
    }

    // Verify the policy belongs to the user
    const [policy] = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, id), eq(contracts.userId, user.id)))
      .limit(1);

    if (!policy) {
      return sendErrorResponse(reply, 404, ErrorCode.NOT_FOUND, "Policy not found");
    }

    // Check if already deleted
    if (policy.isDeleted) {
      return sendErrorResponse(reply, 400, ErrorCode.VALIDATION_ERROR, "Policy already deleted");
    }

    // Soft delete: set isDeleted flag to true
    await db.update(contracts).set({ isDeleted: true, updatedAt: new Date() }).where(eq(contracts.id, id));

    request.log.info(`Policy ${id} soft deleted by user ${user.id}`);

    return reply.status(200).send({
      success: true,
      message: "Policy deleted successfully",
    });
  } catch (error) {
    request.log.error(error, "Error deleting policy");
    return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to delete policy");
  }
}

/**
 * Register policy routes
 */
export async function policiesRoutes(fastify: FastifyInstance) {
  fastify.get("/api/policies", getPolicies);
  fastify.post("/api/policies/upload", uploadPolicy);
  fastify.delete("/api/policies/:id", deletePolicy);
}
