import AbstractSpruceTest, {
    test,
    assert,
    generateId,
    errorAssert,
} from '@sprucelabs/test-utils'
import noble from '@abandonware/noble'
import BleScannerImpl, { ScanOptions } from '../BleScanner'
import FakeNoble from '../testDoubles/FakeNoble'
import SpyBleScanner from '../testDoubles/SpyBleScanner'

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
    protected static async createSetsUpOnDiscoverForNoble() {
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
    protected static async scanSetsIsScanningTrue() {
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
    protected static async scanCallsStartScanningAsync() {
        await this.scanForPeripherals()

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
    protected static async scanSetsIsScanningFalseOnceAllUuidsFound() {
        await this.scanForPeripherals()

        assert.isFalse(
            this.instance.getIsScanning(),
            'scanForPeripherals should set noble.isScanning to false once all uuids are found!'
        )
    }

    @test()
    protected static async scanReturnsPeripherals() {
        const peripherals = await this.scanForPeripherals()

        assert.isEqualDeep(
            peripherals,
            this.noble.fakedPeripherals,
            'scanForPeripherals should return the faked peripherals!\n'
        )
    }

    @test()
    protected static async scanCallsStopScanningWhenDone() {
        await this.scanForPeripherals()

        assert.isTrue(
            this.noble.didCallStopScanningAsync,
            'scanForPeripherals should call noble.stopScanningAsync once all uuids are found!'
        )
    }

    @test()
    protected static async scanForPeripheralTakesUuidAndReturnsPeripheral() {
        const peripheral = await this.scanForPeripheral(this.uuid)

        assert.isFalse(
            peripheral instanceof Array,
            'scanForPeripherals should return a single peripheral when passed a string uuid!'
        )
    }

    @test()
    protected static async scanForPeripheralAcceptsOptionalTimeoutMs() {
        const timeoutMs = 10
        const invalidUuid = generateId()

        const err = await assert.doesThrowAsync(
            async () => await this.scanForPeripheral(invalidUuid, { timeoutMs })
        )

        errorAssert.assertError(err, 'SCAN_TIMED_OUT', {
            uuids: [invalidUuid],
            timeoutMs,
        })
    }

    private static setupFakeNoble() {
        this.noble = this.FakeNoble()
        this.fakePeripherals()
        BleScannerImpl.noble = this.noble as unknown as typeof noble
    }

    private static fakePeripherals(uuids = this.uuids) {
        this.noble.fakePeripherals(uuids)
    }

    private static async scanForPeripheral(
        uuid = this.uuid,
        options?: ScanOptions
    ) {
        return await this.instance.scanForPeripheral(uuid, options)
    }

    private static async scanForPeripherals(
        uuids = this.uuids,
        options?: ScanOptions
    ) {
        return await this.instance.scanForPeripherals(uuids, options)
    }

    private static get uuids() {
        return [this.uuid]
    }

    private static FakeNoble() {
        return new FakeNoble()
    }

    private static BleScanner() {
        return BleScannerImpl.Create() as SpyBleScanner
    }
}
