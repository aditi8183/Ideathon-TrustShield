import { useEffect } from "react";
import { loadModel } from "../ml/detector";

export default function MLTest() {

  useEffect(() => {

    async function testModel() {
      try {
        await loadModel();
        console.log("✅ TrustShield ML model working");
      } 
      catch (error) {
        console.error(
          "❌ Model loading failed:",
          error
        );
      }
    }

    testModel();

  }, []);


  return (
    <div>
      ML Model Test Running...
    </div>
  );
}