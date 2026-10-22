// SPDX-License-Identifier: AGPL-3.0-only
// Standalone new-api Task Plugin API v1 module; no build step or dependencies.
// Protocol presentation follows the QuantumNous/new-api task-plugin contract.
// Vendor contracts: https://docs.apimart.ai/cn (checked 2026-10-22).

const IMAGE_MODELS = {
  "gpt-image-2": { kind: "image", count: 1, references: 15, inline: true },
  "gpt-image-2-ext": { kind: "image", count: 1, references: 15, inline: true },
  "gpt-image-2-official": { kind: "image", count: 4, references: 16, tokens: true },
  "gpt-image-2.5-flare": { kind: "image", count: 4, references: 16, tokens: true, extendedQuality: true },
  "gpt-image-2.5-sunburst": { kind: "image", count: 4, references: 16, tokens: true, extendedQuality: true },
  "gpt-image-2.5-ext": { kind: "image", count: 4, references: 16, inline: true, ext: true },
};
const VIDEO_MODELS = {
  "kling-v2-6": { kind: "video", maxSeconds: 10, durations: [5, 10], references: 2, audio: true },
  "kling-v3": { kind: "video", maxSeconds: 15, references: 2, audio: true, fourK: true, shots: true },
  "kling-3.0-turbo": { kind: "video", maxSeconds: 15, references: 1, inline: true, turbo: true },
  "kling-v3-omni": { kind: "video", maxSeconds: 15, references: 7, audio: true, fourK: true, shots: true, omni: true },
  "kling-video-o1": { kind: "video", maxSeconds: 10, durations: [5, 10], references: 7, omni: true },
};
const MODELS = Object.assign({}, IMAGE_MODELS, VIDEO_MODELS);
// Keep endpoint declarations statically readable by the upload preview.
const IMAGE_MODEL_NAMES = ["gpt-image-2", "gpt-image-2-ext", "gpt-image-2-official", "gpt-image-2.5-flare", "gpt-image-2.5-sunburst", "gpt-image-2.5-ext"];
const VIDEO_MODEL_NAMES = ["kling-v2-6", "kling-v3", "kling-3.0-turbo", "kling-v3-omni", "kling-video-o1"];
const RATIOS = ["1:1", "3:2", "2:3", "4:3", "3:4", "5:4", "4:5", "16:9", "9:16", "2:1", "1:2", "21:9", "9:21", "3:1", "1:3"];
const EXT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9"];
const STATUS = {
  submitted: "SUBMITTED",
  pending: "QUEUED",
  queued: "QUEUED",
  processing: "IN_PROGRESS",
  in_progress: "IN_PROGRESS",
  completed: "SUCCESS",
  failed: "FAILURE",
  cancelled: "FAILURE",
};
const IMAGE_COUNT = {
  type: "number",
  unit: "count",
  unitLabel: { en: "image", zh: "张" },
  description: { en: "Image generation unit price", zh: "图片生成单价" },
};
const RESOLUTION = { enum: ["1k", "2k", "4k"], description: { en: "Output image resolution", zh: "输出图片分辨率" } };
const QUALITY = { enum: ["auto", "low", "medium", "high"], description: { en: "Output image quality", zh: "输出图片画质" } };
const IMAGE_SCHEMA = { image_count: IMAGE_COUNT, resolution: RESOLUTION };
const TOKEN_FIELDS = {
  text_tokens: { type: "number", unit: "token", description: { en: "Text input unit price", zh: "文本输入单价" } },
  image_tokens: { type: "number", unit: "token", description: { en: "Image input unit price", zh: "图片输入单价" } },
  cached_text_tokens: { type: "number", unit: "token", description: { en: "Cached text input unit price", zh: "缓存文本输入单价" } },
  cached_image_tokens: { type: "number", unit: "token", description: { en: "Cached image input unit price", zh: "缓存图片输入单价" } },
  output_tokens: { type: "number", unit: "token", description: { en: "Image output unit price", zh: "图片输出单价" } },
};
const SECONDS = { type: "number", unit: "second", description: { en: "Video generation unit price", zh: "视频生成单价" } };
const VIDEO_SCHEMA = {
  seconds: SECONDS,
  mode: { enum: ["std", "pro"], description: { en: "Video generation mode", zh: "视频生成模式" } },
  audio: { type: "boolean", description: { en: "Whether audio is generated", zh: "是否生成音频" } },
};
const TOKEN_SCHEMA = Object.assign({}, IMAGE_SCHEMA, { quality: QUALITY }, TOKEN_FIELDS);
const EXTENDED_TOKEN_SCHEMA = Object.assign({}, TOKEN_SCHEMA, {
  quality: { enum: ["auto", "low", "medium", "high", "xhigh", "max"], description: QUALITY.description },
});
const TOKEN_EXAMPLE = {
  image_count: 1,
  resolution: "1k",
  quality: "medium",
  text_tokens: 16,
  image_tokens: 0,
  cached_text_tokens: 0,
  cached_image_tokens: 0,
  output_tokens: 439,
};

export const meta = {
  apiVersion: 1,
  key: "apimart",
  name: "APIMart",
  icon: "text:AM",
  version: "0.1.0",
  author: { name: "heyzeyu", url: "https://github.com/heyzeyu" },
  website: "https://github.com/heyzeyu/new-api-apimart",
  description: { en: "APIMart image and Kling video generation", zh: "APIMart 图片与可灵视频生成" },
  baseUrl: "https://api.apimart.ai",
  auth: "api_key",
  models: [
    "gpt-image-2",
    "gpt-image-2-ext",
    "gpt-image-2-official",
    "gpt-image-2.5-flare",
    "gpt-image-2.5-sunburst",
    "gpt-image-2.5-ext",
    "kling-v2-6",
    "kling-v3",
    "kling-3.0-turbo",
    "kling-v3-omni",
    "kling-video-o1",
  ],
  fetchMode: "per_task",
  upstreams: ["vendor", "new_api"],
  usageSchema: IMAGE_SCHEMA,
  usageProfiles: [
    {
      models: ["gpt-image-2-official"],
      schema: TOKEN_SCHEMA,
      examples: [{ label: "1K medium", facts: Object.assign({}, TOKEN_EXAMPLE, { output_tokens: 1056 }) }],
    },
    { models: ["gpt-image-2.5-flare", "gpt-image-2.5-sunburst"], schema: EXTENDED_TOKEN_SCHEMA, examples: [{ label: "1K medium", facts: TOKEN_EXAMPLE }] },
    {
      models: ["gpt-image-2.5-ext"],
      schema: Object.assign({}, IMAGE_SCHEMA, { version: { enum: ["flare", "sunburst"], description: { en: "Image model version", zh: "图片模型版本" } } }),
    },
    { models: ["kling-v2-6", "kling-video-o1"], schema: VIDEO_SCHEMA },
    {
      models: ["kling-v3", "kling-v3-omni"],
      schema: Object.assign({}, VIDEO_SCHEMA, { mode: { enum: ["std", "pro", "4k"], description: VIDEO_SCHEMA.mode.description } }),
    },
    {
      models: ["kling-3.0-turbo"],
      schema: { seconds: SECONDS, resolution: { enum: ["720p", "1080p"], description: { en: "Output video resolution", zh: "输出视频分辨率" } } },
    },
  ],
  routes: [
    { method: "POST", path: "/apimart/v1/images/generations", type: "submit", models: IMAGE_MODEL_NAMES, decode: "decodeImage", render: "taskCreated" },
    { method: "POST", path: "/apimart/v1/videos/generations", type: "submit", models: VIDEO_MODEL_NAMES, decode: "decodeVideo", render: "taskCreated" },
    { method: "GET", path: "/apimart/v1/tasks/:task_id", type: "query", render: "taskStatus" },
  ],
  protocols: [
    { name: "openai_image", models: IMAGE_MODEL_NAMES },
    { name: "openai_video", models: VIDEO_MODEL_NAMES },
    { name: "openai_responses", supports: ["stream", "sync", "background"] },
  ],
};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}
function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(label + " must be an object");
  return value;
}
function specFor(model) {
  if (!Object.prototype.hasOwnProperty.call(MODELS, model)) throw new Error("Unsupported APIMart model");
  return MODELS[model];
}
function choice(value, fallback, options, label) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !options.includes(value)) throw new Error(label + " must be one of " + options.join(", "));
  return value;
}
function integer(value, low, high, label) {
  if (!Number.isInteger(value) || value < low || value > high) throw new Error(label + " must be an integer between " + low + " and " + high);
  return value;
}
function media(value, inline, label) {
  if (typeof value === "string" && /^https?:\/\/[^\s@]+$/.test(value)) return value;
  if (inline && typeof value === "string" && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(value)) return value;
  // Only a decoder may produce a file placeholder from a host-issued file ref.
  if (inline && value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "__fileRef")) return value;
  throw new Error(label + (inline ? " must be an image URL or image Data URL" : " requires a public image URL; upload local images to APIMart first"));
}

const IMAGE_FIELDS = [
  "prompt",
  "n",
  "size",
  "resolution",
  "quality",
  "version",
  "image_urls",
  "mask_url",
  "output_format",
  "output_compression",
  "background",
  "moderation",
  "official_fallback",
];
const VIDEO_FIELDS = [
  "prompt",
  "negative_prompt",
  "duration",
  "mode",
  "resolution",
  "aspect_ratio",
  "image_urls",
  "image_with_roles",
  "first_frame_image",
  "audio",
  "watermark",
  "multi_shot",
  "shot_type",
  "multi_prompt",
  "element_list",
  "video_list",
];

function normalizedImage(model, source) {
  const spec = specFor(model),
    req = {};
  if (spec.kind !== "image") throw new Error("An image model is required");
  for (const key of IMAGE_FIELDS) if (source[key] !== undefined) req[key] = source[key];
  req.prompt = text(req.prompt);
  if (!req.prompt || req.prompt.length > 32000) throw new Error("prompt must contain 1 to 32000 characters");
  req.n = integer(req.n === undefined ? 1 : req.n, 1, spec.count, "n");
  req.resolution = choice(typeof req.resolution === "string" ? req.resolution.toLowerCase() : req.resolution, "1k", ["1k", "2k", "4k"], "resolution");
  if (req.size !== undefined) {
    if (req.size !== "auto" && !(spec.ext ? EXT_RATIOS : RATIOS).includes(req.size)) {
      const match = typeof req.size === "string" && /^(\d{1,4})x(\d{1,4})$/.exec(req.size);
      if (!match || spec.ext) throw new Error("size must be a supported aspect ratio or WIDTHxHEIGHT");
      const width = Number(match[1]),
        height = Number(match[2]),
        pixels = width * height;
      if (
        !width ||
        !height ||
        Math.max(width, height) > 3840 ||
        Math.max(width, height) > Math.min(width, height) * 3 ||
        pixels < 655360 ||
        pixels > 8294400 ||
        (spec.tokens && (width % 16 || height % 16))
      )
        throw new Error("Image dimensions exceed the model limits");
      // Exact pixels take precedence over the resolution label at APIMart.
      req.resolution = pixels > 5242880 ? "4k" : pixels > 1572864 ? "2k" : "1k";
    }
  }
  if (spec.tokens) {
    req.quality = choice(
      req.quality,
      "auto",
      spec.extendedQuality ? ["auto", "low", "medium", "high", "xhigh", "max"] : ["auto", "low", "medium", "high"],
      "quality"
    );
    req.output_format = choice(req.output_format, "png", ["png", "jpeg", "webp"], "output_format");
    if (req.background !== undefined) {
      req.background = choice(req.background, undefined, ["auto", "opaque", "transparent"], "background");
      if (req.background === "transparent" && req.output_format === "jpeg") throw new Error("Transparent backgrounds require PNG or WebP");
    }
    if (req.output_compression !== undefined) integer(req.output_compression, 0, 100, "output_compression");
    if (req.moderation !== undefined) choice(req.moderation, undefined, ["auto", "low"], "moderation");
  } else {
    for (const field of ["quality", "mask_url", "output_format", "output_compression", "background", "moderation"])
      if (req[field] !== undefined) throw new Error(field + " is not supported by this APIMart model");
  }
  if (spec.ext) req.version = choice(req.version, "flare", ["flare", "sunburst"], "version");
  else if (req.version !== undefined) throw new Error("version is only supported by gpt-image-2.5-ext");
  if (req.official_fallback !== undefined && (typeof req.official_fallback !== "boolean" || (model !== "gpt-image-2" && model !== "gpt-image-2-ext")))
    throw new Error("official_fallback is only supported by gpt-image-2 and must be a boolean");
  if (req.official_fallback === true) throw new Error("official_fallback changes billing; select gpt-image-2-official explicitly");
  if (req.image_urls !== undefined) {
    if (!Array.isArray(req.image_urls) || req.image_urls.length > spec.references) throw new Error("Too many reference images");
    req.image_urls = req.image_urls.map(function (value) {
      return media(value, !!spec.inline, "image_urls");
    });
  }
  if (req.mask_url !== undefined) {
    if (!(req.image_urls || []).length) throw new Error("mask_url requires a reference image");
    req.mask_url = media(req.mask_url, !!spec.extendedQuality, "mask_url");
  }
  return req;
}

function normalizedVideo(model, source) {
  const spec = specFor(model),
    req = {};
  if (spec.kind !== "video") throw new Error("A video model is required");
  for (const key of VIDEO_FIELDS) if (source[key] !== undefined) req[key] = source[key];
  req.duration = integer(req.duration === undefined ? 5 : req.duration, 3, spec.maxSeconds, "duration");
  if (spec.durations && !spec.durations.includes(req.duration)) throw new Error("This model supports only 5 or 10 seconds");
  req.aspect_ratio = choice(req.aspect_ratio, "16:9", ["16:9", "9:16", "1:1"], "aspect_ratio");
  if (spec.turbo) {
    if (req.mode !== undefined) throw new Error("Kling Turbo uses resolution instead of mode");
    req.resolution = choice(req.resolution, "720p", ["720p", "1080p"], "resolution");
    for (const key of ["negative_prompt", "audio", "multi_shot", "shot_type", "multi_prompt", "element_list", "image_with_roles", "video_list"])
      if (req[key] !== undefined) throw new Error(key + " is not supported by Kling Turbo");
  } else {
    req.mode = choice(req.mode, "std", spec.fourK ? ["std", "pro", "4k"] : ["std", "pro"], "mode");
    if (req.resolution !== undefined) throw new Error("This Kling model uses mode instead of resolution");
    if (req.first_frame_image !== undefined) throw new Error("Use image_urls or image_with_roles for this model");
    if (req.audio !== undefined && (typeof req.audio !== "boolean" || (!spec.audio && req.audio)))
      throw new Error("Audio generation is not supported by this model");
    if (spec.audio) req.audio = req.audio === undefined ? false : req.audio;
  }
  if (req.watermark !== undefined && typeof req.watermark !== "boolean") throw new Error("watermark must be a boolean");
  if (req.image_urls !== undefined) {
    if (!Array.isArray(req.image_urls) || req.image_urls.length > (spec.omni ? 2 : spec.references))
      throw new Error("Too many reference images; use image_with_roles for Omni references");
    req.image_urls = req.image_urls.map(function (value) {
      return media(value, !!spec.inline, "image_urls");
    });
    if (spec.turbo && req.image_urls.length) {
      if (req.first_frame_image !== undefined) throw new Error("Use first_frame_image or image_urls, not both");
      req.first_frame_image = req.image_urls[0];
      delete req.image_urls;
    }
  }
  if (req.first_frame_image !== undefined) req.first_frame_image = media(req.first_frame_image, true, "first_frame_image");
  if (req.image_with_roles !== undefined) {
    if (!spec.omni || !Array.isArray(req.image_with_roles) || req.image_with_roles.length > spec.references)
      throw new Error("image_with_roles requires an Omni model and a supported reference count");
    if (req.image_urls !== undefined) throw new Error("Use image_urls or image_with_roles, not both");
    let first = 0,
      last = 0;
    req.image_with_roles = req.image_with_roles.map(function (entry) {
      object(entry, "image_with_roles entry");
      const role = choice(entry.role, "reference", ["reference", "first_frame", "last_frame"], "image role");
      if (role === "first_frame") first++;
      if (role === "last_frame") last++;
      return { url: media(entry.url, false, "image URL"), role: role };
    });
    if (first > 1 || last > 1 || (last && !first)) throw new Error("A last frame requires exactly one first frame");
    if (model === "kling-video-o1" && req.image_with_roles.length > 2 && (first || last))
      throw new Error("O1 cannot combine more than two references with frame roles");
  }
  // Base-video editing derives duration from remote media rather than the
  // requested duration. Do not advertise it until measured-duration settlement
  // has an independently verified upstream contract.
  if (req.video_list !== undefined) throw new Error("Reference-video editing is not supported in this plugin version");
  const references = (req.image_urls || []).length + (req.image_with_roles || []).length + (req.first_frame_image ? 1 : 0);
  if (model === "kling-v2-6" && ((req.audio && req.mode !== "pro") || ((req.image_urls || []).length === 2 && (req.mode !== "pro" || req.audio))))
    throw new Error("Kling 2.6 audio and last-frame constraints require a compatible pro request");
  if (req.multi_shot !== undefined && (typeof req.multi_shot !== "boolean" || (!spec.shots && req.multi_shot)))
    throw new Error("multi_shot requires Kling v3 or v3 Omni");
  if (req.multi_shot) {
    req.shot_type = choice(req.shot_type, undefined, ["customize", "intelligence"], "shot_type");
    if (!req.shot_type) throw new Error("shot_type is required for multi_shot");
    if (req.shot_type === "customize") {
      if (!Array.isArray(req.multi_prompt) || !req.multi_prompt.length || req.multi_prompt.length > 6) throw new Error("multi_prompt requires 1 to 6 shots");
      let duration = 0;
      req.multi_prompt = req.multi_prompt.map(function (entry, index) {
        object(entry, "shot");
        if (entry.index !== index + 1 || !text(entry.prompt) || entry.prompt.length > 512)
          throw new Error("Each shot requires a consecutive index and a prompt of at most 512 characters");
        duration += integer(entry.duration, 1, req.duration, "shot duration");
        return { index: index + 1, prompt: entry.prompt, duration: entry.duration };
      });
      if (duration !== req.duration) throw new Error("Shot durations must sum to duration");
    } else if (req.multi_prompt !== undefined) throw new Error("multi_prompt requires customized multi_shot");
  } else if (req.multi_prompt !== undefined || req.shot_type !== undefined) throw new Error("Shot parameters require multi_shot");
  if (req.element_list !== undefined) {
    if (!spec.shots || !Array.isArray(req.element_list) || !req.element_list.length || req.element_list.length > 3)
      throw new Error("element_list requires 1 to 3 subjects on Kling v3 or Omni");
    if (model === "kling-v3" && !(req.image_urls || []).length) throw new Error("Kling v3 subjects require at least one image_urls reference");
    req.element_list = req.element_list.map(function (entry) {
      object(entry, "element");
      if (
        !text(entry.name) ||
        !text(entry.description) ||
        !Array.isArray(entry.element_input_urls) ||
        entry.element_input_urls.length < 2 ||
        entry.element_input_urls.length > 4
      )
        throw new Error("Each element requires name, description and 2 to 4 images");
      return {
        name: entry.name,
        description: entry.description,
        element_input_urls: entry.element_input_urls.map(function (url) {
          return media(url, false, "element image");
        }),
      };
    });
  }
  req.prompt = text(req.prompt);
  if ((!req.prompt && !req.multi_shot && !(spec.turbo && references)) || req.prompt.length > (spec.turbo ? 3072 : 2500))
    throw new Error("A supported prompt is required");
  if (req.negative_prompt !== undefined && (typeof req.negative_prompt !== "string" || req.negative_prompt.length > 2500))
    throw new Error("negative_prompt must contain at most 2500 characters");
  return req;
}

function decodedRequest(ctx, kind, responses) {
  let source = {},
    files = [];
  if (ctx.body && ctx.body.kind === "json") source = object(ctx.body.value, "request body");
  else if (ctx.body && ctx.body.kind === "multipart" && !responses) {
    for (const key of Object.keys(ctx.body.fields || {})) {
      const values = ctx.body.fields[key];
      if (values.length !== 1) throw new Error(key + " must be provided once");
      source[key] = values[0];
    }
    for (const key of ["n", "seconds", "duration", "output_compression"]) if (source[key] !== undefined) source[key] = Number(source[key]);
    for (const key of ["watermark", "audio", "multi_shot", "official_fallback"])
      if (source[key] !== undefined) {
        if (source[key] !== "true" && source[key] !== "false") throw new Error(key + " must be true or false");
        source[key] = source[key] === "true";
      }
    for (const key of ["metadata", "image_urls", "image_with_roles", "multi_prompt", "element_list"])
      if (source[key] !== undefined) {
        try {
          source[key] = JSON.parse(source[key]);
        } catch {
          throw new Error(key + " must be JSON");
        }
      }
    files = ctx.body.files || [];
  } else throw new Error("A JSON or supported multipart body is required");
  const model = text(ctx.model) || text(source.model),
    upstreamModel = text(ctx.upstreamModel) || model;
  const spec = specFor(upstreamModel);
  if (kind && spec.kind !== kind) throw new Error("The model does not support this endpoint");
  const params = Object.assign({}, source.metadata === undefined ? {} : object(source.metadata, "metadata"), source);
  delete params.metadata;
  for (const key of ["callback_url", "webhook", "webhook_url"])
    if (params[key] !== undefined) throw new Error("Retrieve the gateway task instead of supplying a callback");
  if (params.stream !== undefined && params.stream !== false && !responses) throw new Error("Use Responses streaming or the native asynchronous route");
  if (params.response_format !== undefined && !["url", "b64_json"].includes(params.response_format)) throw new Error("response_format must be url or b64_json");
  let images = [];
  if (responses) {
    const texts = [];
    if (typeof source.input === "string") texts.push(source.input);
    else if (Array.isArray(source.input)) {
      for (const item of source.input) {
        if (typeof item === "string") {
          texts.push(item);
          continue;
        }
        object(item, "input item");
        const content = item.content === undefined ? [item] : typeof item.content === "string" ? [{ type: "input_text", text: item.content }] : item.content;
        if (!Array.isArray(content)) throw new Error("input content must be a string or array");
        for (const part of content) {
          object(part, "input content");
          if (["input_text", "text"].includes(part.type) && typeof part.text === "string") texts.push(part.text);
          else if (["input_image", "image_url"].includes(part.type)) images.push(typeof part.image_url === "object" ? part.image_url.url : part.image_url);
          else throw new Error("Unsupported Responses input content");
        }
      }
    } else throw new Error("input must be a string or array");
    params.prompt = texts.join("\n");
  }
  for (const field of ["image", "images", "input_reference"]) if (params[field] !== undefined) images = images.concat(params[field]);
  if (params.image_urls !== undefined) {
    if (!Array.isArray(params.image_urls)) throw new Error("image_urls must be an array");
    images = images.concat(params.image_urls);
  }
  for (const file of files) {
    const placeholder = { __fileRef: file.ref, encoding: "dataUrl", maxBytes: file.field === "mask" ? 4194304 : 20971520 };
    if (file.field === "mask") {
      if (params.mask_url !== undefined) throw new Error("Only one mask is supported");
      params.mask_url = placeholder;
    } else if (/^(image(?:\[\d*\])?|input_reference)$/.test(file.field)) images.push(placeholder);
    else throw new Error("Unsupported file field");
  }
  // User JSON cannot manufacture host-owned multipart file references.
  for (const image of images)
    if (
      typeof image !== "string" &&
      !files.some(function (file) {
        return image && file.ref === image.__fileRef;
      })
    )
      throw new Error("Image references must be strings");
  if (
    params.mask_url &&
    typeof params.mask_url !== "string" &&
    !files.some(function (file) {
      return file.field === "mask" && file.ref === params.mask_url.__fileRef;
    })
  )
    throw new Error("mask_url must be a string");
  if (images.length) params.image_urls = images;
  if (params.mask !== undefined) {
    if (params.mask_url !== undefined) throw new Error("Only one mask is supported");
    if (typeof params.mask !== "string") throw new Error("mask must be a URL string");
    params.mask_url = params.mask;
  }
  if (params.seconds !== undefined) {
    const seconds = typeof params.seconds === "string" && /^\d+$/.test(params.seconds) ? Number(params.seconds) : params.seconds;
    if (params.duration !== undefined && params.duration !== seconds) throw new Error("seconds and duration must agree");
    params.duration = seconds;
  }
  if (spec.kind === "video" && params.size !== undefined) {
    const ratios = {
      "1280x720": "16:9",
      "1920x1080": "16:9",
      "3840x2160": "16:9",
      "720x1280": "9:16",
      "1080x1920": "9:16",
      "2160x3840": "9:16",
      "1024x1024": "1:1",
    };
    const ratio = ["16:9", "9:16", "1:1"].includes(params.size) ? params.size : ratios[params.size];
    if (!ratio) throw new Error("size must use a supported Kling aspect ratio");
    if (params.aspect_ratio !== undefined && params.aspect_ratio !== ratio) throw new Error("size and aspect_ratio must agree");
    params.aspect_ratio = ratio;
    const mode = /^(1920x1080|1080x1920)$/.test(params.size)
      ? "pro"
      : /^(3840x2160|2160x3840)$/.test(params.size)
        ? "4k"
        : /^(1280x720|720x1280)$/.test(params.size)
          ? "std"
          : "";
    if (mode) {
      if (spec.turbo) {
        const resolution = mode === "pro" ? "1080p" : mode === "std" ? "720p" : "4k";
        if (params.resolution !== undefined && params.resolution !== resolution) throw new Error("size and resolution must agree");
        params.resolution = resolution;
      } else {
        if (params.mode !== undefined && params.mode !== mode) throw new Error("size and mode must agree");
        params.mode = mode;
      }
    }
  }
  if (spec.kind === "image" && ctx.operation === "edit" && !images.length) throw new Error("Image editing requires a reference image");
  const body = spec.kind === "image" ? normalizedImage(upstreamModel, params) : normalizedVideo(upstreamModel, params);
  return {
    kind: "submit",
    model: model,
    action:
      spec.kind === "image"
        ? images.length
          ? "image_to_image"
          : "text_to_image"
        : images.length || body.first_frame_image || (body.image_with_roles || []).length
          ? "image_to_video"
          : "text_to_video",
    requestBody: body,
  };
}

function endpoint(ctx, path) {
  let base = text(ctx.baseUrl).replace(/\/+$/, "");
  if (!/^https:\/\/[^/?#@\s]+(?:\/[^?#\s]*)?$/.test(base) && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base))
    throw new Error("An HTTPS Base URL without credentials, query or fragment is required");
  if (base.endsWith("/v1")) base = base.slice(0, -3);
  return base + (ctx.upstream && ctx.upstream.kind === "new_api" ? "/apimart" : "") + path;
}
function authorization(ctx) {
  if (!text(ctx.apiKey) && !text(ctx.authHeader)) throw new Error("APIMart API key is required");
  return { Authorization: text(ctx.authHeader) || "Bearer " + ctx.apiKey };
}
export function buildSubmitRequest(ctx) {
  const model = ctx.upstreamModel || ctx.model,
    spec = specFor(model);
  const body = spec.kind === "image" ? normalizedImage(model, object(ctx.requestBody, "request")) : normalizedVideo(model, object(ctx.requestBody, "request"));
  body.model = model;
  if (spec.ext) body.resolution = body.resolution.toUpperCase();
  return {
    url: endpoint(ctx, "/v1/" + (spec.kind === "image" ? "images" : "videos") + "/generations"),
    method: "POST",
    headers: Object.assign(authorization(ctx), { "Content-Type": "application/json" }),
    body: body,
  };
}
function taskData(body) {
  object(body, "APIMart response");
  if (body.error || (body.code !== undefined && body.code !== 200))
    throw new Error(text(body.error && body.error.message) || text(body.message) || "APIMart request failed");
  return object(body.data, "APIMart task");
}
export function parseSubmitResponse(ctx, response) {
  const body = object(response.body, "APIMart submission");
  if (body.error || (body.code !== undefined && body.code !== 200))
    throw new Error(text(body.error && body.error.message) || text(body.message) || "APIMart submission failed");
  const entries = Array.isArray(body.data) ? body.data : [body.data];
  if (entries.length !== 1) throw new Error("APIMart must return exactly one task per submission");
  const entry = object(entries[0], "APIMart task"),
    id = text(entry.task_id) || text(entry.id);
  if (!id || id.length > 256 || !/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("APIMart task ID is invalid");
  const spec = specFor(ctx.upstreamModel || ctx.model);
  const request =
    spec.kind === "image" ? normalizedImage(ctx.upstreamModel || ctx.model, ctx.requestBody) : normalizedVideo(ctx.upstreamModel || ctx.model, ctx.requestBody);
  return {
    taskId: id,
    taskData: body,
    state: { requestedCount: request.n || 1, duration: request.duration || 0, hasInputImages: (request.image_urls || []).length > 0 },
  };
}
export function buildQueryRequest(ctx) {
  return { url: endpoint(ctx, "/v1/tasks/" + encodeURIComponent(ctx.taskId)), method: "GET", headers: authorization(ctx) };
}

function mediaEntries(data, kind) {
  const result = data && data.result,
    entries = result && result[kind];
  if (!Array.isArray(entries)) return [];
  const found = [],
    seen = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const urls = Array.isArray(entry.url) ? entry.url : [entry.url];
    let hasURL = false;
    for (const url of urls)
      if (typeof url === "string" && /^https?:\/\/[^\s]+$/.test(url)) {
        hasURL = true;
        if (!seen.has(url)) {
          seen.add(url);
          found.push({ url: url, expires_at: entry.expires_at });
        }
      }
    // Count payloads rather than result objects. An entry carrying a URL and
    // Base64 is still one deliverable; prompt-only entries contribute nothing.
    if (!hasURL && kind === "images" && text(entry.b64_json) && !seen.has(entry.b64_json)) {
      seen.add(entry.b64_json);
      found.push({ b64_json: entry.b64_json });
    }
  }
  return found;
}
export function parseTaskResult(ctx, body) {
  const data = taskData(body),
    status = STATUS[text(data.status)];
  if (!status) return { status: "UNKNOWN", reason: "Unrecognized APIMart task status" };
  const result = { status: status };
  if (typeof data.progress === "number" && Number.isFinite(data.progress) && data.progress >= 0 && data.progress <= 100) result.progress = data.progress + "%";
  if (status === "FAILURE")
    result.reason = text(data.error && data.error.message) || (data.status === "cancelled" ? "APIMart task cancelled" : "APIMart generation failed");
  if (status === "SUCCESS") {
    const kind = specFor(ctx.upstreamModel || ctx.model).kind;
    const outputs = mediaEntries(data, kind === "image" ? "images" : "videos");
    if (!outputs.length) return { status: "UNKNOWN", reason: "APIMart completed without a media result" };
    result.progress = "100%";
    if (kind === "video") result.url = outputs[0].url;
  }
  return result;
}

export function extractUsage(ctx) {
  // These are quantities for task expressions, not multiplicative legacy ratios.
  if (ctx.usagePurpose === "billing_ratios") return null;
  const model = ctx.upstreamModel || ctx.model,
    spec = specFor(model);
  const req = spec.kind === "image" ? normalizedImage(model, ctx.requestBody) : normalizedVideo(model, ctx.requestBody);
  if (spec.kind === "video")
    return spec.turbo ? { seconds: req.duration, resolution: req.resolution } : { seconds: req.duration, mode: req.mode, audio: !!req.audio };
  const facts = { image_count: req.n, resolution: req.resolution };
  if (spec.ext) facts.version = req.version;
  if (spec.tokens) {
    facts.quality = req.quality;
    // Reserve a conservative input allowance for images of unknown dimensions.
    // Completion replaces these quantities with validated provider token facts.
    facts.text_tokens = req.prompt.length * 4;
    facts.image_tokens = (req.image_urls || []).length * 16384;
    facts.cached_text_tokens = 0;
    facts.cached_image_tokens = 0;
    // APIMart's published table peaks at 23,719 output tokens per 4K max image.
    // Auto can select that highest quality; reserve it instead of assuming low.
    const bounds = spec.extendedQuality
      ? {
          "1k": { low: 196, medium: 439, high: 1756, xhigh: 3122, max: 7024, auto: 7024 },
          "2k": { low: 397, medium: 892, high: 3568, xhigh: 6343, max: 14272, auto: 14272 },
          "4k": { low: 659, medium: 1483, high: 5930, xhigh: 10542, max: 23719, auto: 23719 },
        }[req.resolution]
      : { low: 2636, medium: 5932, high: 23720, auto: 23720 };
    facts.output_tokens = bounds[req.quality] * req.n;
  }
  return facts;
}
function tokenCount(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2147483647 ? value : null;
}
export function extractUsageOnComplete(ctx, result, body) {
  if (result.status !== "SUCCESS") return {};
  const spec = specFor(ctx.upstreamModel || ctx.model),
    data = taskData(body),
    facts = {};
  if (spec.kind === "video") return facts; // Fixed requested duration, never elapsed processing time.
  const outputs = mediaEntries(data, "images");
  if (outputs.length > 0 && outputs.length <= spec.count) facts.image_count = outputs.length;
  if (!spec.tokens || !data.usage) return facts;
  const usage = data.usage,
    output = tokenCount(usage.output_tokens),
    input = tokenCount(usage.input_tokens);
  if (output !== null) facts.output_tokens = output;
  if (input === null) return facts;
  const details = usage.input_tokens_details || {},
    images = tokenCount(details.image_tokens),
    cached = tokenCount(details.cached_tokens);
  if (ctx.state && ctx.state.hasInputImages && images === null) return facts;
  const imageTokens = images === null ? 0 : images,
    cachedTokens = cached === null ? 0 : cached;
  if (imageTokens > input || cachedTokens > input) return facts;
  const cacheDetails = details.cached_tokens_details || {},
    cachedImages = tokenCount(cacheDetails.image_tokens);
  if (cachedTokens && imageTokens && cachedImages === null) return facts; // Do not invent a modality split.
  const imageCache = cachedImages === null ? 0 : cachedImages,
    textCache = cachedTokens - imageCache,
    textTokens = input - imageTokens;
  if (imageCache > cachedTokens || imageCache > imageTokens || textCache > textTokens) return facts;
  return Object.assign(facts, {
    text_tokens: textTokens - textCache,
    image_tokens: imageTokens - imageCache,
    cached_text_tokens: textCache,
    cached_image_tokens: imageCache,
  });
}

function nativeEnvelope(task, submitted) {
  if (submitted) {
    // The Ext endpoint uses the newer object envelope. Other models keep the
    // array envelope; both retain the gateway's public task identity.
    if (task.data && task.data.data && !Array.isArray(task.data.data))
      return {
        code: 200,
        data: { id: task.task_id, object: "generation.task", type: "image", status: "pending", progress: 0, poll_url: "/apimart/v1/tasks/" + task.task_id },
      };
    return { code: 200, data: [{ status: "submitted", task_id: task.task_id }] };
  }
  const data = task.data && !Array.isArray(task.data.data) ? Object.assign({}, task.data.data) : {};
  data.id = task.task_id;
  data.status =
    { NOT_START: "pending", SUBMITTED: "submitted", QUEUED: "pending", IN_PROGRESS: "processing", SUCCESS: "completed", FAILURE: "failed" }[task.status] ||
    "pending";
  const progress = Number(String(task.progress || "").replace("%", ""));
  if (Number.isFinite(progress)) data.progress = progress;
  if (task.status === "FAILURE") data.error = { message: task.fail_reason || "APIMart task failed" };
  return { code: 200, data: data };
}
export const native = {
  decodeImage: function (ctx) {
    return decodedRequest(ctx, "image", false);
  },
  decodeVideo: function (ctx) {
    return decodedRequest(ctx, "video", false);
  },
  taskCreated: function (_ctx, task) {
    return nativeEnvelope(task, true);
  },
  taskStatus: function (_ctx, task) {
    return nativeEnvelope(task, false);
  },
  error: function (_ctx, error) {
    return { error: { code: error.code, message: error.message } };
  },
};

export function listArtifacts(task) {
  if (task.status !== "SUCCESS") return [];
  const data = task.data && task.data.data,
    artifacts = [];
  for (const kind of ["images", "videos"]) {
    for (const [index, output] of mediaEntries(data, kind).entries())
      if (output.url)
        artifacts.push({
          key: kind === "videos" && index === 0 ? "video" : (kind === "images" ? "image_" : "video_") + index,
          type: kind === "images" ? "image" : "video",
        });
  }
  return artifacts;
}
export function buildContentRequest(ctx) {
  const match = /^(image_|video_)(\d+)$/.exec(ctx.artifactKey);
  const kind = ctx.artifactKey === "video" || (match && match[1] === "video_") ? "videos" : "images";
  const index = ctx.artifactKey === "video" ? 0 : match ? Number(match[2]) : -1;
  const output = mediaEntries(ctx.data && ctx.data.data, kind)[index];
  if (!output || !output.url) throw new Error("artifact_not_found");
  // A CDN is a result recipient, never a recipient of the channel API key.
  return { url: output.url, method: ctx.clientRequest.method, credentialless: true };
}
function responseText(ctx, task) {
  const artifacts = ctx.artifacts || {},
    parts = [];
  for (const artifact of listArtifacts({ status: task.status, data: task.data })) {
    const url = text(artifacts[artifact.key] && artifacts[artifact.key].url);
    if (!url) throw new Error("Generated media artifact is unavailable");
    if (artifact.type === "image") parts.push("![image](" + url + ")");
    else parts.push('<video controls src="' + url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"></video>');
  }
  if (!parts.length) throw new Error("Generated media artifact is unavailable");
  return parts.join("\n");
}
export const protocols = {
  openai_image: {
    decodeRequest: function (ctx) {
      return decodedRequest(ctx, "image", false);
    },
    render: function (_ctx, task) {
      const data = task.data && task.data.data,
        images = mediaEntries(data, "images");
      if (!images.length) throw new Error("APIMart image result is empty");
      const result = {
        data: images.map(function (entry) {
          return entry.url ? { url: entry.url } : { b64_json: entry.b64_json };
        }),
      };
      if (data.usage) result.usage = data.usage;
      return result;
    },
  },
  openai_video: {
    decodeRequest: function (ctx) {
      return decodedRequest(ctx, "video", false);
    },
    render: function (_ctx, task) {
      const data = task.data && task.data.data,
        video = mediaEntries(data, "videos")[0],
        result = {};
      if (video) result.url = video.url;
      if (data && data.error) result.error = data.error;
      return result;
    },
  },
  openai_responses: {
    decodeRequest: function (ctx) {
      return decodedRequest(ctx, "", true);
    },
    renderEvents: function (ctx, task, previousState) {
      const state = { status: task.status, progress: task.progress || "" };
      if (task.status === "SUCCESS")
        return {
          events: previousState && previousState.status === "SUCCESS" ? [] : [{ type: "output", data: responseText(ctx, task) }],
          state: state,
          done: true,
        };
      if (task.status === "FAILURE")
        return { events: [{ type: "error", code: "task_failed", message: task.fail_reason || "APIMart generation failed" }], state: state, done: true };
      if (previousState && previousState.status === state.status && previousState.progress === state.progress) return { events: [], state: state, done: false };
      const event = { type: "progress", message: String(task.status || "pending").toLowerCase() },
        progress = Number(String(task.progress || "").replace("%", ""));
      if (Number.isFinite(progress) && progress >= 0 && progress <= 100) event.progress = progress;
      return { events: [event], state: state, done: false };
    },
    renderFinal: function (ctx, task) {
      return {
        output: [
          { type: "message", status: "completed", role: "assistant", content: [{ type: "output_text", text: responseText(ctx, task), annotations: [] }] },
        ],
        metadata: { vendor: "apimart" },
      };
    },
  },
};
