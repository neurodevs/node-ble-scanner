import BleScannerImpl, { BleScannerOptions } from '../BleScanner'

export default class SpyBleScanner extends BleScannerImpl {
    public constructor(options?: BleScannerOptions) {
        super(options)
    }

    public getIsScanning() {
        return this.isScanning
    }

    public getTimeoutMs() {
        return this.timeoutMs
    }
}
