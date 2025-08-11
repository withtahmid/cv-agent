export const generatePrompt = (ocr_text: string): string => {
    const prompt = `
        Extract the following fields from this resume/CV text and return them in a structured JSON format.
        The Resume Text below was produced by OCR from scanned/hardcopy CV images. OCR may contain character confusions (e.g. O ↔ 0, I/l/1, S ↔ 5, B ↔ 8), missing or extra spaces, broken lines, or Bengali labels. Be careful — DO NOT HALLUCINATE values. Only extract a value when you can identify it clearly from the text. If uncertain, return an empty string for that field.

        Normalization & extraction rules:
        - Name: convert to Title Case, remove honorifics (Mr., Mrs., Ms., Dr., etc.). Trim whitespace.
        - Gender: return only "Male" or "Female". Map common variants ("M", "F", "male", "female", "man", "woman") to those values. If ambiguous or not found, use empty string.
        - Date of Birth: return in DD/MM/YYYY format. Accept common separators or month names and convert. If only a partial/ambiguous date is present, leave empty string.
        - NID Number: return digits only (remove non-digits). Correct obvious OCR digit/letter confusions only when high confidence (e.g., O→0, l→1). If not confident, leave empty string.
        - Phone / Contact Number: return digits only, including country code if clearly present. Remove spaces, parentheses, and hyphens. If multiple numbers exist, return the primary/mobile-looking one (first found). If uncertain, leave empty string.
        - Educational Qualifications: return exactly one word — "Honors" or "HSC" or "SSC". Prioritize the latest present in the CV (Honors > HSC > SSC). If the study is ongoing (words like "ongoing", "pursuing", "running", "currently studying"), append " (Ongoing)" — e.g. "Honors (Ongoing)".
        - Fathers Name / Mothers Name: convert to Title Case, trim, remove label text. Search for English labels ("Father", "Father's Name", "Fathers Name", "Mother", "Mother's Name") and Bengali equivalents ("পিতার নাম", "মাতার নাম").
        - Present Address: return the "Present Address" or "Mailing Address" block. Collapse multiple lines and whitespace into a single space. If multiple address blocks are present, prefer the one labeled "Present" or "Present Address"; otherwise return the first address block.

        Important constraints:
        - DO NOT invent or guess values. If a value cannot be determined confidently from the OCR text, return an empty string.
        - Return ONLY the JSON object below, with EXACT keys and valid JSON (no trailing commas, no extra text, no commentary).
        - If you correct an OCR character (e.g. O→0), do so **only** when the correction produces a plausible numeric or formatted value; otherwise leave the field empty.
        - Your output must be a valid JSON object because it will be parsed by the server. If you return invalid JSON, the server will throw an error.
        Resume Text:
        ${ocr_text}

        Return this EXACT JSON structure: DO NOT ADD EVEN a SINGLE CHARACTER OUTSIDE THIS JSON OBJECT. NOT EVEN \`\`\`json
        {
            "name": "",
            "gender": "",
            "date_of_birth": "",
            "nid_number": "",
            "phone": "",
            "education": "",
            "fathers_name": "",
            "mothers_name": "",
            "present_address": ""
        }
    `;
    return prompt;
};
