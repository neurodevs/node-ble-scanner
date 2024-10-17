import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'





export declare namespace SpruceErrors.NodeBleScanner {

	
	export interface ScanTimedOut {
		
			
			'timeoutMs': number
			
			'uuids': string[]
	}

	export interface ScanTimedOutSchema extends SpruceSchema.Schema {
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

	export type ScanTimedOutEntity = SchemaEntity<SpruceErrors.NodeBleScanner.ScanTimedOutSchema>

}




