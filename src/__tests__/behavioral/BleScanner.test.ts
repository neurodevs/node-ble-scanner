import AbstractSpruceTest, {
    test,
    assert,
    generateId,
} from '@sprucelabs/test-utils'
import noble from '@abandonware/noble'
import BleScannerImpl from '../../BleScanner'
import FakeNoble from '../../testDoubles/FakeNoble'
import SpyBleScanner from '../../testDoubles/SpyBleScanner'

export default class BleScannerTest extends AbstractSpruceTest {
    private static instance: SpyBleScanner
    private static noble: FakeNoble
    private static uuid: string

    protected static async beforeEach() {
        await super.beforeEach()

        this.uuid = generateId()
        this.setupFakeNoble()

        BleScannerImpl.Class = SpyBleScanner

        this.instance = this.BleScanner()
    }

    @test()
    protected static async canCreateBleScanner() {
        assert.isTruthy(this.instance)
    }

    @test()
    protected static async setsUpOnDiscoverForNoble() {
        assert.isEqual(
            this.noble.callsToOn.length,
            1,
            'BleScanner should have called noble.on(...)!'
        )

        const { eventName, listener } = this.noble.callsToOn[0]

        assert.isEqual(
            eventName,
            'discover',
            'BleScanner should have called noble.on("discover", ...)!'
        )

        assert.isFunction(
            listener,
            'BleScanner should have passed a function to noble.on(...)!'
        )
    }

    @test()
    protected static async scanForPeripheralsSetsIsScanningTrue() {
        assert.isFalse(
            this.instance.getIsScanning(),
            'noble.isScanning should be false before calling scanForPeripherals!'
        )

        void this.scanForPeripherals(['invalid-uuid'])
        await this.wait(1)

        assert.isTrue(
            this.instance.getIsScanning(),
            'scanForPeripherals should set noble.isScanning to true!'
        )
    }

    @test()
    protected static async scanForPeripheralsCallsStartScanningAsync() {
        await this.scanForPeripherals()

        assert.isTrue(
            this.noble.didCallStartScanningAsync,
            'scanForPeripherals should call noble.startScanningAsync!'
        )

        const { uuids, allowDuplicates } =
            this.noble.callsToStartScanningAsync[0]

        assert.isEqualDeep(
            uuids,
            [],
            'scanForPeripherals should pass an empty array to noble.startScanningAsync!'
        )

        assert.isEqual(
            allowDuplicates,
            false,
            'scanForPeripherals should pass false for allowDuplicates to noble.startScanningAsync!'
        )
    }

    @test()
    protected static async scanForPeripheralsSetsIsScanningFalseOnceAllUuidsAreFound() {
        await this.scanForPeripherals()

        assert.isFalse(
            this.instance.getIsScanning(),
            'scanForPeripherals should set noble.isScanning to false once all uuids are found!'
        )
    }

    @test()
    protected static async scanForPeripheralsReturnsPeripherals() {
        const peripherals = await this.scanForPeripherals()

        assert.isLength(
            peripherals,
            1,
            'scanForPeripherals should return peripherals!\n'
        )

        assert.isEqualDeep(
            peripherals,
            this.noble.fakedPeripherals,
            'scanForPeripherals should return the faked peripherals!\n'
        )
    }

    @test()
    protected static async scanForPeripheralsCallsStopScanningWhenDone() {
        await this.scanForPeripherals()

        assert.isTrue(
            this.noble.didCallStopScanningAsync,
            'scanForPeripherals should call noble.stopScanningAsync once all uuids are found!'
        )
    }

    private static setupFakeNoble() {
        this.noble = this.FakeNoble()
        this.noble.fakePeripherals([this.uuid])
        BleScannerImpl.noble = this.noble as unknown as typeof noble
    }

    private static FakeNoble() {
        return new FakeNoble()
    }

    private static async scanForPeripherals(uuids?: string[]) {
        return await this.instance.scanForPeripherals(uuids ?? [this.uuid])
    }

    private static BleScanner() {
        return BleScannerImpl.Create() as SpyBleScanner
    }
}
