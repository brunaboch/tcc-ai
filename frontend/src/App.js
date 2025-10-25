import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [promptType, setPromptType] = useState("estudante");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Selecione uma imagem antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("promptType", promptType);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDescription(res.data.description);
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao gerar descrição da imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    alert("Descrição copiada!");
  };

  const handleDownload = () => {
    const blob = new Blob([description], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "descricao.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(description);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="App">
      <header>
        <h1>Descrição Acessível de Diagramas de Banco de Dados</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label htmlFor="image">Selecione a imagem:</label>
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            onChange={(e) => setImage(e.target.files[0])}
            aria-required="true"
          />

          <label htmlFor="promptType">Tipo de descrição:</label>
          <select
            id="promptType"
            value={promptType}
            onChange={(e) => setPromptType(e.target.value)}
          >
            <option value="estudante">Estudante</option>
            <option value="profissional">Profissional</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Gerando..." : "Gerar descrição"}
          </button>
        </form>

        {description && (
          <section className="result" aria-live="polite">
            <h2>Descrição:</h2>
            <p>{description}</p>
            <div className="buttons">
              <button onClick={handleCopy}>Copiar</button>
              <button onClick={handleDownload}>Baixar</button>
              <button onClick={handleSpeak}>Ler em voz alta</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;