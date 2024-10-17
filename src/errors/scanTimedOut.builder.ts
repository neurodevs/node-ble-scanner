import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'scanTimedOut',
    name: 'SCAN_TIMED_OUT',
    fields: {
        timeoutMs: {
            type: 'number',
            isRequired: true,
        },
        uuids: {
            type: 'text',
            isRequired: true,
            isArray: true,
        },
    },
})
