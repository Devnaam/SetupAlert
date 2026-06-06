const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
        .replace(/SetupAlert/g, 'SetupAlert')
        .replace(/setupalert/g, 'setupalert')
        .replace(/SETUPALERT/g, 'SETUPALERT');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file.endsWith('.png') || file.endsWith('.ico') || file.endsWith('.mp3') || file === 'package-lock.json') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            walk(file);
        } else {
            replaceInFile(file);
        }
    });
}

walk('.');
console.log('Done replacing.');
