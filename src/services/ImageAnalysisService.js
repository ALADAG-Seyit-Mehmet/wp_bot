const nsfw = require('nsfwjs');
const tf = require('@tensorflow/tfjs-node');
const jpeg = require('jpeg-js');

let model;

class ImageAnalysisService {
    static async loadModel() {
        if (!model) {
            console.log("Loading AI Model (NSFWJS)... This may take a moment.");
            try {
                model = await nsfw.load();
                console.log("✅ AI Model Loaded.");
            } catch (err) {
                console.error("❌ Failed to load AI Model:", err);
            }
        }
    }

    /**
     * Convert Image Buffer to Tensor3D
     */
    static async imageToTensor(buffer) {
        try {
            // Decode image
            const image = await jpeg.decode(buffer, { useTArray: true });

            const numChannels = 3;
            const numPixels = image.width * image.height;
            const values = new Int32Array(numPixels * numChannels);

            // Convert raw data to Tensor format
            for (let i = 0; i < numPixels; i++) {
                for (let c = 0; c < numChannels; c++) {
                    values[i * numChannels + c] = image.data[i * 4 + c];
                }
            }

            return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32');
        } catch (e) {
            console.error("Error converting image to tensor:", e);
            return null;
        }
    }

    static async isNSFW(mediaBuffer) {
        if (!model) await this.loadModel();
        if (!model) return false; // Fail safe

        try {
            const imageTensor = await this.imageToTensor(mediaBuffer);
            if (!imageTensor) return false;

            const predictions = await model.classify(imageTensor);
            imageTensor.dispose(); // Clean up memory

            // logic: check for Porn or Hentai
            // predictions ex: [{ className: 'Neutral', probability: 0.9 }, ...]
            const porn = predictions.find(p => p.className === 'Porn');
            const hentai = predictions.find(p => p.className === 'Hentai');
            const sexy = predictions.find(p => p.className === 'Sexy');

            console.log("AI Analysis:", predictions[0].className, Math.round(predictions[0].probability * 100) + "%");

            // Strict Thresholds
            if (porn && porn.probability > 0.60) return "Pornography";
            if (hentai && hentai.probability > 0.60) return "Hentai";
            if (sexy && sexy.probability > 0.85) return "Sexually Explicit";

            return false;

        } catch (err) {
            console.error("Analysis Failed:", err);
            return false;
        }
    }
}

module.exports = ImageAnalysisService;
