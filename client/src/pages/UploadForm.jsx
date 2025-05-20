import { useState } from "react";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("cv", file);

    const res = await fetch("http://localhost:3000/api/analyze-cv", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Analyser le CV</button>
      </form>

      {result && (
        <div>
          <h3>Résultat de l'analyse :</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default UploadForm;
