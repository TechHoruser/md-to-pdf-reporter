const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { generateReportFromReadme } = require('./lib/reportGenerator');

const [arg1, arg2] = process.argv.slice(2);
const templateName = arg2 ? arg1 : 'base_report';
const targetParam = arg2 || arg1;

if (targetParam) {
    const isFile = fs.existsSync(targetParam) && fs.statSync(targetParam).isFile();
    const folderPath = isFile ? path.dirname(targetParam) : targetParam;
    
    let filesToProcess = [];
    if (isFile) {
        filesToProcess.push(path.basename(targetParam));
    } else {
        filesToProcess = fs.readdirSync(folderPath).filter(f => f.startsWith('README') && f.endsWith('.md'));
    }

    if (filesToProcess.length === 0) {
        console.error(`No README.md files found in ${folderPath}`);
        process.exit(1);
    }

    (async () => {
        try {
            console.log(`Found ${filesToProcess.length} file(s) to process in ${folderPath}`);
            const browser = await puppeteer.launch({ headless: 'new' });
            for (const file of filesToProcess) {
                const readmePath = path.join(folderPath, file);
                const langMatch = file.match(/README(?:_(.+))?\.md/);
                const lang = langMatch && langMatch[1] ? langMatch[1] : 'en';
                try {
                    const { outputPath } = await generateReportFromReadme({
                        readmePath,
                        templateName,
                        lang,
                        browserInstance: browser
                    });
                    console.log(`Successfully converted to ${outputPath}`);
                } catch (e) {
                    console.error(`Error generating report for ${file}:`, e);
                }
            }
            await browser.close();
        } catch (e) {
            console.error("Fatal Error:", e);
            process.exit(1);
        }
    })();
} else {
    console.log("Usage: node doc.js [template_name] <path_to_folder_or_readme>");
}
