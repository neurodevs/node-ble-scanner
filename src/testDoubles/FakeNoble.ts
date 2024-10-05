import { EventEmitter } from 'stream'
import { Peripheral } from '@abandonware/noble'

export default class FakeNoble extends EventEmitter {
    public didCallStartScanningAsync = false
    public didCallStopScanningAsync = false
    public didCallStartScanning = false
    public didCallStopScanning = false
    public didCallCancelConnect = false
    public didCallOn = false
    public didCallOnce = false
    public didCallRemoveListener = false
    public callsToStartScanningAsync: any[] = []
    public callsToOn: EventOperation[] = []
    public callsToOnce: EventOperation[] = []
    public callsToRemoveListener: EventOperation[] = []

    public fakedPeripherals: Peripheral[] = []

    public fakePeripherals(uuids: string[]) {
        return uuids.map((uuid) => {
            const peripheral = this.createFakePeripheral(uuid)
            this.fakedPeripherals.push(peripheral)
        })
    }

    private createFakePeripheral(uuid: string) {
        return {
            uuid,
            advertisement: {
                localName: 'Fake Device',
                manufacturerData: Buffer.from([0x01, 0x02, 0x03, 0x04]),
            },
            rssi: -60,
            connectable: true,
        } as Peripheral
    }

    public async startScanningAsync(uuids: string[], allowDuplicates: boolean) {
        this.didCallStartScanningAsync = true
        this.callsToStartScanningAsync.push({ uuids, allowDuplicates })

        this.fakedPeripherals.forEach((fakePeripheral) => {
            this.emit('discover', fakePeripheral)
        })
    }

    public async stopScanningAsync() {
        this.didCallStopScanningAsync = true
    }

    public startScanning() {
        this.didCallStartScanning = true
    }

    public stopScanning() {
        this.didCallStopScanning = true
    }

    public cancelConnect() {
        this.didCallCancelConnect = true
    }

    public on(eventName: string | symbol, listener: (...args: any[]) => void) {
        this.didCallOn = true
        this.callsToOn.push({ eventName, listener })
        super.on(eventName, listener)
        return this
    }

    public once(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ) {
        this.didCallOnce = true
        this.callsToOnce.push({ eventName, listener })
        super.once(eventName, listener)
        return this
    }

    public removeListener(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ) {
        this.didCallRemoveListener = true
        this.callsToRemoveListener.push({ eventName, listener })
        super.removeListener(eventName, listener)
        return this
    }

    public _state: any
    public _bindings: any
    public Peripheral: any
    public Service: any
    public Characteristic: any
    public Descriptor: any
}

export interface EventOperation {
    eventName: string | symbol
    listener: (...args: any[]) => void
}
