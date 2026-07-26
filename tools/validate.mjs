// validate.mjs — CLI wrapper around validateGraph(). Fail-closed: errors exit non-zero.
// Run: node tools/validate.mjs instances/ostrander-enclave.json
import { load, validateGraph } from './lib.mjs';

const path = process.argv[2];
if (!path) { console.error('usage: node tools/validate.mjs <instance.json>'); process.exit(2); }

const db = load(path);
const { errors, warnings } = validateGraph(db);
const T = db.instance.tenant;

console.log(`VALIDATE  ${db.instance.instance} (${T.enclave_profile}, target ${T.target_level} @ Class ${T.target_class})`);
for (const w of warnings) console.log(`  WARN  [${w.code}] ${w.msg}`);
for (const e of errors) console.error(`  ERROR [${e.code}] ${e.msg}`);
console.log(`\n${errors.length ? 'INVALID' : 'VALID'} — ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
