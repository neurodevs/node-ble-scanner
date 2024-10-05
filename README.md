# node-ble-scanner
Scan for Bluetooth Low Energy (BLE) peripherals

## Installation

Install the package using npm:

```bash
npm install @neurodevs/node-ble-scanner
```

Or yarn:

```bash
yarn add @neurodevs/node-ble-scanner
```

## Usage

### Basic Usage

To scan for specific BLE peripherals by their uuids:

```typescript
import { BleScannerImpl } from '@neurodevs/node-ble-scanner'

async function discoverPeripherals() {
    const uuids = ['uuid-for-your-bluetooth-peripheral']

    const scanner = BleScannerImpl.Create()
    const peripherals = await scanner.scanForPeripherals(uuids)

    console.log('Discovered Peripherals:', peripherals)
}
```

## Testing

For testing, you can replace the `BleScannerImpl` class with test doubles:

```typescript
import {
  BleScannerImpl,
  FakeBleScanner,
  SpyBleScanner
} from '@neurodevs/node-ble-scanner'

// Use for a fake implementation with validations for user interactions
BleScannerImpl.Class = FakeBleScanner

// Use to test real behavior with enhanced internal visibility
BleScannerImpl.Class = SpyBleScanner

const scanner = BleScannerImpl.Create()
```

If you use the `SpyBleScanner` test double (or any other test double you create which extends `BleScannerImpl`), then it will use the real `noble` library unless otherwise set, which is an open-source package that manages the undlying Bluetooth connection.

You can also fake `noble` so that you do not require actual BLE hardware in your tests:

```typescript
import {
    BleScannerImpl,
    FakeNoble,
} from '@neurodevs/node-ble-scanner'

BleScannerImpl.noble = new FakeNoble()

const scanner = BleScannerImpl.Create()
```
