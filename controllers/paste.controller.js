import config from "../config/index.js";
import { Paste } from "../models/paste.model.js";
import { generatePasteId, isValidContent, isValidMaxViews, isValidTTL,sanitizeContent} from "../utils/helpers.js";


const createPaste = async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!isValidContent(content)) {
      return res.status(400).json({
        status: "failure",
        message: "content is required and must be a non-empty string",
      });
    }


    if (!isValidTTL(ttl_seconds)) {
      return res.status(400).json({
        status: "failure",
        message: "ttl_seconds must be an integer >= 1",
      });
    }

    if (!isValidMaxViews(max_views)) {
      return res.status(400).json({
        status: "failure",
        message: "max_views must be an integer >= 1",
      });
    }


    let pasteId;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      pasteId = generatePasteId();
      const existing = await Paste.findOne({ id: pasteId });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({
        status: "failure",
        message: "Failed to generate unique paste ID",
      });
    }

  
    let expiresAt = null;
    if (ttl_seconds) {
      const now = new Date();
      expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
    }


    const paste = await Paste.create({
      id: pasteId,
      content: content,
      ttl_seconds: ttl_seconds || null,
      max_views: max_views || null,
      expires_at: expiresAt,
    });

    const frontendUrl = config.FRONTEND_URL || "http://localhost:3000";
    const shareUrl = `${frontendUrl}/p/${pasteId}`;

    return res.status(201).json({
      status: "success",
      message: "Paste Created Successfully",
      data: {
        id: pasteId,
        url: shareUrl,
      },
    });
  } catch (error) {
    console.error("Error creating paste:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error creating paste",
    });
  }
};


const getPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const testNowMs = req.testNowMs;

    const paste = await Paste.findOne({ id });

    if (!paste) {
      return res.status(404).json({
        status: "failure",
        message: "Paste not found",
      });
    }

    if (!paste.isAvailable(testNowMs)) {
      return res.status(404).json({
        status: "failure",
        message: "Paste not found or has expired",
      });
    }


    await paste.incrementViews();

    const expiresAt = paste.expires_at
      ? paste.expires_at.toISOString()
      : null;
    const remainingViews = paste.getRemainingViews();

    return res.status(200).json({
      status: "success",
      message: "Paste Retrieved Successfully",
      data: {
        content: paste.content,
        remaining_views: remainingViews,
        expires_at: expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching paste:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error fetching paste",
    });
  }
};


const getPasteHTML = async (req, res) => {
  try {
    const { id } = req.params;
    const testNowMs = req.testNowMs;

    // Find paste
    const paste = await Paste.findOne({ id });

    if (!paste) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Paste Not Found</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              .error { color: #d32f2f; }
            </style>
          </head>
          <body>
            <h1 class="error">Paste Not Found</h1>
            <p>The paste you're looking for doesn't exist or has expired.</p>
          </body>
        </html>
      `);
    }

    // Check if paste is available
    if (!paste.isAvailable(testNowMs)) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Paste Not Found</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              .error { color: #d32f2f; }
            </style>
          </head>
          <body>
            <h1 class="error">Paste Not Found</h1>
            <p>The paste you're looking for doesn't exist or has expired.</p>
          </body>
        </html>
      `);
    }

    // Increment view count
    await paste.incrementViews();

    // Prepare metadata
    const remainingViews = paste.getRemainingViews();
    const expiresAt = paste.expires_at
      ? paste.expires_at.toISOString()
      : null;

    // Return HTML with sanitized content
    const sanitizedContent = sanitizeContent(paste.content);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pastebin Paste</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              overflow: hidden;
            }
            .header {
              background: #f5f5f5;
              padding: 20px;
              border-bottom: 1px solid #e0e0e0;
            }
            .header h1 {
              color: #333;
              margin-bottom: 10px;
            }
            .meta {
              font-size: 14px;
              color: #666;
              display: flex;
              gap: 20px;
            }
            .meta-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .content-wrapper {
              padding: 20px;
            }
            pre {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
              overflow-x: auto;
              font-family: 'Courier New', monospace;
              font-size: 14px;
              line-height: 1.5;
              color: #333;
              white-space: pre-wrap;
              word-break: break-word;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin-top: 15px;
              border-radius: 4px;
              font-size: 14px;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pastebin Paste</h1>
              <div class="meta">
                <div class="meta-item">
                  <span>📋 ID:</span>
                  <strong>${id}</strong>
                </div>
                ${remainingViews !== null ? `<div class="meta-item"><span>👁️ Views:</span><strong>${remainingViews} remaining</strong></div>` : ""}
                ${expiresAt ? `<div class="meta-item"><span>⏰ Expires:</span><strong>${expiresAt}</strong></div>` : ""}
              </div>
            </div>
            <div class="content-wrapper">
              <pre>${sanitizedContent}</pre>
              ${remainingViews !== null ? `<div class="warning">⚠️ This paste will expire after ${remainingViews} more ${remainingViews === 1 ? "view" : "views"}</div>` : ""}
            </div>
          </div>
        </body>
      </html>
    `;

    return res.status(200).send(html);
  } catch (error) {
    console.error("Error fetching paste HTML:", error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">Server Error</h1>
          <p>An error occurred while fetching the paste.</p>
        </body>
      </html>
    `);
  }
};

const healthCheck = async (req, res) => {
  try {
 
    await Paste.collection.stats();
    return res.status(200).json({
      status: "success",
      ok: true,
    });
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(503).json({
      status: "failure",
      ok: false,
    });
  }
};

// Get all pastes (admin only - for testing)
const getAllPastes = async (req, res) => {
  try {
    const pastes = await Paste.find();

    return res.status(200).json({
      status: "success",
      message: "All Pastes Retrieved Successfully",
      data: pastes,
    });
  } catch (error) {
    console.error("Error fetching all pastes:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error fetching pastes",
    });
  }
};

// Delete paste (admin only)
const deletePaste = async (req, res) => {
  try {
    const { id } = req.params;

    const paste = await Paste.findOneAndDelete({ id });

    if (!paste) {
      return res.status(404).json({
        status: "failure",
        message: "Paste not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Paste Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting paste:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error deleting paste",
    });
  }
};

export {
  createPaste,
  getPaste,
  getPasteHTML,
  healthCheck,
  getAllPastes,
  deletePaste,
};