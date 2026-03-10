const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

function zipFunction(name) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(path.join(__dirname, `${name}.zip`));
        const archive = archiver('zip');

        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);
        archive.file(`functions/${name}.js`, { name: `${name}.js` });
        archive.directory('node_modules', 'node_modules');
        archive.finalize();
    });
}

async function main() {
    console.log('Zipping uploadS3...');
    await zipFunction('uploadS3');
    console.log('Zipping processS3...');
    await zipFunction('processS3');
    console.log('Done!');
}

main();