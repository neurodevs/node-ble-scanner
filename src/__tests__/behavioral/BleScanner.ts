export default class BleScannerImpl implements BleScanner {
    public static Class?: BleScannerConstructor

    protected constructor() {}

    public static Create() {
        return new (this.Class ?? this)()
    }
}

export interface BleScanner {}

export type BleScannerConstructor = new () => BleScanner
