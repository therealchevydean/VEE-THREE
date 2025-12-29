
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const logPath = path.resolve(__dirname, '../env-debug.log');
const log: string[] = [];

function logMsg(msg: string) {
    console.log(msg);
    log.push(msg);
}

logMsg('--- DIAGNOSTIC START ---');
const backendEnvPath = path.resolve(__dirname, '../.env');
logMsg(`Expected .env Path: ${backendEnvPath}`);
logMsg(`File Exists?: ${fs.existsSync(backendEnvPath)}`);

if (fs.existsSync(backendEnvPath)) {
    // Attempt load
    const result = dotenv.config({ path: backendEnvPath });
    if (result.error) {
        logMsg(`Error loading .env: ${JSON.stringify(result.error)}`);
    } else {
        logMsg('Successfully parsed .env');
        const keys = Object.keys(result.parsed || {});
        logMsg(`Keys found: ${keys.join(', ')}`);

        const credsVar = result.parsed?.['GOOGLE_APPLICATION_CREDENTIALS'];
        logMsg(`Raw GOOGLE_APPLICATION_CREDENTIALS value in file: '${credsVar}'`);
    }
} else {
    logMsg('CRITICAL: .env file NOT found at expected path.');
}

logMsg(`Process Env Value (Final): '${process.env.GOOGLE_APPLICATION_CREDENTIALS}'`);
logMsg('--- DIAGNOSTIC END ---');

fs.writeFileSync(logPath, log.join('\n'));
