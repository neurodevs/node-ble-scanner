import noble, { Peripheral } from '@abandonware/noble'
import SpruceError from './errors/SpruceError'

export default class BleScannerImpl implements BleScanner {
    public static Class?: BleScannerConstructor
    public static noble = noble

    protected isScanning = false
    protected timeoutMs?: number
    private peripherals: Peripheral[] = []
    private uuids: string[] = []
    private scanPromise!: ScanPromise
    private resolvePromise!: (peripherals: Peripheral[]) => void

    protected constructor(options?: BleScannerOptions) {
        const { defaultTimeoutMs } = options ?? {}
        this.timeoutMs = defaultTimeoutMs

        this.setupOnDiscover()
    }

    private setupOnDiscover() {
        this.noble.on('discover', this.handleOnDiscover.bind(this))
    }

    private async handleOnDiscover(peripheral: Peripheral) {
        const { uuid } = peripheral

        if (this.uuids.length === 0 || this.isTargetPeripheral(uuid)) {
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
        return (
            this.uuids.length === 0 ||
            this.uuids.length === this.peripherals.length
        )
    }

    public static Create(options?: BleScannerOptions) {
        return new (this.Class ?? this)(options)
    }

    public async scanAll() {
        return this.createScanPromise()
    }

    public async scanForUuid(uuid: string, options?: ScanOptions) {
        const peripherals = await this.scanForUuids([uuid], options)
        return peripherals[0]
    }

    public async scanForUuids(uuids: string[], options?: ScanOptions) {
        const { timeoutMs } = options ?? {}

        this.isScanning = true
        this.peripherals = []
        this.uuids = uuids
        this.timeoutMs = timeoutMs

        this.scanPromise = this.createScanPromise()

        if (this.timeoutMs) {
            return this.setTimeout()
        }

        return this.scanPromise
    }

    private createScanPromise() {
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve
            this.noble.startScanningAsync([], false).catch(reject)
        }) as ScanPromise
    }

    private async setTimeout() {
        const timeoutPromise = this.createTimeoutPromise()
        return Promise.race([this.scanPromise, timeoutPromise]) as ScanPromise
    }

    private createTimeoutPromise() {
        return new Promise((_, reject) => {
            const timeoutId = setTimeout(() => {
                reject(this.throwScanTimedOut())
            }, this.timeoutMs)

            void this.scanPromise.finally(() => clearTimeout(timeoutId))
        })
    }

    private throwScanTimedOut() {
        return new SpruceError({
            code: 'SCAN_TIMED_OUT',
            uuids: this.uuids,
            timeoutMs: this.timeoutMs!,
        })
    }

    public async scanForName(name: string) {
        const peripherals = await this.scanForNames([name])
        return peripherals[0]
    }

    public async scanForNames(names: string[]) {
        const peripherals = await this.scanAll()
        return peripherals.filter((peripheral) =>
            names.includes(peripheral.advertisement.localName)
        )
    }

    public async stopScanning() {
        this.isScanning = false
        await this.noble.stopScanningAsync()
        this.resolvePromise(this.peripherals)
    }

    private get noble() {
        return BleScannerImpl.noble
    }
}

export interface BleScanner {
    scanAll(): Promise<Peripheral[]>
    scanForUuid(uuid: string, options?: ScanOptions): Promise<Peripheral>
    scanForUuids(uuids: string[], options?: ScanOptions): Promise<Peripheral[]>
    scanForName(name: string): Promise<Peripheral>
    scanForNames(names: string[]): Promise<Peripheral[]>
    stopScanning(): Promise<void>
}

export type BleScannerConstructor = new (
    options?: BleScannerOptions
) => BleScanner

export interface BleScannerOptions {
    defaultTimeoutMs?: number
}

export interface ScanOptions {
    timeoutMs?: number
}

export type ScanPromise = Promise<Peripheral[]>
