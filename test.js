
async function listModels() {
  const apiKey = "AIzaSyBI-m0K2BLnKuQ085LjEA3DSrTwGsCCICg"; // Paste your key here temporarily
  try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await result.json();
    
    console.log("--- Available Models ---");
    data.models.forEach(m => {
      console.log(`${m.name} - ${m.displayName}`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}
listModels();
