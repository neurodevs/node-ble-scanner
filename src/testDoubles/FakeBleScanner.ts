import { generateId } from '@sprucelabs/test-utils'
import { Peripheral } from '@abandonware/noble'
import { BleScanner } from '../BleScanner'
import FakePeripheral from './FakePeripheral'

export default class FakeBleScanner implements BleScanner {
    public static fakedPeripherals: FakePeripheral[] = []

    public callsToScanForPeripheral: string[] = []
    public callsToScanForPeripherals: string[][] = []

    public async scanForPeripheral(uuid: string) {
        this.callsToScanForPeripheral.push(uuid)

        return this.fakedPeripherals.find(
            (peripheral) => peripheral.uuid === uuid
        ) as unknown as Peripheral
    }

    public async scanForPeripherals(uuids: string[]) {
        this.callsToScanForPeripherals.push(uuids)

        return this.fakedPeripherals.filter((peripheral) =>
            uuids.includes(peripheral.uuid)
        ) as unknown as Peripheral[]
    }

    public static setFakedPeripherals(uuids?: string[]) {
        this.fakedPeripherals = this.createFakePeripherals(
            uuids ?? this.generateRandomUuids()
        )
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
