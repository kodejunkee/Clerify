import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AnalysisResult } from './analysis';

export const generateContractPDF = async (result: AnalysisResult) => {
    try {
        const { score, summary, redFlags } = result;

        const riskColor = score > 75 ? '#DC2626' : score > 40 ? '#D69E2E' : '#16A34A';
        const riskLabel = score > 75 ? 'Critical Risk' : score > 40 ? 'Moderate Risk' : 'Safe';

        // Build Red Flags List HTML
        const redFlagsHtml = redFlags.map(flag => {
            const severity = flag.severity || 'minor';
            const color = severity === 'critical' ? '#DC2626' : severity === 'moderate' ? '#D97706' : '#2563EB'; // Blue for minor
            const bg = severity === 'critical' ? '#FEF2F2' : severity === 'moderate' ? '#FFFBEB' : '#EFF6FF'; // Light Blue for minor

            return `
                <div class="flag-card" style="background-color: ${bg}; border-left: 4px solid ${color};">
                    <div style="color: ${color}; font-weight: 700; font-size: 11px; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
                        ${severity} RISK
                    </div>
                    <div style="font-size: 14px; color: #374151; line-height: 1.5;">
                        ${flag.clause}
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Contract Analysis Report</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @page { margin: 40px; }
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                            color: #1F2937; 
                            line-height: 1.5;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        
                        /* Layout Utilities */
                        .page-break { page-break-before: always; }
                        .no-break { page-break-inside: avoid; }
                        
                        /* Header */
                        .header { 
                            text-align: center; 
                            margin-bottom: 48px; 
                            padding-bottom: 24px; 
                            border-bottom: 2px solid #F3F4F6;
                        }
                        .title { 
                            font-size: 28px; 
                            font-weight: 800; 
                            color: #111827; 
                            margin-bottom: 8px;
                            letter-spacing: -0.5px;
                        }
                        .subtitle { 
                            font-size: 14px; 
                            color: #6B7280; 
                            font-weight: 500;
                        }
                        
                        /* Score Section */
                        .score-card { 
                            text-align: center; 
                            margin-bottom: 48px; 
                            page-break-inside: avoid;
                        }
                        .score-circle { 
                            width: 120px; 
                            height: 120px; 
                            border-radius: 50%; 
                            border: 10px solid ${riskColor}; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            margin: 0 auto 16px auto;
                            font-size: 42px; 
                            font-weight: 800; 
                            color: ${riskColor};
                            background-color: #fff;
                        }
                        .risk-label { 
                            font-size: 24px; 
                            font-weight: 700; 
                            color: ${riskColor}; 
                            text-transform: capitalize;
                        }
                        
                        /* Content Sections */
                        .section { margin-bottom: 40px; }
                        .section-title { 
                            font-size: 18px; 
                            font-weight: 700; 
                            color: #111827; 
                            border-bottom: 2px solid #E5E7EB; 
                            padding-bottom: 12px; 
                            margin-bottom: 20px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .summary-box { 
                            background-color: #F9FAFB; 
                            padding: 24px; 
                            border-radius: 12px; 
                            font-size: 15px;
                            color: #4B5563;
                            line-height: 1.6;
                            border: 1px solid #E5E7EB;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                        }
                        
                        /* Flags */
                        .flag-card {
                            background-color: #fff;
                            padding: 16px;
                            border-radius: 8px;
                            margin-bottom: 12px;
                            page-break-inside: avoid; /* Prevents splitting across pages */
                            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                            border: 1px solid #E5E7EB; /* Fallback border */
                        }

                        /* Footer */
                        .footer { 
                            margin-top: 60px; 
                            text-align: center; 
                            font-size: 11px; 
                            color: #9CA3AF; 
                            border-top: 1px solid #E5E7EB; 
                            padding-top: 24px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">Contract Analysis Report</div>
                        <div class="subtitle">Generated by Contract Guardian</div>
                    </div>

                    <div class="score-card">
                        <div class="score-circle">
                            ${score}
                        </div>
                        <div class="risk-label">${riskLabel}</div>
                    </div>

                    <div class="section">
                        <div class="section-title">Executive Summary</div>
                        <div class="summary-box">
                            ${summary}
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Risk Assessment (${redFlags.length} Flags)</div>
                        ${redFlags.length > 0 ? redFlagsHtml : '<p style="font-style: italic; color: #6B7280; text-align: center; padding: 20px;">No specific red flags detected. The contract appears standard.</p>'}
                    </div>

                    <div class="footer">
                        <p>Disclaimer: This report is AI-generated and does not constitute legal advice. Please consult a qualified attorney for professional review.</p>
                        <p>&copy; ${new Date().getFullYear()} Contract Guardian</p>
                    </div>
                </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw error;
    }
};
