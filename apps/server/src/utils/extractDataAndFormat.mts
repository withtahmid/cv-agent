import { z } from "zod";

export const CvExtractSchema = z.object({
    name: z
        .string()
        .trim()
        .transform((val) =>
            val
                ? val
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase()) // Title Case
                      .replace(/\s+/g, " ")
                      .trim()
                : ""
        ),

    gender: z
        .string()
        .trim()
        .transform((val) => {
            const lower = val.toLowerCase();
            if (["male", "m"].includes(lower)) return "Male";
            if (["female", "f"].includes(lower)) return "Female";
            return "";
        }),

    date_of_birth: z
        .string()
        .trim()
        .transform((val) => {
            if (!val) return "";
            // Normalize to DD/MM/YYYY if possible
            const match = val.match(
                /^(\d{1,2})[\/\-\s]?(\d{1,2})[\/\-\s]?(\d{2,4})$/
            );
            if (match) {
                const [_, d, m, y] = match;
                const day = d.padStart(2, "0");
                const month = m.padStart(2, "0");
                const year = y.length === 2 ? "20" + y : y;
                return `${day}/${month}/${year}`;
            }
            return "";
        }),

    nid_number: z
        .string()
        .trim()
        .transform((val) => {
            const digits = val.replace(/\D/g, "");
            return /^\d{8,20}$/.test(digits) ? digits : "";
        }),

    phone: z
        .string()
        .trim()
        .transform((val) => {
            let digits = val.replace(/\D/g, "");
            if (digits.startsWith("88")) {
                digits = digits.slice(2);
            }
            if (digits.length === 11 && digits.startsWith("01")) {
                return digits.slice(1);
            }
            return "";
        }),
    education: z
        .string()
        .trim()
        .transform((val) => {
            const v = val.toLowerCase();
            if (!v) return "";
            if (v.includes("honors"))
                return v.includes("ongoing") ? "Honors (Ongoing)" : "Honors";
            if (v.includes("hsc"))
                return v.includes("ongoing") ? "HSC (Ongoing)" : "HSC";
            if (v.includes("ssc"))
                return v.includes("ongoing") ? "SSC (Ongoing)" : "SSC";
            return val;
        }),

    fathers_name: z
        .string()
        .trim()
        .transform((val) =>
            val
                ? val
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                      .replace(/\s+/g, " ")
                      .trim()
                : ""
        ),

    mothers_name: z
        .string()
        .trim()
        .transform((val) =>
            val
                ? val
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                      .replace(/\s+/g, " ")
                      .trim()
                : ""
        ),

    present_address: z
        .string()
        .trim()
        .transform((val) => val.replace(/\s+/g, " ").trim()),
});

export type ExtractedData = z.infer<typeof CvExtractSchema>;
