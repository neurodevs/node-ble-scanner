import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import BleScannerImpl, { BleScanner } from './BleScanner'

export default class BleScannerTest extends AbstractSpruceTest {
    private static instance: BleScanner

    protected static async beforeEach() {
        await super.beforeEach()
        this.instance = this.BleScanner()
    }

    @test()
    protected static async canCreateBleScanner() {
        assert.isTruthy(this.instance)
    }

    private static BleScanner() {
        return BleScannerImpl.Create()
    }
}
