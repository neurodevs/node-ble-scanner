import { generateId } from '@sprucelabs/test-utils'

export default class FakePeripheral {
    public uuid: string

    public advertisement = {
        localName: generateId(),
        manufacturerData: Buffer.from([0x01, 0x02, 0x03, 0x04]),
    }

    public rssi = Math.random() * 100

    public connectable = true

    public constructor(uuid?: string) {
        this.uuid = uuid ?? generateId()
    }
}
