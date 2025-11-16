import { FingerprintReader, SampleFormat } from "@digitalpersona/devices";

class FingerprintService {
    reader: FingerprintReader;
    private sampleHandler?: (event: any) => void;

    constructor() {
        this.reader = new FingerprintReader();
    }

    async listReaders() {
        try {
            const devices = await this.reader.enumerateDevices();
            return devices;
        } catch (err) {
            console.error("Error enumerating devices:", err);
            throw err;
        }
    }

    async startCapture(onSample: (sample: string) => void, deviceUid?: string) {
        // Remove previous handler to avoid duplicates
        if (this.sampleHandler)
            this.reader.off("SamplesAcquired", this.sampleHandler);

        // Create new handler
        this.sampleHandler = (event: any) => {
            try {
                event.samples.forEach((s: string) => onSample(s));
            } catch (err) {
                console.error("Sample processing error:", err);
            }
        };

        // Register handler once
        this.reader.on("SamplesAcquired", this.sampleHandler);

        try {
            await this.reader.startAcquisition(SampleFormat.Intermediate, deviceUid);
            console.log("Acquisition started!");
        } catch (err) {
            console.error("startAcquisition error:", err);
            throw err;
        }
    }

    async stopCapture(deviceUid?: string) {
        try {
            // stop acquisition
            await this.reader.stopAcquisition(deviceUid);

            // Remove listener after stopping
            if (this.sampleHandler) {
                this.reader.off("SamplesAcquired", this.sampleHandler);
                this.sampleHandler = undefined;
            }
        } catch (err) {
            console.warn("stopCapture warning:", err);
        }
    }
}

export const fingerprintService = new FingerprintService();
