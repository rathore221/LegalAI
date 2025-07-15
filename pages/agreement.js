"use client"

import { useState } from "react"
import { useRouter } from "next/router"

export default function UserAgreement() {
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  const handleAgree = () => {
    // Redirect to the main page with a query parameter indicating agreement
    router.push("/?agreed=true")
  }

  const agreementText = `
Welcome to LegalAI ("the Service"). LegalAI is a platform that processes legal documents to provide AI-generated summaries and informational insights about user rights based on the selected country and region. This User Agreement ("Agreement") governs your access to and use of the Service. By using LegalAI, you agree to the terms outlined below. If you do not agree, you must not use the Service.

1. Nature of Service
  
  LegalAI provides summaries of legal documents and general information about legal rights using AI technologies. This information is for  informational purposes only and does not constitute legal advice. Use of this Service does not create an attorney-client relationship. For personalized legal advice, please consult a qualified attorney licensed in your jurisdiction.
  
2. No Guarantee of Legal Accuracy
  
  LegalAI aims to provide helpful summaries and information, but:
    
  We do not guarantee the accuracy, completeness, or relevance of any content generated.
  Laws vary across jurisdictions and are subject to change.
  You are solely responsible for any decisions made based on outputs provided by the Service.

3. User Responsibilities
  
  By using the Service, you agree to:
  
    Only upload documents that you have the legal right to share and process.
    Avoid uploading highly sensitive, personal, confidential, or privileged information, understanding that such data may be processed by third-party services.
    Use the Service in compliance with all applicable laws and regulations.
4. Use of Google Gemini API & Data Processing
  
  LegalAI uses the Google Gemini API to process, summarize, and interpret uploaded legal documents. By using the Service, you acknowledge and agree that:
  
  Uploaded documents and inputs are transmitted to and processed by Google Gemini API, a third-party AI service.
  LegalAI does not permanently store your documents beyond the time necessary to generate the requested output, unless explicitly required for service improvement and with your consent.
  We cannot guarantee the confidentiality or privacy of information processed by third-party providers like Google Gemini.
  Google processes data according to its own privacy policy and terms of service, which you can review here:
  Google Privacy Policy
  Google Terms of Service
  By using LegalAI, you accept any risks associated with transmitting data to and from third-party AI services.
  
5. Third-Party Services
  
  In addition to Google Gemini, LegalAI may integrate with other third-party services. We do not control or assume responsibility for these services or any data handling practices they employ.
  
6. Disclaimer of Warranties
  
  The Service is provided "as is" and "as available", without any warranties of any kind, express or implied, including but not limited to warranties of:
  
  Merchantability
  Fitness for a particular purpose
  Non-infringement
  We do not warrant that the Service will be:
  
  Error-free or uninterrupted
  Accurate or reliable
  Secure from unauthorized access or data breaches

7. Limitation of Liability
  
  To the maximum extent permitted by law:
  
  LegalAI, its owners, affiliates, and service providers (including Google Gemini) shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages, including but not limited to loss of data, revenue, or profits, arising from your use of the Service.
  This limitation applies regardless of whether claims are based on warranty, contract, tort, or any other legal theory.
  
8. Indemnification
  
  You agree to indemnify, defend, and hold harmless LegalAI, its affiliates, officers, and partners from any claims, liabilities, damages, losses, and expenses, including reasonable attorney fees, arising out of:
  
  Your use or misuse of the Service
  Your violation of this Agreement
  Your violation of any third-party rights

9. Modifications to Terms
  
  We reserve the right to modify or update this Agreement at any time. Users will be notified of material changes, and continued use of the Service after such updates constitutes your acceptance of the new terms.
  
10. Project Only
  
  Please note: LegalAI is an experimental project intended for informational purposes only and is not a substitute for professional legal advice.
`

  return (
    <div className="container">
      <main className="main-card fade-in-up">
        <h2 className="section-title" style={{ justifyContent: "center" }}>
          <span className="section-icon">📜</span>
          User Agreement
        </h2>
        <div className="result-content" style={{ maxHeight: "60vh", overflowY: "auto", marginBottom: "2rem" }}>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.95rem", lineHeight: "1.6" }}>
            {agreementText}
          </pre>
        </div>
        <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
          <input
            type="checkbox"
            id="agree-checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
          <label htmlFor="agree-checkbox" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
            I have read and agree to the User Agreement
          </label>
        </div>
        <button onClick={handleAgree} disabled={!agreed} className="analyze-btn" style={{ marginTop: "2rem" }}>
          Proceed to LegalAI Chat
        </button>
      </main>
    </div>
  )
}
