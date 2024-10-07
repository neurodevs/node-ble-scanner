import { generateId } from '@sprucelabs/test-utils'
import { Peripheral } from '@abandonware/noble'
import { BleScanner } from '../BleScanner'
import FakePeripheral from './FakePeripheral'

export default class FakeBleScanner implements BleScanner {
    public callsToScanForPeripherals: (string[] | string)[] = []

    public static fakedPeripherals: FakePeripheral[] = []

    public async scanForPeripherals(uuids: string): Promise<Peripheral>
    public async scanForPeripherals(uuids: string[]): Promise<Peripheral[]>

    public async scanForPeripherals(uuids: string[] | string) {
        this.callsToScanForPeripherals.push(uuids)

        switch (typeof uuids) {
            case 'string':
                return this.fakedPeripherals.find(
                    (peripheral) => peripheral.uuid === uuids
                ) as unknown as Peripheral
            case 'object':
                return this.fakedPeripherals.filter((peripheral) =>
                    (uuids as string[]).includes(peripheral.uuid)
                ) as unknown as Peripheral[]
        }
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
