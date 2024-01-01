import { type ScriptInput } from "../../../db/lib";

/**
 * This procedure is meant to be called from the database scripts and will insert habitat data. Such as files and
 * database records that should always exist in your app - or files that don't change much. For example, we don't
 * need to reupload a large set of files evertime we replant the seed info.
 */
export async function up({}: ScriptInput) {}

/**
 * This procedure is meant to be called from the database scripts and will delete habitat data.
 */
export async function down({}: ScriptInput) {}
