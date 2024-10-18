import { generateId } from '@sprucelabs/test-utils'
import { Peripheral } from '@abandonware/noble'
import { BleScanner, ScanOptions } from '../BleScanner'
import FakePeripheral from './FakePeripheral'

export default class FakeBleScanner implements BleScanner {
    public static fakedPeripherals: FakePeripheral[] = []

    public callsToScanForPeripheral: FakeScanForPeripheralCall[] = []
    public callsToScanForPeripherals: FakeScanForPeripheralsCall[] = []
    public numCallsToStopScanning = 0

    public async scanForPeripheral(uuid: string, options?: ScanOptions) {
        this.callsToScanForPeripheral.push({ uuid, options })

        return this.fakedPeripherals.find(
            (peripheral) => peripheral.uuid === uuid
        ) as unknown as Peripheral
    }

    public async scanForPeripherals(uuids: string[], options?: ScanOptions) {
        this.callsToScanForPeripherals.push({ uuids, options })

        return this.fakedPeripherals.filter((peripheral) =>
            uuids.includes(peripheral.uuid)
        ) as unknown as Peripheral[]
    }

    public async stopScanning() {
        this.numCallsToStopScanning++
    }

    public static setFakedPeripherals(uuids = this.generateRandomUuids()) {
        this.fakedPeripherals = this.createFakePeripherals(uuids)
    }

    public static createFakePeripherals(uuids: string[]) {
        return uuids.map((uuid) => {
            return this.createFakePeripheral(uuid)
        })
    }

    public static createFakePeripheral(uuid?: string) {
        return new FakePeripheral(uuid)
    }

    public static generateRandomUuids(num = 1) {
        return Array.from({ length: num }, () => generateId())
    }

    private get fakedPeripherals() {
        return FakeBleScanner.fakedPeripherals
    }
}

export interface FakeScanForPeripheralCall {
    uuid: string
    options?: ScanOptions
}

export interface FakeScanForPeripheralsCall {
    uuids: string[]
    options?: ScanOptions
}
