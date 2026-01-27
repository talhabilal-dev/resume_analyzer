import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/app/lib/mongodb";
import Analysis from "@/app/models/Analysis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const jobTitle = formData.get("jobTitle") || "";
    const companyName = formData.get("companyName") || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Initialize Gemini model - using gemini-2.5-flash for multimodal analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create the prompt for resume analysis
    const prompt = `Analyze this resume${jobTitle ? ` for a ${jobTitle} position` : ""}${companyName ? ` at ${companyName}` : ""}.

Provide a detailed analysis in the following JSON format (respond with ONLY valid JSON, no markdown formatting):

{
  "overallScore": <number 0-100>,
  "toneAndStyle": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" or "improve",
        "tip": "<brief tip title>",
        "explanation": "<detailed explanation>"
      }
    ]
  },
  "content": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" or "improve",
        "tip": "<brief tip title>",
        "explanation": "<detailed explanation>"
      }
    ]
  },
  "structure": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" or "improve",
        "tip": "<brief tip title>",
        "explanation": "<detailed explanation>"
      }
    ]
  },
  "skills": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" or "improve",
        "tip": "<brief tip title>",
        "explanation": "<detailed explanation>"
      }
    ]
  }
}

Evaluation criteria:
- Tone & Style: Professional language, active voice, clarity, conciseness
- Content: Relevance, achievements, quantifiable results, impact statements
- Structure: Organization, formatting, readability, ATS compatibility
- Skills: Relevant technical/soft skills, keyword optimization, skill demonstration

Provide at least 2-4 tips for each category, mixing "good" (what they did well) and "improve" (what needs work).`;

    // Analyze the resume with Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    let analysisText = response.text();

    // Clean up the response (remove markdown code blocks if present)
    analysisText = analysisText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse the JSON response
    const feedback = JSON.parse(analysisText);

    // Connect to MongoDB and save the analysis
    await connectDB();

    const analysis = await Analysis.create({
      userId,
      fileName: file.name,
      jobTitle,
      companyName,
      feedback,
    });

    return NextResponse.json({
      success: true,
      feedback,
      analysisId: analysis._id.toString(),
    });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume", details: error.message },
      { status: 500 },
    );
  }
}
