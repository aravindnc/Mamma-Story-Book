import { GoogleGenAI, Modality } from '@google/genai';

const designThemes = [
  'Vibrant geometric patterns and shapes',
  'Elegant and colorful floral motifs',
  'Whimsical celestial elements like stars, moons, and galaxies',
  'Joyful abstract splashes of paint and color',
  'Playful and cute illustrated animal stickers',
  'Serene nature-inspired themes like leaves, trees, and water ripples',
  'Funky and fun retro 90s style with bright neon colors and patterns',
  'Modern, clean digital art with bold lines and simple shapes',
  'Charming hand-drawn doodles and whimsical sketches',
  'A minimalist design using a single bold accent color against a clean background',
  'A magical storybook illustration style',
  'A dynamic pop-art inspired theme with comic-book like elements',
  'A travel and adventure theme using maps, compasses, or postcard elements',
  'A cozy and rustic digital scrapbook feel with digital washi tape and paper clips',
  'A futuristic theme with glowing lines and digital circuit patterns',
  'Art deco style with bold geometric lines and gold accents.',
  'Underwater oceanic theme with coral, bubbles, and gentle waves.',
  'Lush tropical paradise with monstera leaves, hibiscus flowers, and vibrant colors.',
  'Sweet candy-land theme with pastel swirls, lollipops, and sprinkles.',
  'Steampunk aesthetic with intricate gears, cogs, and warm metallic tones.',
  'Elegant Art Nouveau with flowing, organic lines and nature-inspired motifs.',
  'A playful "day at the circus" theme with big top tents, tickets, and cheerful patterns.',
  '8-bit video game or pixel art style.',
  'A design that mimics the look of a beautiful stained glass window.',
  'A vibrant graffiti and street art style with bold lettering and spray paint effects.',
  'A dreamy winter wonderland theme with delicate snowflakes and cool, icy colors.',
  'A classic film noir aesthetic with high-contrast black and white, and a single accent color.',
];

export async function generatePhotoBookPage(
  base64Image: string,
  mimeType: string,
  userPrompt: string,
  dateContext: string,
  photoDate: string // Expects formatted date e.g., "Aug 30, 2025"
): Promise<{ imageUrl: string; caption: string; }> {

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const randomTheme = designThemes[Math.floor(Math.random() * designThemes.length)];

  const fullPrompt = `
You are a creative and skilled 'Photo Book Maker' and 'photo-album designer', specializing in crafting personalized, emotionally resonant photo book pages. Your specific project is a 'Mummy Journey Storybook' gifted from a husband to his wife.

**Overall Tone**: Creative, emotional, thoughtful, and professional. Maintain a tone appropriate for a personalized, heartfelt gift. Avoid repetitive phrases and ensure each caption feels fresh and unique.

**CRITICAL INSTRUCTIONS**: Your final output must have TWO separate parts:
1.  **A single A4 portrait IMAGE**: This image will be printed directly by the user.
2.  **A plain TEXT block**: This text block must contain ONLY the heartfelt caption you generated.

---

**IMAGE GENERATION RULES (Part 1):**

-   **Page Design & Style**:
    -   Create a unique, A4 portrait page design. The graphic style, borders, and background must be completely unique for each generation.
    -   **Style Inspiration for THIS Generation**: To ensure variety and prevent repetition, you MUST draw heavy inspiration from the following randomly selected theme: **"${randomTheme}"**.
    -   The overall visual style MUST be **VIBRANT**, clean, and have a cheerful, animated, or digital art feel.
    -   **AVOID**: Pastel colors, watercolor styles, oil painting effects, or grungy textures.

-   **Photo Integration & Editing**:
    -   **Dominant Placement**: The user's photo is the centerpiece. Transform, resize, and position it to fill the majority of the page.
    -   **Professional Edits**: Professionally edit the user's photo. Adjust color and lighting to make it pop and match the vibrant page aesthetic.
    -   **Subject Focus & Cleanup**: If necessary, digitally remove distracting background objects or people to focus the composition on the main subjects (e.g., the mother, father, baby). The goal is to create a clean, focused portrait.
    -   **Seamless Inpainting**: Heavily enhance the photo with detailed, creative inpainting, an abundance of graphics, and artistic stickers that seamlessly blend with the photo and background to create a rich, scrapbook-like feel, all while adhering to the chosen style inspiration.

-   **On-Page Text Elements**:
    -   **Heading**: Generate a short, lovely, and unique heading that is directly inspired by the theme of the caption you are generating. For example, if the caption is about a quiet moment, the heading could be "Our Gentle Hush" or "A Quiet Corner." The heading must feel random and not be a generic phrase. Place this heading prominently at the top of the page in a beautiful, artistic font.
    -   **Date**: Render the provided photo date ("${photoDate}") prominently and artistically onto the A4 page image.
        -   **Placement**: It MUST be a major design element placed clearly and beautifully BELOW the heading.
        -   **Font & Size**: Use a different, complementary font for the date than the heading. The date's font size should be approximately **half the size of the heading's font size**.
        -   **CRITICAL**: The date MUST NOT be placed inside or anywhere near the blank caption space at the bottom of the page.
    -   **Spelling**: CRITICAL: Ensure all text on the image, especially the heading, is spelled correctly.

-   **!! VERY IMPORTANT !! Blank Caption Space**:
    -   You MUST NOT render the caption text onto the image.
    -   You MUST create a beautifully designed, PLAIN, and BLANK space for a handwritten caption.
    -   This space should be decorated to fit the page's aesthetic (e.g., a simple border or background element), but it MUST NOT contain any lines. It must be left completely EMPTY.
    -   **Height Constraint**: This blank caption area must not take up more than 20% of the total image height.
    -   **Width Constraint**: This blank space MUST span at least 90% of the page's total width.

---

**TEXT GENERATION RULES (Part 2):**

-   Generate a heartfelt, deeply emotional caption, approximately 3 sentences long, from the husband's perspective using the context below.
-   The caption should be written in a way that connects directly to his wife's heart when she reads it, evoking the specific feelings and memories of that moment.
-   Provide this caption as a separate, plain text output. This text is for the user to copy and will not be on the image.

---

**Context for Caption Generation:**
-   **Calculated Context**: The photo was taken ${dateContext}. You MUST explicitly mention this context in the caption (e.g., 'This was week 20 of your pregnancy...' or 'Our little one was 3 weeks old here...').
-   **Husband's Note**: "${userPrompt || 'No specific note was provided. Please analyze the image content (expressions, setting, objects) to infer the context and write a personal, heartfelt caption based on what you see.'}"
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: fullPrompt,
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  let imageUrl = '';
  let caption = '';
  
  if (response.candidates && response.candidates[0] && response.candidates[0].content.parts.length > 0) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              const base64Bytes = part.inlineData.data;
              imageUrl = `data:${part.inlineData.mimeType};base64,${base64Bytes}`;
          } else if (part.text) {
              caption = part.text;
          }
      }
  }

  if (!imageUrl || !caption) {
    console.error("API did not return both an image and a caption.", response);
    throw new Error('Failed to generate a complete page. The model did not return both an image and a caption.');
  }

  return { imageUrl, caption };
}


export async function generateCaptionOnly(
  base64Image: string,
  mimeType: string,
  userPrompt: string,
  dateContext: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
You are a creative writer crafting a caption for a page in a 'Mummy Journey Storybook' from a husband to his wife.
Your task is to generate ONLY a new, unique, and heartfelt caption based on the provided context.

**Tone**: Emotional, thoughtful, and personal.

**Rules**:
- Write from the husband's first-person perspective.
- The caption should be heartfelt, deeply emotional, and approximately 3 sentences long.
- It should be written to connect directly to his wife's heart, evoking the specific feelings and memories of that moment.
- Your output MUST be plain text, containing ONLY the caption.
- Do NOT output any other text, titles, or formatting.

---
**Context for Caption Generation:**
- **Calculated Context**: The photo was taken ${dateContext}. You MUST explicitly mention this context in the caption (e.g., 'This was week 20 of your pregnancy...' or 'Our little one was 3 weeks old here...').
- **Husband's Note**: "${userPrompt || 'No specific note was provided. Please analyze the image content (expressions, setting, objects) to infer the context and write a personal, heartfelt caption based on what you see.'}"
`;

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

  return response.text;
}