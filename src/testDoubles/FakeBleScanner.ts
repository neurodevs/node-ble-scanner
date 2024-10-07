import { generateId } from '@sprucelabs/test-utils'
import { Peripheral } from '@abandonware/noble'
import { BleScanner } from '../BleScanner'
import FakePeripheral from './FakePeripheral'

export default class FakeBleScanner implements BleScanner {
    public callsToScanForPeripherals: string[][] = []

    private static fakedPeripherals: Peripheral[] = []

    public async scanForPeripherals(uuids: string[]) {
        this.callsToScanForPeripherals.push(uuids)
        return this.fakedPeripherals
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

    public static generateRandomUuids(num = 1) {
        return Array.from({ length: num }, () => generateId())
    }

    public static createFakePeripheral(uuid?: string) {
        return new FakePeripheral(uuid) as Peripheral
    }

    private get fakedPeripherals() {
        return FakeBleScanner.fakedPeripherals
    }
}
