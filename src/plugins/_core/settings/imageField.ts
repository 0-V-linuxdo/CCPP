/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { type ImageOption, isImageUrl } from "@kernel/settings";
import { h } from "@lib/dom";

declare const GM_xmlhttpRequest:
    | ((details: { method: string; url: string; timeout?: number; responseType?: "blob"; onload(r: { status: number; response: Blob }): void; onerror(e: unknown): void; ontimeout?(): void }) => void)
    | undefined;

const L = {
    pick: { zh: "选择图片…", en: "Choose picture…" },
    clear: { zh: "清除", en: "Clear" },
    reset: { zh: "重置裁切", en: "Reset crop" },
    placeholder: { zh: "粘贴图片，或输入 https://…", en: "Paste a picture, or https://…" },
    hint: { zh: "也可以把图片拖到圆圈上，或在这里直接粘贴。拖动圆圈调整位置，滚轮或滑块缩放。", en: "You can also drop a picture on the circle or paste one here. Drag the circle to pan; scroll or use the slider to zoom." },
    zoom: { zh: "缩放", en: "Zoom" },
    loading: { zh: "正在读取图片…", en: "Loading the picture…" },
    remoteFail: { zh: "读取不到这张网络图片，无法裁切；已原样保存链接，但 claude.ai 可能拦截它。建议下载后粘贴或拖进来。", en: "Couldn't load that picture, so it can't be cropped; the link is saved as is, but claude.ai may block it. Download it and paste or drop it instead." },
    badFile: { zh: "这不是可读取的图片。", en: "That isn't a readable picture." },
};

/** Pictures are capped to this edge before cropping, so the in-memory source stays small. */
const SOURCE_PX = 1024;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

export interface Crop {
    /** Centre of the square, as a fraction of the picture's width / height. */
    x: number;
    y: number;
    zoom: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** The square a crop takes from a w×h picture, in source pixels: centre kept inside the picture. */
export function cropRect(w: number, hgt: number, crop: Crop) {
    const zoom = clamp(crop.zoom, ZOOM_MIN, ZOOM_MAX);
    const side = Math.min(w, hgt) / zoom;
    const x = clamp(crop.x * w, side / 2, Math.max(side / 2, w - side / 2));
    const y = clamp(crop.y * hgt, side / 2, Math.max(side / 2, hgt - side / 2));
    return { side, x, y, zoom, crop: { x: x / w, y: y / hgt, zoom } };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img : null);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function canvasUrl(canvas: HTMLCanvasElement) {
    // WebP keeps a 256px avatar around a tenth of the PNG size; browsers without it hand back PNG.
    const webp = canvas.toDataURL("image/webp", 0.9);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}

function draw(img: HTMLImageElement, w: number, hgt: number, from?: { x: number; y: number; side: number }) {
    const canvas = h("canvas", { width: w, height: hgt });
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    if (from) ctx.drawImage(img, from.x - from.side / 2, from.y - from.side / 2, from.side, from.side, 0, 0, w, hgt);
    else ctx.drawImage(img, 0, 0, w, hgt);
    try {
        return canvasUrl(canvas);
    } catch {
        // A tainted canvas (a cross-origin picture) can't be read back.
        return null;
    }
}

/** A data URL of the picture scaled down to SOURCE_PX, or null when it can't be read. */
async function capped(src: string) {
    const img = await loadImage(src);
    if (!img) return null;
    const scale = Math.min(1, SOURCE_PX / Math.max(img.naturalWidth, img.naturalHeight));
    return draw(img, Math.max(1, Math.round(img.naturalWidth * scale)), Math.max(1, Math.round(img.naturalHeight * scale)));
}

async function bake(src: string, crop: Crop, size: number) {
    const img = await loadImage(src);
    if (!img) return null;
    const r = cropRect(img.naturalWidth, img.naturalHeight, crop);
    return draw(img, size, size, r);
}

const blobToDataUrl = (blob: Blob) =>
    new Promise<string | null>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
    });

/** Downloads a remote picture past CORS (through the userscript manager when it can) as a data URL. */
function fetchImage(url: string): Promise<string | null> {
    const fromBlob = (blob: Blob | null | undefined) => (blob && blob.type.startsWith("image/") ? blobToDataUrl(blob) : Promise.resolve(null));
    if (typeof GM_xmlhttpRequest === "function") {
        return new Promise(resolve =>
            GM_xmlhttpRequest!({
                method: "GET",
                url,
                timeout: 15000,
                responseType: "blob",
                onload: r => void (r.status >= 200 && r.status < 300 ? fromBlob(r.response).then(resolve) : resolve(null)),
                onerror: () => resolve(null),
                ontimeout: () => resolve(null),
            }),
        );
    }
    return fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" })
        .then(r => (r.ok ? r.blob() : null))
        .then(fromBlob)
        .catch(() => null);
}

function imageFile(data: DataTransfer | null): File | null {
    if (!data) return null;
    for (const file of data.files) if (file.type.startsWith("image/")) return file;
    for (const item of data.items) if (item.kind === "file" && item.type.startsWith("image/")) return item.getAsFile();
    return null;
}

/**
 * A picture field: URL box, file picker, paste and drop, and a round crop stage (drag to pan,
 * wheel or slider to zoom). Whatever is picked is cropped and stored as a small data URL.
 */
export function imageField(option: ImageOption, value: string, set: (next: string) => void): HTMLElement {
    const size = option.size ?? 256;
    let current = value;
    // The picture being cropped. Starts as the stored one, so a saved avatar can be re-cropped.
    let source = value.startsWith("data:image/") ? value : "";
    let natural: { w: number; h: number } | null = null;
    let crop: Crop = { x: 0.5, y: 0.5, zoom: 1 };
    let generation = 0;
    let bakeTimer: ReturnType<typeof setTimeout> | null = null;

    const stageImg = h("img", { alt: "", draggable: "false", referrerpolicy: "no-referrer" });
    const stage = h("div", { class: "img-stage", title: t(L.hint) }, stageImg);
    const zoom = h("input", { type: "range", min: ZOOM_MIN, max: ZOOM_MAX, step: 0.05, value: "1", "aria-label": t(L.zoom) });
    const zoomOut = h("output", { text: "100%" });
    const resetBtn = h("button", { type: "button", class: "btn", text: t(L.reset) });
    const url = h("input", { class: "input", placeholder: option.placeholder ? t(option.placeholder) : t(L.placeholder), "aria-label": t(option.label) });
    const file = h("input", { type: "file", accept: "image/*", style: { display: "none" } });
    const pick = h("button", { type: "button", class: "btn", text: t(L.pick) });
    const clearBtn = h("button", { type: "button", class: "btn", text: t(L.clear) });
    const note = h("div", { class: "row-desc img-note" });
    const zoomRow = h("div", { class: "img-zoom" }, zoom, zoomOut, resetBtn);
    const field = h("div", { class: "img-field" }, stage, h("div", { class: "img-side" }, h("div", { class: "img-line" }, url, pick, clearBtn), zoomRow, note), file);

    const say = (text: string) => (note.textContent = text);

    const save = (next: string) => {
        current = next;
        set(next);
    };

    const paint = () => {
        const shown = source || current;
        stage.classList.toggle("empty", !shown);
        if (!shown) stageImg.removeAttribute("src");
        else if (stageImg.getAttribute("src") !== shown) stageImg.src = shown;
        zoomRow.hidden = !source;
        zoom.value = String(crop.zoom);
        zoomOut.textContent = `${Math.round(crop.zoom * 100)}%`;
        if (!url.matches(":focus")) url.value = current.startsWith("data:") ? "" : current;
        clearBtn.disabled = !current;
        if (!source || !natural) {
            Object.assign(stageImg.style, { width: "100%", height: "100%", left: "0", top: "0" });
            return;
        }
        const r = cropRect(natural.w, natural.h, crop);
        Object.assign(stageImg.style, {
            width: `${(natural.w / r.side) * 100}%`,
            height: `${(natural.h / r.side) * 100}%`,
            left: `${(0.5 - r.x / r.side) * 100}%`,
            top: `${(0.5 - r.y / r.side) * 100}%`,
        });
    };

    const commit = (next: Crop, immediate = false) => {
        if (!source || !natural) return;
        crop = cropRect(natural.w, natural.h, next).crop;
        paint();
        if (bakeTimer) clearTimeout(bakeTimer);
        const src = source;
        const run = () => {
            const at = { ...crop };
            void bake(src, at, size).then(out => {
                if (out && src === source) save(out);
            });
        };
        if (immediate) run();
        else bakeTimer = setTimeout(run, 120);
    };

    /** Makes `src` (a data URL) the picture being cropped; bakes it centred unless `keep` is set. */
    const adopt = async (src: string, keep = false) => {
        const gen = ++generation;
        const img = await loadImage(src);
        if (gen !== generation) return;
        if (!img) {
            say(t(L.badFile));
            return;
        }
        source = src;
        natural = { w: img.naturalWidth, h: img.naturalHeight };
        crop = { x: 0.5, y: 0.5, zoom: 1 };
        say("");
        if (keep) paint();
        else commit(crop, true);
    };

    const takeBlob = async (blob: Blob) => {
        const gen = ++generation;
        say(t(L.loading));
        const raw = await blobToDataUrl(blob);
        const src = raw && (await capped(raw));
        if (gen !== generation) return;
        if (!src) return say(t(L.badFile));
        await adopt(src);
    };

    const takeText = async (raw: string) => {
        const text = raw.trim();
        const gen = ++generation;
        if (!text) {
            source = "";
            natural = null;
            say("");
            save("");
            return paint();
        }
        if (!isImageUrl(text)) return say(t(L.badFile));
        if (text.startsWith("data:image/")) {
            const src = await capped(text);
            if (gen !== generation) return;
            return src ? adopt(src) : say(t(L.badFile));
        }
        say(t(L.loading));
        const fetched = await fetchImage(text);
        const src = fetched && (await capped(fetched));
        if (gen !== generation) return;
        if (src) return adopt(src);
        // Keep the link anyway: it may still display even though it can't be read back for cropping.
        source = "";
        natural = null;
        save(text);
        say(t(L.remoteFail));
        paint();
    };

    const onPaste = (event: ClipboardEvent) => {
        const found = imageFile(event.clipboardData);
        if (!found) return;
        event.preventDefault();
        void takeBlob(found);
    };

    url.addEventListener("change", () => void takeText(url.value));
    url.addEventListener("paste", onPaste);
    field.addEventListener("paste", onPaste);
    pick.addEventListener("click", () => file.click());
    file.addEventListener("change", () => {
        const picked = file.files?.[0];
        file.value = "";
        if (picked) void takeBlob(picked);
    });
    clearBtn.addEventListener("click", () => {
        url.value = "";
        void takeText("");
    });
    resetBtn.addEventListener("click", () => commit({ x: 0.5, y: 0.5, zoom: 1 }, true));
    zoom.addEventListener("input", () => commit({ ...crop, zoom: Number(zoom.value) }));

    stage.addEventListener("dragover", event => {
        if (imageFile(event.dataTransfer)) event.preventDefault();
    });
    stage.addEventListener("drop", event => {
        const found = imageFile(event.dataTransfer);
        if (!found) return;
        event.preventDefault();
        void takeBlob(found);
    });
    stage.addEventListener("wheel", event => {
        if (!source) return;
        event.preventDefault();
        commit({ ...crop, zoom: crop.zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08) });
    }, { passive: false });

    let drag: { px: number; py: number; from: Crop } | null = null;
    stage.addEventListener("pointerdown", event => {
        if (event.button !== 0 || !source || !natural) return;
        stage.setPointerCapture(event.pointerId);
        drag = { px: event.clientX, py: event.clientY, from: { ...crop } };
    });
    stage.addEventListener("pointermove", event => {
        if (!drag || !natural || !stage.clientWidth) return;
        const { side } = cropRect(natural.w, natural.h, drag.from);
        const perPx = side / stage.clientWidth;
        crop = cropRect(natural.w, natural.h, {
            x: drag.from.x - ((event.clientX - drag.px) * perPx) / natural.w,
            y: drag.from.y - ((event.clientY - drag.py) * perPx) / natural.h,
            zoom: drag.from.zoom,
        }).crop;
        paint();
    });
    const endDrag = () => {
        if (!drag) return;
        drag = null;
        commit(crop, true);
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    if (source) void adopt(source, true);
    paint();
    return field;
}

/** Styles for the picture field, added to the settings panel's sheet. */
export const IMAGE_FIELD_CSS = `
.img-field { display: flex; gap: 14px; align-items: flex-start; }
.img-stage { position: relative; flex: none; width: 96px; height: 96px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--fg3) 14%, transparent); box-shadow: inset 0 0 0 1px var(--field-ring); cursor: grab; touch-action: none; user-select: none; }
.img-stage:active { cursor: grabbing; }
.img-stage.empty { cursor: default; }
.img-stage img { position: absolute; max-width: none; pointer-events: none; object-fit: cover; }
.img-stage.empty img { display: none; }
.img-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.img-line { display: flex; gap: 8px; align-items: center; }
.img-line .input { flex: 1; min-width: 0; }
.img-line .btn { flex: none; }
.img-zoom { display: flex; gap: 8px; align-items: center; }
.img-zoom[hidden] { display: none; }
.img-zoom input { flex: 1; min-width: 0; accent-color: var(--fg); }
.img-zoom output { min-width: 44px; text-align: right; font-variant-numeric: tabular-nums; color: var(--fg2); }
.img-note:empty { display: none; }
`;
