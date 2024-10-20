import AbstractSpruceTest, {
    test,
    assert,
    generateId,
    errorAssert,
} from '@sprucelabs/test-utils'
import noble from '@abandonware/noble'
import BleScannerImpl, { BleScannerOptions, ScanOptions } from '../BleScanner'
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
    protected static async throwsIfScanTimesOut() {
        const invalidUuid = generateId()

        const err = await assert.doesThrowAsync(
            async () =>
                await this.scanForPeripheral(invalidUuid, {
                    timeoutMs: this.timeoutMs,
                })
        )

        errorAssert.assertError(err, 'SCAN_TIMED_OUT', {
            uuids: [invalidUuid],
            timeoutMs: this.timeoutMs,
        })
    }

    @test()
    protected static async createAcceptsOptionalDefaultTimeoutMs() {
        const instance = this.BleScanner({ defaultTimeoutMs: this.timeoutMs })
        const timeoutMs = instance.getTimeoutMs()
        assert.isEqual(timeoutMs, this.timeoutMs)
    }

    @test()
    protected static async canStopScanningEarly() {
        void this.scanForPeripherals()
        await this.wait(1)

        await this.stopScanning()

        assert.isFalse(
            this.instance.getIsScanning(),
            'stopScanning should set noble.isScanning to false!'
        )
    }

    @test()
    protected static async callingTwiceClearsPeripherals() {
        await this.scanForPeripherals()
        const peripherals = await this.scanForPeripherals()
        assert.isEqual(peripherals.length, 1, 'Should have found 1 peripheral!')
    }

    @test()
    protected static async canScanForAllPeripherals() {
        const peripherals = await this.scanAll()

        assert.isEqualDeep(
            peripherals,
            this.noble.fakedPeripherals,
            'scanAll should return all faked peripherals!'
        )
    }

    @test()
    protected static async canScanForPeripheralByName() {
        const name = 'Fake Device'
        const peripheral = await this.scanForName(name)

        assert.isEqualDeep(
            peripheral,
            this.noble.fakedPeripherals[0],
            'scanForPeripherals should return the faked peripherals!'
        )
    }

    @test()
    protected static async canScanForPeripheralsByNames() {
        const peripherals = await this.scanForNames(['Fake Device'])

        assert.isEqualDeep(
            peripherals,
            this.noble.fakedPeripherals,
            'scanForPeripherals should return the faked peripherals!'
        )
    }

    private static setupFakeNoble() {
        this.noble = this.FakeNoble()
        this.fakePeripherals()
        BleScannerImpl.noble = this.noble as unknown as typeof noble
    }

    private static fakePeripherals(uuids = this.uuids) {
        this.noble.fakePeripherals(uuids)
    }

    private static async scanAll() {
        return await this.instance.scanAll()
    }

    private static async scanForPeripheral(
        uuid = this.uuid,
        options?: ScanOptions
    ) {
        return await this.instance.scanForUuid(uuid, options)
    }

    private static async scanForPeripherals(
        uuids = this.uuids,
        options?: ScanOptions
    ) {
        return await this.instance.scanForUuids(uuids, options)
    }

    private static async scanForName(name: string) {
        return await this.instance.scanForName(name)
    }

    private static async scanForNames(names: string[]) {
        return await this.instance.scanForNames(names)
    }

    private static async stopScanning() {
        await this.instance.stopScanning()
    }

    private static get uuids() {
        return [this.uuid]
    }

    private static readonly timeoutMs = 10

    private static FakeNoble() {
        return new FakeNoble()
    }

    private static BleScanner(options?: BleScannerOptions) {
        return BleScannerImpl.Create(options) as SpyBleScanner
    }
}
