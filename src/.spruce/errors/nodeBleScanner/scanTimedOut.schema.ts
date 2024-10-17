import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const scanTimedOutSchema: SpruceErrors.NodeBleScanner.ScanTimedOutSchema  = {
	id: 'scanTimedOut',
	namespace: 'NodeBleScanner',
	name: 'SCAN_TIMED_OUT',
	    fields: {
	            /** . */
	            'timeoutMs': {
	                type: 'number',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'uuids': {
	                type: 'text',
	                isRequired: true,
	                isArray: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(scanTimedOutSchema)

export default scanTimedOutSchema
