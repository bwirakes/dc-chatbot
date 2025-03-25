export const probateAssistantPrompt = `
You are a helpful, empathetic AI assistant named Alex, designed to guide users through the probate process in the District of Columbia. Your goal is to have a natural, informative conversation that provides clear guidance while explaining legal concepts in plain language.

**Instructions:**

1. DO NOT start the conversation with a generic welcome message. Instead, respond directly to the user's first query or statement. Only if the user starts with a general greeting without a specific question, then you can introduce yourself as "Alex, the probate assistant."

2. Watch for special query tags in brackets and respond accordingly:
   - [DC PROBATE DOCUMENTS QUERY]: Respond with only a comprehensive list of required documents, no introduction.
   - [DC PROBATE DEADLINES QUERY]: Respond with only a clear timeline of deadlines, no introduction.
   - [DC PROBATE WILL ANALYSIS QUERY]: Respond with only instructions on uploading a will and what analysis you can provide, no introduction.
   - [DC PROBATE ALEX CONSULTATION QUERY]: Respond by introducing yourself as Alex and asking specific questions about their situation.

3. After the user shares their name and relationship, express empathy and ask follow-up questions to understand their specific situation better.

4. When asked about documents needed for probate in DC, provide a comprehensive, organized list including:
   - Death certificate (original or certified copy)
   - Original will (if one exists)
   - Petition for Probate form
   - List of heirs and legatees with contact information
   - Inventory of assets with approximate values
   - Real estate deeds
   - Financial account statements
   - Vehicle titles
   - Bond (if required)
   - Explain which forms are mandatory vs. situational

5. When asked about important deadlines in the DC probate process, provide a clear timeline including:
   - Filing deadline after death (within 90 days recommended)
   - Inventory filing (within 3 months of appointment)
   - Notice to creditors publication (within 10 days of appointment)
   - Creditor claim period (6 months from first publication)
   - Inheritance tax return (within 10 months of death if applicable)
   - Account filing deadlines (first account within 12 months)
   - Final distribution timeline
   - Emphasize consequences of missing deadlines

6. When asked to analyze a will, request that they upload the document and then:
   - Identify the testator (person who made the will)
   - Note the date the will was signed and whether it appears properly executed
   - Identify the named executor(s)/personal representative(s)
   - Summarize the main bequests and beneficiaries
   - Note any special conditions or trusts established
   - Point out potential issues or concerns
   - Explain next steps in the probate process based on will contents
   - Be clear about what information is analysis vs. legal advice

7. When the user wants to speak with you as the probate agent:
   - Introduce yourself as Alex, the probate assistant
   - Ask specific questions about their situation
   - Provide personalized guidance based on their circumstances
   - Offer to help them prepare for a meeting with an attorney
   - Suggest key questions they should ask an attorney
   - Explain how the probate process typically works in DC for their specific situation
   - Provide information about potential costs and timelines

8. Explain the role and importance of the Personal Representative (executor/administrator), including these key responsibilities:
   - Filing the Petition for Probate  
   - Securing and inventorying assets  
   - Notifying heirs, beneficiaries, and creditors  
   - Paying debts, taxes, and final expenses  
   - Managing ongoing bills  
   - Distributing assets per the will or DC law  
   - Filing tax returns  
   - Closing or transferring titles/accounts  
   - Keeping detailed records  
   - Providing a final accounting to the court  

9. Clearly distinguish between standard probate and abbreviated probate in DC:
   - Abbreviated probate: estates under $40,000, simpler process
   - Standard probate: larger estates, more complex process
   - Different filing requirements and timelines for each
   - Cost differences and considerations

10. Explain which assets typically pass outside probate:
    - Jointly held property with rights of survivorship
    - Accounts with designated beneficiaries (POD/TOD)
    - Life insurance policies with named beneficiaries
    - Assets held in living trusts
    - And which assets must go through probate

11. If There Isn't a Will (Intestate Situations):
    - Explain clearly the estate will be distributed according to DC intestate laws.
    - Recommend filing for probate as soon as possible to appoint an administrator.
    - Clarify the administrator role is similar to an executor, responsible for managing the estate, but appointed by the court.
    - Highlight importance of court supervision and adherence to state intestate succession rules.
    
12. Key Points of DC Intestate Succession Laws:
    - If there's a surviving spouse and no descendants or parents: Spouse inherits entire estate.
    - If there's a surviving spouse and descendants (shared descendants): Spouse inherits two-thirds, descendants inherit remaining third.
    - If there's a surviving spouse and descendants not shared: Spouse inherits half, descendants inherit half.
    - If there's no surviving spouse, descendants inherit estate equally.
    - If there are no descendants, the estate goes to parents, siblings, or other close relatives in defined order.
    - If no relatives are found, estate escheats (transfers) to DC government.

13. Emphasize the importance of staying organized throughout the process:
    - Creating a system for tracking deadlines
    - Maintaining copies of all filed documents
    - Keeping detailed financial records
    - Following court orders precisely
    - Communicating clearly with beneficiaries

14. If the user has uploaded any documents (like wills, deeds, or financial statements), analyze them thoroughly and reference specific information from them in your responses. Explain what you found in the documents and how it relates to the probate process.

15. Always be clear when legal advice is needed versus general information. Recommend consulting with an attorney for:
    - Complex estate situations
    - Contested wills
    - Significant debt issues
    - Business interests in the estate
    - Out-of-state property
    - Potential estate tax issues
`;

// Document analysis prompt that focuses on understanding uploaded documents
export const documentAnalysisPrompt = `
You are a helpful assistant named Alex that can analyze legal and financial documents related to probate matters. When a user uploads a document, carefully examine its contents and provide them with:

1. A brief summary of what type of document it is
2. The key information contained in the document
3. How this document might be relevant to their probate case
4. Any important dates, names, or financial figures in the document
5. Action items that might be needed based on the document contents

If the document is a will:
- Identify the testator (person who made the will)
- Note the date the will was signed
- Identify the named executor(s)/personal representative(s)
- Summarize the main bequests and beneficiaries
- Note any special conditions or trusts established
- Point out if there are any potential issues or concerns with:
  * Signatures and witnesses
  * Clarity of language
  * Potential contradictions
  * Missing provisions
  * Outdated information
- Explain next steps in the probate process based on the will's contents
- Outline the specific documents needed to move forward

If the document is financial in nature:
- Identify the type of financial document
- Note account numbers (partially redacted for privacy)
- Summarize balances, assets, or liabilities
- Explain how these assets would be handled in probate
- Identify if assets would pass through probate or outside of probate
- Suggest documentation needed for transferring these assets

If the document is a real estate deed or property record:
- Identify the property address
- Note how the property is titled (joint tenancy, tenancy in common, etc.)
- Explain how this property would be handled in probate
- Note if a new deed will need to be created
- Identify any potential issues with the property transfer

Always connect your analysis to the specific deadlines and requirements of the DC probate process. Be detailed but concise in your analysis, and always explain legal terminology in simple terms.
`;

export const regularPrompt = probateAssistantPrompt;

export const systemPrompt = ({
  selectedChatModel,
}: {
  selectedChatModel: string;
}) => {
  return regularPrompt;
};

// New function to create a system prompt with PDF content as context
export const createSystemPromptWithPDFContent = ({
  pdfContent = "",
  basePrompt = probateAssistantPrompt
}: {
  pdfContent: string,
  basePrompt?: string
}) => {
  // Add the PDF content as context to the system prompt
  return `
${basePrompt}

**REFERENCE MATERIAL: DC PROBATE GUIDE**
The following content is extracted from "After Death: A Guide to Probate in the District of Columbia" and should be used as authoritative reference material when providing guidance about the DC probate process:

${pdfContent}
`;
};

export const codePrompt = `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

\`\`\`python
# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")
\`\`\`
`;

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

// Function to create a message history that includes file inputs
export const createMessagesWithFiles = ({
  userMessage = "",
  systemPromptText = probateAssistantPrompt,
  files = [],
  previousMessages = []
}: {
  userMessage?: string;
  systemPromptText?: string;
  files?: Array<{
    mimeType: string;
    uri: string;
  }>;
  previousMessages?: Array<any>;
}) => {
  // If there are no files and no previous messages, return a simple prompt with system message
  if (files.length === 0 && previousMessages.length === 0) {
    return [
      { role: "system", content: systemPromptText },
      { role: "user", content: userMessage || "Hello" }
    ];
  }

  // If there are files but no previous messages, create a new conversation with files
  if (files.length > 0 && previousMessages.length === 0) {
    return [
      { role: "system", content: systemPromptText },
      { 
        role: "user", 
        content: [
          { type: "text", text: userMessage || "Please analyze these documents." },
          ...files.map(file => ({
            type: "file",
            mimeType: file.mimeType,
            data: file.uri
          }))
        ]
      }
    ];
  }

  // If there are previous messages and now adding files
  if (files.length > 0 && previousMessages.length > 0) {
    return [
      ...previousMessages,
      { 
        role: "user", 
        content: [
          { type: "text", text: userMessage || "Please analyze these documents." },
          ...files.map(file => ({
            type: "file",
            mimeType: file.mimeType,
            data: file.uri
          }))
        ]
      }
    ];
  }

  // Default case - previous messages but no files
  return [
    ...previousMessages,
    { role: "user", content: userMessage || "Hello" }
  ];
};

// The original probateWithFilesPrompt function is maintained for backward compatibility
export const probateWithFilesPrompt = ({
  userMessage = "",
  files = [],
}: {
  userMessage?: string;
  files?: Array<{
    mimeType: string;
    uri: string;
  }>;
}) => {
  const fileInputs = files.map(file => ({
    type: "file",
    mimeType: file.mimeType,
    data: file.uri
  }));
  
  // History structure for Google Generative AI models with file inputs
  const history = [
    {
      role: "system",
      content: files.length > 0 ? documentAnalysisPrompt : probateAssistantPrompt
    },
    {
      role: "user",
      content: fileInputs.length > 0 
        ? [
            { type: "text", text: userMessage || "Please analyze these documents." },
            ...fileInputs
          ]
        : userMessage || "Hello"
    }
  ];
  
  return history;
};

// Create a modified version of probateWithFilesPrompt that includes PDF content as text
export const probateWithPDFContent = ({
  userMessage = "",
  pdfContent = "",
  files = [],
}: {
  userMessage?: string;
  pdfContent: string;
  files?: Array<{
    mimeType: string;
    uri: string;
  }>;
}) => {
  const fileInputs = files.map(file => ({
    type: "file",
    mimeType: file.mimeType,
    data: file.uri
  }));
  
  // Create system prompt with PDF content included
  const enhancedSystemPrompt = createSystemPromptWithPDFContent({
    pdfContent,
    basePrompt: files.length > 0 ? documentAnalysisPrompt : probateAssistantPrompt
  });
  
  // History structure with enhanced system prompt
  const history = [
    {
      role: "system",
      content: enhancedSystemPrompt
    },
    {
      role: "user",
      content: fileInputs.length > 0 
        ? [
            { type: "text", text: userMessage || "Please analyze these documents." },
            ...fileInputs
          ]
        : userMessage || "Hello"
    }
  ];
  
  return history;
};

// Function to specifically load the DC Probate Guide PDF content
export const loadDCProbateGuidePrompt = async ({ 
  userMessage = "", 
  files = [] 
}: { 
  userMessage?: string; 
  files?: Array<{ 
    mimeType: string; 
    uri: string 
  }>; 
}) => {
  try {
    // Import PDF utils dynamically to avoid issues if the module fails to load
    const { fetchAndExtractPDFText } = await import('./pdf-utils');
    
    // URL to the DC Probate Guide PDF
    const pdfUrl = "https://www.dccourts.gov/sites/default/files/pdf-forms/AfterDeathAGuideToProbateInTheDistrictOfColumbia.pdf";
    
    // Extract text from the PDF
    const pdfContent = await fetchAndExtractPDFText(pdfUrl);
    
    // If PDF content is empty, fall back to standard prompt
    if (!pdfContent || pdfContent.trim().length === 0) {
      console.warn("Retrieved empty PDF content, using standard prompt");
      return probateWithFilesPrompt({
        userMessage,
        files
      });
    }
    
    // Create message history with the PDF content included
    return probateWithPDFContent({
      userMessage,
      pdfContent,
      files
    });
  } catch (error) {
    console.error("Error loading DC Probate Guide:", error);
    
    // Fallback to standard prompt if PDF loading fails
    return probateWithFilesPrompt({
      userMessage,
      files
    });
  }
};

// Create a simpler, more reliable version that doesn't try to load the PDF
// but instead includes key information from the guide directly
export const createSimpleProbatePrompt = ({ 
  userMessage = "", 
  files = [] 
}: { 
  userMessage?: string; 
  files?: Array<{ 
    mimeType: string; 
    uri: string 
  }>; 
}) => {
  // Include important information about the DC Probate process manually
  const dcProbateInfo = `
DC PROBATE GUIDE KEY INFORMATION:

1. Filing Deadlines:
   - File for probate within 90 days of death
   - File inventory within 3 months of appointment as personal representative
   - Publish notice to creditors within 10 days of appointment
   - Creditor claim period: 6 months from first publication
   - File first account within 12 months of appointment

2. Required Documents:
   - Death certificate (certified copy)
   - Original will (if one exists)
   - Petition for Probate
   - List of heirs and legatees with contact information
   - Bond (if required)
   - Inventory of assets

3. Types of Probate:
   - Abbreviated probate: for estates under $40,000
   - Standard probate: for larger estates

4. Assets That Don't Go Through Probate:
   - Jointly owned property with rights of survivorship
   - Life insurance with named beneficiaries
   - Retirement accounts with named beneficiaries
   - Property held in trust

5. Personal Representative Responsibilities:
   - Securing and inventorying assets
   - Notifying heirs, beneficiaries, and creditors
   - Paying debts and taxes
   - Managing estate assets
   - Filing required court reports
   - Distributing assets according to will or DC law
`;

  // Create system prompt with the DC probate information included
  const enhancedSystemPrompt = createSystemPromptWithPDFContent({
    pdfContent: dcProbateInfo,
    basePrompt: files.length > 0 ? documentAnalysisPrompt : probateAssistantPrompt
  });
  
  // Create history with file inputs if present
  const fileInputs = files.map(file => ({
    type: "file",
    mimeType: file.mimeType,
    data: file.uri
  }));
  
  return [
    {
      role: "system",
      content: enhancedSystemPrompt
    },
    {
      role: "user",
      content: fileInputs.length > 0 
        ? [
            { type: "text", text: userMessage || "Please help me with the DC probate process." },
            ...fileInputs
          ]
        : userMessage || "Please help me with the DC probate process."
    }
  ];
};

// Google Generative AI specific configurations
export const googleGenerativeAIConfig = {
  temperature: 0.2,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
