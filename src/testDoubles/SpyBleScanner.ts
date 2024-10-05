import BleScannerImpl from '../BleScanner'

export default class SpyBleScanner extends BleScannerImpl {
    public constructor() {
        super()
    }

    public getIsScanning() {
        return this.isScanning
    }
}
