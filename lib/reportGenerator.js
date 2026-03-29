const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
// Load puppeteer lazily inside functions to avoid bundling it at build time
let puppeteer;

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function highlightBash(code) {
    let highlighted = code;

    highlighted = highlighted.replace(/(^|\n)(\s*)(curl)(\b)/g, '$1$2<span class="tok-command">$3</span>$4');
    highlighted = highlighted.replace(/(^|\s)(-{1,2}[a-zA-Z][a-zA-Z0-9-]*)/g, '$1<span class="tok-option">$2</span>');
    highlighted = highlighted.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, "<span class=\"tok-string\">'$1'</span>");
    highlighted = highlighted.replace(/\bhttps?:\/\/[^\s'\"]+/g, '<span class="tok-url">$&</span>');

    return highlighted;
}

function generateTOC(tokens) {
    let tocHtml = '<div class="toc" id="summary"><h1>Summary</h1><ul>';
    const headings = tokens.filter((t) => t.type === 'heading' && t.depth <= 3);

    headings.forEach((h) => {
        const id = h.text.toLowerCase().replace(/[^\w]+/g, '-');
        tocHtml += `<li class="toc-level-${h.depth}"><a href="#${id}">${h.text}</a></li>`;
    });

    tocHtml += '</ul></div>';
    return tocHtml;
}

function buildRenderer() {
    const renderer = new marked.Renderer();

    renderer.heading = function ({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    };

    renderer.code = function ({ text, lang }) {
        const rawLang = lang || '';
        const language = rawLang.toLowerCase();
        const escapedCode = escapeHtml(text || '');

        if (language.startsWith('chart-')) {
            const type = rawLang.substring(6);
            try {
                const chartData = JSON.parse(text);
                const chartId = 'chart-' + Math.random().toString(36).slice(2, 11);
                const config = {
                    type,
                    data: chartData.data ? chartData.data : chartData,
                    options: chartData.options || {}
                };

                if (config.options.animation === undefined) {
                    config.options.animation = false;
                }
                if (config.options.responsive === undefined) {
                    config.options.responsive = true;
                }
                if (config.options.maintainAspectRatio === undefined) {
                    config.options.maintainAspectRatio = false;
                }

                return `
<div class="chart-container" style="position: relative; height:400px; width:100%; margin: 20px auto; page-break-inside: avoid;">
    <canvas id="${chartId}"></canvas>
</div>
<script>
    window.chartInitQueue = window.chartInitQueue || [];
    window.chartInitQueue.push(function() {
        try {
            const ctx = document.getElementById('${chartId}').getContext('2d');
            new Chart(ctx, ${JSON.stringify(config)});
        } catch (err) {
            console.error('Error initializing chart ${chartId}:', err);
        }
    });
</script>
`;
            } catch (error) {
                return `<pre style="color:red; border:1px solid red; padding:10px;">Error parsing chart JSON: ${error.message}</pre><pre><code>${escapedCode}</code></pre>\n`;
            }
        }

        if (['bash', 'sh', 'shell', 'zsh'].includes(language)) {
            const highlighted = highlightBash(escapedCode);
            return `<pre><code class="language-${language}">${highlighted}</code></pre>\n`;
        }

        if (language) {
            return `<pre><code class="language-${language}">${escapedCode}</code></pre>\n`;
        }

        return `<pre><code>${escapedCode}</code></pre>\n`;
    };

    return renderer;
}

function applyColorOverrides(template, colors = {}) {
    const resolvedColors = {
        mainColor: colors.mainColor || '#5F6B7A',
        secondaryColor: colors.secondaryColor || '#64748B',
        bgDarkObsidian: colors.bgDarkObsidian || '#111827',
        bgDarkGray: colors.bgDarkGray || '#374151',
        bgMediumGray: colors.bgMediumGray || '#6B7280',
        bgLightGray: colors.bgLightGray || '#E5E7EB'
    };

    const override = `
<style>
:root {
    --main-color: ${resolvedColors.mainColor};
    --secondary-color: ${resolvedColors.secondaryColor};
    --main-gradient: linear-gradient(90deg, ${resolvedColors.mainColor} 0%, ${resolvedColors.secondaryColor} 100%);
    --bg-dark-obsidian: ${resolvedColors.bgDarkObsidian};
    --bg-dark-gray: ${resolvedColors.bgDarkGray};
    --bg-medium-gray: ${resolvedColors.bgMediumGray};
    --bg-light-gray: ${resolvedColors.bgLightGray};
}
</style>
`;

    if (template.includes('</head>')) {
        return template.replace('</head>', `${override}</head>`);
    }

    return `${override}${template}`;
}

function absolutizeAssetPaths(bodyHtml, basePath) {
    if (!basePath) {
        return bodyHtml;
    }

    return bodyHtml.replace(/src="(assets\/[^"]+)"/g, (match, relativePath) => {
        const absolute = path.join(basePath, relativePath);
        return `src="file://${absolute}"`;
    });
}

function resolveTemplatePath(workspaceRoot, templateName) {
    const candidate = path.join(workspaceRoot, templateName, 'template.html');
    if (fs.existsSync(candidate)) {
        return candidate;
    }

    const fallback = path.join(workspaceRoot, 'base_report', 'template.html');
    if (fs.existsSync(fallback)) {
        return fallback;
    }

    throw new Error('No template.html found in template directory nor base_report/template.html');
}

function resolveWorkspaceRoot() {
    const candidates = [
        process.cwd(),
        path.resolve(process.cwd(), '..'),
        path.resolve(__dirname, '..'),
        path.resolve(__dirname, '../..')
    ];

    for (const candidate of candidates) {
        const hasBaseTemplate = fs.existsSync(path.join(candidate, 'base_report', 'template.html'));
        if (hasBaseTemplate) {
            return candidate;
        }
    }

    throw new Error('Unable to resolve workspace root containing base_report/template.html');
}

function resolveImageAsBase64(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return '';
    }

    return 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
}

async function renderPdfBuffer({
    markdownContent,
    metadata,
    templateHtml,
    coverBase64,
    logoBase64,
    colors,
    basePath,
    browserInstance,
    outputPath
}) {
    const renderer = buildRenderer();
    const lexer = new marked.Lexer();
    const tokens = lexer.lex(markdownContent);
    const tocHtml = generateTOC(tokens);

    marked.setOptions({ renderer });
    let bodyHtml = marked.parse(markdownContent);
    bodyHtml = bodyHtml.replace(/<p>\s*\/new-page\s*<\/p>/g, '<div style="page-break-after: always;"></div>');

    if (bodyHtml.includes('window.chartInitQueue')) {
        bodyHtml += `
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
if (window.chartInitQueue) {
    window.chartInitQueue.forEach(fn => fn());
}
</script>
`;
    }

    const finalTemplate = applyColorOverrides(templateHtml, colors);
    const finalHtml = finalTemplate
        .replace('{{title}}', String(metadata.title || 'Report Document'))
        .replace('{{author}}', String(metadata.author || 'Author'))
        .replace('{{company}}', String(metadata.company || 'Company'))
        .replace('{{date}}', String(metadata.date || new Date().toISOString().split('T')[0]))
        .replace('{{version}}', String(metadata.version || '1.0'))
        .replace('{{toc}}', tocHtml)
        .replace('{{coverBase64}}', coverBase64 || '')
        .replace('{{content}}', absolutizeAssetPaths(bodyHtml, basePath));

    let browser = browserInstance;
    let ownBrowser = false;
    if (!browser) {
        if (!puppeteer) {
            // require at runtime to avoid importing native/browser binaries during build
            // where they may not be available (e.g., Vercel build step)
            // eslint-disable-next-line global-require
            puppeteer = require('puppeteer');
        }
        browser = await puppeteer.launch({ headless: 'new' });
        ownBrowser = true;
    }

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    const headerTemplate = `
        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin:0 50px; padding:0; font-family: 'Poppins', sans-serif;">
            <div style="font-size:10px; color:#666;"></div>
            ${logoBase64 ? `<img src="${logoBase64}" style="height:24px;" alt="Logo" />` : ''}
        </div>`;

    const pdfBuffer = await page.pdf({
        path: outputPath,
        preferCSSPageSize: true,
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: headerTemplate,
        footerTemplate: `
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin:0 50px; font-family: 'Poppins', sans-serif; font-size:10px; color:#666;">
                <div style="text-align:left;">CONTENT. Confidential material for restricted use</div>
                <div style="text-align:right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            </div>`
    });

    await page.close();
    if (ownBrowser) {
        await browser.close();
    }

    return Buffer.from(pdfBuffer);
}

async function generateReportFromReadme({ readmePath, templateName = 'base_report', lang = 'en', browserInstance }) {
    if (!fs.existsSync(readmePath)) {
        throw new Error(`README not found at ${readmePath}`);
    }

    const fileContent = fs.readFileSync(readmePath, 'utf-8');
    const parsed = matter(fileContent);
    const { data, content } = parsed;

    const folderPath = path.dirname(readmePath);
    const workspaceRoot = resolveWorkspaceRoot();

    const title = data.title || process.env.REPORT_TITLE || 'Report Document';
    const author = data.author || process.env.REPORT_AUTHOR || 'Author';
    const company = data.company || process.env.REPORT_COMPANY || 'Company';
    const date = data.date || process.env.REPORT_DATE || new Date().toISOString().split('T')[0];
    const version = data.version || process.env.REPORT_VERSION || '1.0';

    const sanitizedTitle = String(title).trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    const sanitizedVersion = String(version).trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
    const pdfName = `${sanitizedTitle}_${sanitizedVersion}_${lang}.pdf`;
    const outputPath = path.join(folderPath, pdfName);

    const templatePath = resolveTemplatePath(workspaceRoot, templateName);
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');

    const coverBase64 = resolveImageAsBase64(path.join(workspaceRoot, templateName, 'cover.png'));
    const logoBase64 = resolveImageAsBase64(path.join(workspaceRoot, templateName, 'header.png'));

    const buffer = await renderPdfBuffer({
        markdownContent: content,
        metadata: { title, author, company, date, version },
        templateHtml,
        coverBase64,
        logoBase64,
        basePath: folderPath,
        browserInstance,
        outputPath
    });

    return { buffer, outputPath };
}

async function generateReportFromMarkdown({
    markdown,
    author,
    company,
    templateName = 'base_report',
    version = '1.0',
    title = 'Live Preview',
    date = new Date().toISOString().split('T')[0]
}) {
    const workspaceRoot = resolveWorkspaceRoot();
    const templatePath = resolveTemplatePath(workspaceRoot, templateName);
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');

    const fallbackCover = resolveImageAsBase64(path.join(workspaceRoot, 'front', 'cover.png'));
    const fallbackHeader = resolveImageAsBase64(path.join(workspaceRoot, 'front', 'header.png'));

    return renderPdfBuffer({
        markdownContent: markdown,
        metadata: {
            title,
            author: author?.name || 'Author',
            company: company?.name || 'Company',
            date,
            version
        },
        templateHtml,
        coverBase64: company?.images?.cover || fallbackCover,
        logoBase64: company?.images?.header || fallbackHeader,
        colors: company?.colors,
        basePath: workspaceRoot
    });
}

module.exports = {
    generateReportFromReadme,
    generateReportFromMarkdown
};
