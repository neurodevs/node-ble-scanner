import { generateId } from '@sprucelabs/test-utils'
import { Peripheral } from '@abandonware/noble'
import { BleScanner } from '../BleScanner'

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
        return {
            uuid: uuid ?? generateId(),
            advertisement: {
                localName: generateId(),
                manufacturerData: Buffer.from([0x01, 0x02, 0x03, 0x04]),
            },
            rssi: Math.random() * 100,
            connectable: true,
        } as Peripheral
    }

    private get fakedPeripherals() {
        return FakeBleScanner.fakedPeripherals
    }
}
