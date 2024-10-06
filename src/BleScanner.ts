import noble, { Peripheral } from '@abandonware/noble'

export default class BleScannerImpl implements BleScanner {
    public static Class?: BleScannerConstructor
    public static noble = noble

    protected isScanning = false
    private peripherals: Peripheral[] = []
    private uuids: string[] = []
    private resolvePromise?: (peripherals: Peripheral[]) => void

    protected constructor() {
        this.setupOnDiscover()
    }

    private setupOnDiscover() {
        this.noble.on('discover', this.handleOnDiscover.bind(this))
    }

    private async handleOnDiscover(peripheral: Peripheral) {
        const { uuid } = peripheral

        if (this.isTargetPeripheral(uuid)) {
            this.peripherals.push(peripheral)

            if (this.allPeripheralsFound) {
                await this.stopScanning()
            }
        }
    }

    private isTargetPeripheral(uuid: string) {
        return this.uuids.includes(uuid)
    }

    private get allPeripheralsFound() {
        return this.uuids.length === this.peripherals.length
    }

    private async stopScanning() {
        await this.noble.stopScanningAsync()
        this.resolvePromise?.(this.peripherals)
        this.isScanning = false
    }

    public static Create() {
        return new (this.Class ?? this)()
    }

    public async scanForPeripherals(uuids: string[] | string) {
        this.isScanning = true
        this.uuids = this.formatUuids(uuids)

        return this.createStartScanningPromise()
    }

    private formatUuids(uuids: string | string[]) {
        switch (typeof uuids) {
            case 'string':
                return [uuids]
            case 'object':
                return uuids
        }
    }

    private createStartScanningPromise() {
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve
            this.noble.startScanningAsync([], false).catch(reject)
        }) as Promise<Peripheral[]>
    }

    private get noble() {
        return BleScannerImpl.noble
    }
}

export interface BleScanner {
    scanForPeripherals(uuids: string[]): Promise<Peripheral[]>
}

export type BleScannerConstructor = new () => BleScanner
