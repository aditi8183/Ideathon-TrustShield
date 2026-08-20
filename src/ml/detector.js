import * as ort from "onnxruntime-web";


let session = null;


export async function loadModel() {

    if (!session) {

        session = await ort.InferenceSession.create(
            "/ml_model/trustshield_model.onnx"
        );

        console.log("TrustShield ML model loaded");
    }

    return session;
}


export async function predictMessage(message) {

    const model = await loadModel();

    console.log("Checking message:", message);

    // Temporary test
    return "model_loaded";
}