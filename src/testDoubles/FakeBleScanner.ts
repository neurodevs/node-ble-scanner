import { generateId } from '@sprucelabs/test-utils'
import { Peripheral } from '@abandonware/noble'
import { BleScanner, ScanForPeripheralOptions } from '../BleScanner'
import FakePeripheral from './FakePeripheral'

export default class FakeBleScanner implements BleScanner {
    public static fakedPeripherals: FakePeripheral[] = []

    public static numCallsToConstructor = 0
    public static numCallsToScanAll = 0
    public static callsToScanForPeripheral: FakeScanForPeripheralCall[] = []
    public static callsToScanForPeripherals: FakeScanForPeripheralsCall[] = []
    public static callsToScanForName: string[] = []
    public static callsToScanForNames: string[][] = []
    public static numCallsToStopScanning = 0

    public constructor() {
        FakeBleScanner.numCallsToConstructor++
    }

    public async scanAll() {
        FakeBleScanner.numCallsToScanAll++
        return this.fakedPeripherals as unknown as Peripheral[]
    }

    public async scanForPeripheral(
        uuid: string,
        options?: ScanForPeripheralOptions
    ) {
        this.callsToScanForPeripheral.push({ uuid, options })

        return this.fakedPeripherals.find(
            (peripheral) => peripheral.uuid === uuid
        ) as unknown as Peripheral
    }

    public async scanForPeripherals(
        uuids: string[],
        options?: ScanForPeripheralOptions
    ) {
        this.callsToScanForPeripherals.push({ uuids, options })

        return this.fakedPeripherals.filter((peripheral) =>
            uuids.includes(peripheral.uuid)
        ) as unknown as Peripheral[]
    }

    public async scanForName(name: string) {
        this.callsToScanForName.push(name)

        return this.fakedPeripherals.find(
            (peripheral) => peripheral.advertisement.localName === name
        ) as unknown as Peripheral
    }

    public async scanForNames(names: string[]) {
        this.callsToScanForNames.push(names)

        return this.fakedPeripherals.filter((peripheral) =>
            names.includes(peripheral.advertisement.localName)
        ) as unknown as Peripheral[]
    }

    public async stopScanning() {
        FakeBleScanner.numCallsToStopScanning++
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

    private get callsToScanForPeripheral() {
        return FakeBleScanner.callsToScanForPeripheral
    }

    private get callsToScanForPeripherals() {
        return FakeBleScanner.callsToScanForPeripherals
    }

    private get callsToScanForName() {
        return FakeBleScanner.callsToScanForName
    }

    private get callsToScanForNames() {
        return FakeBleScanner.callsToScanForNames
    }

    private get fakedPeripherals() {
        return FakeBleScanner.fakedPeripherals
    }

    public static resetTestDouble() {
        FakeBleScanner.fakedPeripherals = []
        FakeBleScanner.numCallsToConstructor = 0
        FakeBleScanner.callsToScanForPeripheral = []
        FakeBleScanner.callsToScanForPeripherals = []
        FakeBleScanner.numCallsToStopScanning = 0
    }
}

export interface FakeScanForPeripheralCall {
    uuid: string
    options?: ScanForPeripheralOptions
}

export interface FakeScanForPeripheralsCall {
    uuids: string[]
    options?: ScanForPeripheralOptions
}
