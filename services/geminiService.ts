import { GoogleGenAI, Modality } from '@google/genai';

export async function generatePhotoBookPage(
  base64Image: string,
  mimeType: string,
  userPrompt: string,
  dateContext: string,
  photoDate: string, // Expects formatted date e.g., "Aug 30, 2025"
  customHeading?: string
): Promise<{ imageUrl: string; caption: string; }[]> {

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Step 1: Generate a context-aware design theme based on the user's input and photo.
  const themeGenerationPrompt = `
Analyze the provided user photo, date context, user's heading, and user's notes to generate a concise, creative, and unique design theme for a 'Mummy Journey Storybook' page.

**Context to Analyze:**
- **Photo Content:** The mood, subjects, colors, and overall feeling of the image.
- **Date Context:** ${dateContext}
- **User's Heading:** ${customHeading || "No heading provided. Infer a theme from the other contexts."}
- **User's Note:** ${userPrompt || "No note provided. Analyze the photo's mood and subjects."}

**Task:**
Based on your analysis of ALL the context provided, invent a single, descriptive theme string. The theme should be highly specific and relevant to the memory captured in the photo. It should describe the visual style, mood, and potential graphic elements.

**Example of a good, specific theme:** "A playful and sweet 'first ice cream' theme with pastel colors, dripping cone graphics, and cheerful hand-drawn sprinkles."
**Another example:** "A serene and magical 'night-time lullaby' theme with deep blues, soft glowing stars, and gentle crescent moon motifs."
**Do not use generic themes.** The theme must be directly inspired by the inputs.

**Your Output (Theme Description Only):**`;

  const themeResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        { text: themeGenerationPrompt },
      ],
    },
  });
  
  const generatedTheme = themeResponse.text.trim();

  // Step 2: Define style variations to generate multiple options.
  const styleVariations = [
    'with a vibrant, playful, and cheerful scrapbook feel using digital art stickers and bold, fun fonts',
    'with a clean, modern, and elegant aesthetic, using geometric shapes, clean lines, and minimalist typography',
    'with a dreamy, artistic, and soft atmosphere, incorporating gentle gradients, artistic brushes, and flowing script fonts',
    'with a warm, nostalgic, vintage scrapbook look, using sepia tones, film grain, and classic, serif typography',
    'with a minimalist, hand-drawn, and whimsical charm, featuring simple line art, subtle textures, and a delicate, handwritten-style font'
  ];

  const headingInstruction = (customHeading && customHeading.trim() !== '')
    ? `You MUST use the following heading provided by the user: "${customHeading}".`
    : `Generate a short, lovely, and unique heading that is directly inspired by the theme of the caption you are generating. For example, if the caption is about a quiet moment, the heading could be "Our Gentle Hush" or "A Quiet Corner." The heading must feel random and not be a generic phrase.`;

  // Step 3: Generate three page variations in parallel.
  const pageGenerationPromises = styleVariations.map(style => {
    const fullPrompt = `
You are a creative and skilled 'Photo Book Maker' and 'photo-album designer', specializing in crafting personalized, emotionally resonant photo book pages. Your specific project is a 'Mummy Journey Storybook' gifted from a husband to his wife.

**Overall Tone**: Creative, emotional, thoughtful, and professional. Maintain a tone appropriate for a personalized, heartfelt gift. Avoid repetitive phrases and ensure each caption feels fresh and unique.

**CRITICAL INSTRUCTIONS**: Your final output must have TWO separate parts:
1.  **A single A4 portrait IMAGE**: This image will be printed directly by the user.
2.  **A plain TEXT block**: This text block must contain ONLY the heartfelt caption you generated.

---

**IMAGE GENERATION RULES (Part 1):**

-   **Page Design & Style**:
    -   Create a unique, A4 portrait page design.
    -   **Style Inspiration for THIS Generation**: You MUST design the page based on the theme: **"${generatedTheme}"**.
    -   **Specific Artistic Direction**: Additionally, you MUST adhere to this specific artistic direction: **"${style}"**.
    -   The overall visual style MUST be **VIBRANT**, clean, and have a cheerful, animated, or digital art feel.
    -   **AVOID**: Pastel colors, watercolor styles, oil painting effects, or grungy textures.

-   **Photo Integration & Editing**:
    -   **Dominant Placement**: The user's photo is the centerpiece. Transform, resize, and position it to fill the majority of the page.
    -   **Professional Edits**: Professionally edit the user's photo. Adjust color and lighting to make it pop and match the vibrant page aesthetic.
    -   **Subject Focus & Cleanup**: If necessary, digitally remove distracting background objects or people to focus the composition on the main subjects (e.g., the mother, father, baby). The goal is to create a clean, focused portrait.
    -   **Seamless Inpainting**: Heavily enhance the photo with detailed, creative inpainting, an abundance of graphics, and artistic stickers that seamlessly blend with the photo and background to create a rich, scrapbook-like feel, all while adhering to the chosen style inspiration.

-   **On-Page Text Elements**:
    -   **Heading**: ${headingInstruction} Place this heading prominently at the top of the page in a beautiful, artistic font that matches the style direction.
    -   **Date**: Render the provided photo date ("${photoDate}") prominently and artistically onto the A4 page image.
        -   **Placement**: It MUST be a major design element placed clearly and beautifully BELOW the heading.
        -   **Font & Size**: Use a different, complementary font to the heading, but slightly smaller.
---

**CAPTION GENERATION RULES (Part 2):**

-   **Perspective**: Write the caption from the perspective of a husband speaking to his wife. Use "you," "we," and "our" to create a personal connection.
-   **Content**: The caption must be a heartfelt, emotional message related to the photo, the provided date context ("${dateContext}"), and the user's personal note ("${userPrompt}").
-   **Tone**: Loving, sweet, and deeply personal.
-   **CRITICAL LENGTH**: The caption MUST be concise and **no more than 240 characters long**. Aim for 2-3 short, impactful sentences.
-   **Placement**: This caption is **NOT** to be rendered on the A4 page image. It is for the separate text block output.

---

**OUTPUT FORMAT (Reminder):**
-   **Part 1**: The A4 image you designed, including the user's photo, heading, date, and graphical elements.
-   **Part 2**: A plain text block containing ONLY the caption.
`;
    
    return ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            { text: fullPrompt },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    }).then(pageResponse => {
        let imageUrl: string | null = null;
        let caption: string | null = null;

        for (const part of pageResponse.candidates[0].content.parts) {
            if (part.text) {
              caption = part.text.trim();
            } else if (part.inlineData) {
              const base64ImageBytes = part.inlineData.data;
              imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        if (!imageUrl || !caption) {
            throw new Error("Failed to generate both an image and a caption.");
        }
        
        return { imageUrl, caption };
    }).catch(error => {
        console.error(`Failed to generate page for style "${style}":`, error);
        // Return a null or specific error object to be filtered out later
        return null;
    });
  });

  const results = await Promise.all(pageGenerationPromises);
  const successfulResults = results.filter(r => r !== null) as {imageUrl: string, caption: string}[];

  if (successfulResults.length === 0) {
    throw new Error("All page generation attempts failed. Please try again.");
  }

  return successfulResults;
}

export async function generateCaptionOnly(
  base64Image: string,
  mimeType: string,
  userPrompt: string,
  dateContext: string,
): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
You are writing a caption for a 'Mummy Journey Storybook' from a husband to his wife.
Your task is to generate ONLY a heartfelt caption based on the provided photo and context.

**Context:**
- **Date Context:** ${dateContext}
- **User's Note:** ${userPrompt || "No note provided. Focus on the mood of the photo."}

**Caption Rules:**
- **Perspective**: From a husband to his wife. Use personal pronouns like "you," "we," and "our."
- **Tone**: Loving, sweet, and emotional.
- **CRITICAL LENGTH**: The caption MUST be concise and **no more than 240 characters long**. Aim for 2-3 short, impactful sentences.
- **Output**: Return ONLY the caption text. Do not add any other text, labels, or formatting.

**Analyze the photo and write the caption now.**`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
                { text: prompt },
            ],
        },
    });

    return response.text.trim();
}