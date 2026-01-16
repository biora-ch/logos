
/*
  UI layer only.
  NOTE: scripts.js image creation functions are intentionally untouched.
*/

const PRESET_MAP = {
  taoiseach: { ga: "An Roinn Taoisigh", en: "Department of the Taoiseach" },
  finance:   { ga: "An Roinn Airgeadais", en: "Department of Finance" },
  health:    { ga: "An Roinn Sláinte", en: "Department of Health" },
  justice:   { ga: "An Roinn Dlí agus Cirt", en: "Department of Justice" },
  education: { ga: "An Roinn Oideachais agus Óige", en: "Department of Education and Youth" },
  housing:   { ga: "An Roinn Tithíochta, Rialtais Áitiúil agus Oidhreachta", en: "Department of Housing, Local Government and Heritage" },
  transport: { ga: "An Roinn Iompair", en: "Department of Transport" },
  agri:      { ga: "An Roinn Talmhaíochta, Bia agus Mara", en: "Department of Agriculture, Food and the Marine" },
  foreign:   { ga: "An Roinn Gnóthaí Eachtracha agus Trádála", en: "Department of Foreign Affairs and Trade" },
  social:    { ga: "An Roinn Coimirce Sóisialaí", en: "Department of Social Protection" }
};

function applyPreset(key) {
  if (!key || !PRESET_MAP[key]) return;
  const p = PRESET_MAP[key];
  document.getElementById("irishText").value = p.ga;
  document.getElementById("secondText").value = p.en;
  handleInputChange();

  // keep dropdown in sync if clicked via chip
  const sel = document.getElementById("presetSelect");
  if (sel && sel.value !== key) sel.value = key;
}

function handleInputChange() {
  // Call original generator (unchanged)
  if (typeof updatePreview === "function") updatePreview();

  // Render multi-style previews (UI only)
  renderAllPreviews();
}

function getCurrentInputs() {
  const irishText = document.getElementById('irishText').value || "";
  const secondText = document.getElementById('secondText').value || "";
  const charLimit = parseInt(document.getElementById('charLimit').value, 10);

  // Match the original swapped Y behaviour
  const irishTextY1 = parseInt(document.getElementById('irishTextY2').value, 10);
  const irishTextY2 = parseInt(document.getElementById('irishTextY1').value, 10);
  const secondTextY1 = parseInt(document.getElementById('secondTextY1').value, 10);
  const secondTextY2 = parseInt(document.getElementById('secondTextY2').value, 10);

  return { irishText, secondText, charLimit, irishTextY1, irishTextY2, secondTextY1, secondTextY2 };
}

function drawTextWithCtx(ctx2, text, font, color, x, y, charLimit, y1, y2) {
  ctx2.font = `165px ${font}`;
  ctx2.fillStyle = color;

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
    ctx2.fillText(firstLine.trim(), x, y1);
    ctx2.fillText(secondLine.trim(), x, y2);
  } else {
    ctx2.fillText(text, x, y);
  }
}

function variantConfig(variant) {
  let templateSrc;
  let textColor;

  switch (variant) {
    case 'custom':
      // Provided by the user via <input type="file">.
      templateSrc = window.__customTemplateUrl || ((typeof baseImageSrc !== "undefined") ? baseImageSrc : 'BlankTemplate_4.png');
      textColor = (document.getElementById('customTextColor')?.value) || '#004D44';
      break;
    case 'black':
      templateSrc = (typeof blackTemplateSrc !== "undefined") ? blackTemplateSrc : 'BlankTemplate_2.png';
      textColor = '#000000';
      break;
    case 'white':
      templateSrc = (typeof whiteTemplateSrc !== "undefined") ? whiteTemplateSrc : 'BlankTemplate_3.png';
      textColor = '#FFFFFF';
      break;
    case 'standard':
    default:
      templateSrc = (typeof baseImageSrc !== "undefined") ? baseImageSrc : 'BlankTemplate_4.png';
      textColor = '#004D44';
      break;
  }

  return { templateSrc, textColor };
}

function handleCustomTemplateFile(file) {
  if (!file) return;
  // Revoke old object URL to avoid leaking.
  if (window.__customTemplateUrl) {
    try { URL.revokeObjectURL(window.__customTemplateUrl); } catch (_) {}
  }
  window.__customTemplateUrl = URL.createObjectURL(file);

  // Warm the cache so preview/download is instant.
  if (typeof loadImage === 'function') {
    loadImage(window.__customTemplateUrl)
      .then((img) => { window.__customTemplateImage = img; handleInputChange(); })
      .catch(() => { /* Silent */ });
  } else {
    handleInputChange();
  }
}

function clearCustomTemplate() {
  if (window.__customTemplateUrl) {
    try { URL.revokeObjectURL(window.__customTemplateUrl); } catch (_) {}
  }
  window.__customTemplateUrl = null;
  window.__customTemplateImage = null;
  const f = document.getElementById('customTemplateFile');
  if (f) f.value = '';
  handleInputChange();
}

async function renderVariantPreview(variant, targetCanvas) {
  if (!targetCanvas) return;

  const { templateSrc, textColor } = variantConfig(variant);
  if (typeof loadImage !== "function") return;

  const templateImage = await loadImage(templateSrc);

  // Render at full fidelity on an offscreen canvas, then scale down to preview
  const off = document.createElement('canvas');
  off.width = 3000;
  off.height = 822;
  const offCtx = off.getContext('2d');

  offCtx.clearRect(0, 0, off.width, off.height);
  offCtx.drawImage(templateImage, 0, 0, off.width, off.height);

  const v = getCurrentInputs();
  drawTextWithCtx(offCtx, v.irishText, 'FFQuadraatSansProBold', textColor, 825, 379, v.charLimit, v.irishTextY1, v.irishTextY2);
  drawTextWithCtx(offCtx, v.secondText, 'QuadraatSansRegular', textColor, 825, 543, v.charLimit, v.secondTextY1, v.secondTextY2);

  const tctx = targetCanvas.getContext('2d');
  tctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  tctx.drawImage(off, 0, 0, targetCanvas.width, targetCanvas.height);
}

let __renderToken = 0;

function renderAllPreviews() {
  const token = ++__renderToken;

  const c1 = document.getElementById('previewStandard');
  const c2 = document.getElementById('previewBlack');
  const c3 = document.getElementById('previewWhite');
  const c4 = document.getElementById('previewCustom');

  // Sequential rendering avoids concurrent font/image reflows.
  (async () => {
    try {
      await renderVariantPreview('standard', c1);
      if (token !== __renderToken) return;
      await renderVariantPreview('black', c2);
      if (token !== __renderToken) return;
      await renderVariantPreview('white', c3);
      if (token !== __renderToken) return;
      await renderVariantPreview('custom', c4);
    } catch (e) {
      // Intentionally silent: preview failures should not break core export flow.
      // Use browser console for diagnostics.
      // console.error(e);
    }
  })();
}

// Bootstrap: once scripts.js has loaded assets (baseImage), populate defaults and render previews.
(function init() {
  updateCharLimitValue?.();

  const tryInit = () => {
    // baseImage is set by scripts.js after loading fonts and template
    if (window.baseImage) {
      handleInputChange();
      return true;
    }
    return false;
  };

  if (!tryInit()) {
    const t = setInterval(() => {
      if (tryInit()) clearInterval(t);
    }, 150);
  }
})();