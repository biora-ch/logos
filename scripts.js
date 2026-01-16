const canvas = document.getElementById('logoCanvas');
const ctx = canvas.getContext('2d');

const baseImageSrc = 'BlankTemplate_4.png';
const blackTemplateSrc = 'BlankTemplate_2.png';
const whiteTemplateSrc = 'BlankTemplate_3.png';
const boldFontSrc = 'FFQuadraatSansProBold.otf';
const regularFontSrc = 'QuadraatSansRegular.ttf';

// Update canvas dimensions
canvas.width = 3000;
canvas.height = 822;

// Load fonts
const loadFont = (name, url) => {
    const font = new FontFace(name, `url(${url})`);
    return font.load().then(loadedFont => {
        document.fonts.add(loadedFont);
        return loadedFont;
    });
};

Promise.all([
    loadFont('FFQuadraatSansProBold', boldFontSrc),
    loadFont('QuadraatSansRegular', regularFontSrc),
    loadImage(baseImageSrc)
]).then(([boldFont, regularFont, baseImage]) => {
    window.baseImage = baseImage;
    updatePreview();
});

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function updatePreview() {
    const irishText = document.getElementById('irishText').value;
    const secondText = document.getElementById('secondText').value;
    const charLimit = parseInt(document.getElementById('charLimit').value, 10);

    const irishTextY1 = parseInt(document.getElementById('irishTextY2').value, 10); // Swapped
    const irishTextY2 = parseInt(document.getElementById('irishTextY1').value, 10); // Swapped

    const secondTextY1 = parseInt(document.getElementById('secondTextY1').value, 10);
    const secondTextY2 = parseInt(document.getElementById('secondTextY2').value, 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(window.baseImage, 0, 0, canvas.width, canvas.height);

    drawText(irishText, 'FFQuadraatSansProBold', '#004D44', 825, 379, charLimit, true, irishTextY1, irishTextY2);
    drawText(secondText, 'QuadraatSansRegular', '#004D44', 825, 543, charLimit, false, secondTextY1, secondTextY2);
}

function drawText(text, font, color, x, y, charLimit, isBold, y1, y2) {
    ctx.font = `165px ${font}`;
    ctx.fillStyle = color;

    if (text.length > charLimit) {
        let firstLine = '';
        let secondLine = '';
        const words = text.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (firstLine.length + words[i].length + 1 <= charLimit) {
                firstLine += words[i] + ' ';
            } else {
                secondLine = words.slice(i).join(' ');
                break;
            }
        }

        ctx.fillText(firstLine.trim(), x, y1);
        ctx.fillText(secondLine.trim(), x, y2);
    } else {
        ctx.fillText(text, x, y);
    }
}

function saveImage(variant) {
    let templateSrc;
    let textColor;

    switch (variant) {
        case 'custom':
            templateSrc = window.__customTemplateUrl || baseImageSrc;
            textColor = document.getElementById('customTextColor')?.value || '#004D44';
            break;
        case 'black':
            templateSrc = blackTemplateSrc;
            textColor = '#000000';
            break;
        case 'white':
            templateSrc = whiteTemplateSrc;
            textColor = '#FFFFFF';
            break;
        case 'standard':
        default:
            templateSrc = baseImageSrc;
            textColor = '#004D44';
            break;
    }

    loadImage(templateSrc).then(templateImage => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

        const irishText = document.getElementById('irishText').value;
        const secondText = document.getElementById('secondText').value;
        const charLimit = parseInt(document.getElementById('charLimit').value, 10);

        const irishTextY1 = parseInt(document.getElementById('irishTextY2').value, 10); // Swapped
        const irishTextY2 = parseInt(document.getElementById('irishTextY1').value, 10); // Swapped

        const secondTextY1 = parseInt(document.getElementById('secondTextY1').value, 10);
        const secondTextY2 = parseInt(document.getElementById('secondTextY2').value, 10);

        drawText(irishText, 'FFQuadraatSansProBold', textColor, 825, 379, charLimit, true, irishTextY1, irishTextY2);
        drawText(secondText, 'QuadraatSansRegular', textColor, 825, 543, charLimit, false, secondTextY1, secondTextY2);

        const link = document.createElement('a');
        link.download = `logo_${variant}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    closeSaveImageModal();
}

function showSaveImageModal() {
    document.getElementById('saveImageModal').classList.remove('hidden');
    document.getElementById('saveImageModal').style.display = 'flex';
}

function closeSaveImageModal() {
    document.getElementById('saveImageModal').classList.add('hidden');
    document.getElementById('saveImageModal').style.display = 'none';
}

function toggleAdditionalSettings() {
    const additionalSettings = document.getElementById('additionalSettings');
    additionalSettings.classList.toggle('hidden');
}

function updateCharLimitValue() {
    const charLimit = document.getElementById('charLimit').value;
    document.getElementById('charLimitValue').textContent = charLimit;
}