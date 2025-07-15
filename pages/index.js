"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/router"

const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

const canadianProvinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon",
]

export default function Home() {
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState("")
  const [answer, setAnswer] = useState("")
  const [language, setLanguage] = useState("en")
  const [country, setCountry] = useState("CA")
  const [usState, setUsState] = useState("")
  const [canadianProvince, setCanadianProvince] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const { agreed } = router.query
    if (agreed !== "true") {
      router.replace("/agreement")
    }
  }, [router.query, router])

  const handleFileChange = (e) => {
    if (e.target.files[0]?.type !== "application/pdf") {
      alert("Please upload a PDF file")
      return
    }
    setFile(e.target.files[0])
  }

  const handleCountryChange = (e) => {
    setCountry(e.target.value)
    setUsState("")
    setCanadianProvince("")
  }

  const handleExplain = async () => {
    if (!file) {
      alert("Please select a file first")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("language", language)
      formData.append("country", country)

      if (country === "US") formData.append("state", usState)
      else if (country === "CA") formData.append("province", canadianProvince)

      const response = await axios.post("/api/explain", formData)
      setSummary(response.data.summary || "No summary generated")
      setAnswer(response.data.rights || "No rights info")
    } catch (err) {
      setSummary("Error processing document")
      setAnswer("Error retrieving rights")
    } finally {
      setLoading(false)
    }
  }

  if (router.query.agreed !== "true") {
    return null
  }

  return (
    <div className="container">
      <header className="header fade-in-up">
        <h1 className="main-title">⚖️ LegalAI</h1>
        <p className="tagline">Powered by Google Gemini ©</p>
      </header>

      <main className="main-card fade-in-up-delay">
        <h2 className="section-title">
          <span className="section-icon">📄</span>
          Document Analysis Center
        </h2>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📎</span>
              Legal Document (PDF)
            </label>
            <div className="file-input">
              <input type="file" accept=".pdf" onChange={handleFileChange} id="file-upload" />
              <label htmlFor="file-upload" className="file-input-label">
                <span style={{ fontSize: "1.5rem" }}>📁</span>
                {file ? "Change Document" : "Choose PDF Document"}
              </label>
            </div>
            {file && (
              <div className="file-selected">
                <span>✅</span>
                <span>{file.name}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🌐</span>
              Analysis Language
            </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="form-select">
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 French</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="de">🇩🇪 German</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🗺️</span>
              Jurisdiction
            </label>
            <select value={country} onChange={handleCountryChange} className="form-select">
            <option value="CA">🇨🇦 Canada</option>
              <option value="US">🇺🇸 United States</option>
          
           
            </select>
          </div>

          {country === "CA" && (
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏛️</span>
                Province
              </label>
              <select value={canadianProvince} onChange={(e) => setCanadianProvince(e.target.value)} className="form-select">
                <option value="">Select a province</option>
                {canadianProvinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
          )}

          {country === "US" && (
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏛️</span>
                State
              </label>
              <select value={usState} onChange={(e) => setUsState(e.target.value)} className="form-select">
                <option value="">Select a state</option>
                {usStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          )}

          
        </div>

        <button onClick={handleExplain} disabled={loading || !file} className="analyze-btn">
          {loading ? (
            <div className="btn-loading">
              <div className="spinner"></div>
              <span>Analyzing Document...</span>
            </div>
          ) : (
            <>
              <span style={{ fontSize: "1.2rem" }}>✨</span>
              <span>Analyze Document</span>
            </>
          )}
        </button>
      </main>

      {(summary || answer) && (
        <section className="results-section fade-in-up">
          <div className="result-card">
            <h3 className="result-title">
              <span style={{ color: "#10b981", fontSize: "1.5rem" }}>📋</span>
              Document Summary
            </h3>
            <div className="result-content">{summary || "No summary available"}</div>
          </div>

          <div className="result-card">
            <h3 className="result-title">
              <span style={{ color: "#3b82f6", fontSize: "1.5rem" }}>⚖️</span>
              Your Legal Rights
            </h3>
            <div className="result-content" dangerouslySetInnerHTML={{ __html: answer || "No rights information available" }} />
          </div>
        </section>
      )}

      <footer className="footer">
        <p>🤖 Project made by Aaron Rathore</p>
      </footer>
    </div>
  )
}
