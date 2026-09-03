## DualCLIPLoader
```python
class DualCLIPLoader:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": { "clip_name1": (folder_paths.get_filename_list("text_encoders"), ),
                              "clip_name2": (folder_paths.get_filename_list("text_encoders"), ),
                              "type": (["sdxl", "sd3", "flux", "hunyuan_video", "hidream", "hunyuan_image", "hunyuan_video_15", "kandinsky5", "kandinsky5_image", "ltxv", "newbie", "ace"], ),
                              },
                "optional": {
                              "device": (["default", "cpu"], {"advanced": True}),
                             }}
    RETURN_TYPES = ("CLIP",)
    FUNCTION = "load_clip"

    CATEGORY = "advanced/loaders"

    DESCRIPTION = "[Recipes]\n\nsdxl: clip-l, clip-g\nsd3: clip-l, clip-g / clip-l, t5 / clip-g, t5\nflux: clip-l, t5\nhidream: at least one of t5 or llama, recommended t5 and llama\nhunyuan_image: qwen2.5vl 7b and byt5 small\nnewbie: gemma-3-4b-it, jina clip v2"

    def load_clip(self, clip_name1, clip_name2, type, device="default"):
        clip_type = getattr(comfy.sd.CLIPType, type.upper(), comfy.sd.CLIPType.STABLE_DIFFUSION)

        clip_path1 = folder_paths.get_full_path_or_raise("text_encoders", clip_name1)
        clip_path2 = folder_paths.get_full_path_or_raise("text_encoders", clip_name2)

        model_options = {}
        if device == "cpu":
            model_options["load_device"] = model_options["offload_device"] = torch.device("cpu")

        clip = comfy.sd.load_clip(ckpt_paths=[clip_path1, clip_path2], embedding_directory=folder_paths.get_folder_paths("embeddings"), clip_type=clip_type, model_options=model_options)
        return (clip,)
```

---

## Load Diffusion Models

```python
class UNETLoader:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": { "unet_name": (folder_paths.get_filename_list("diffusion_models"), ),
                              "weight_dtype": (["default", "fp8_e4m3fn", "fp8_e4m3fn_fast", "fp8_e5m2"],)
                             }}
    RETURN_TYPES = ("MODEL",)
    FUNCTION = "load_unet"

    CATEGORY = "advanced/loaders"

    def load_unet(self, unet_name, weight_dtype):
        model_options = {}
        if weight_dtype == "fp8_e4m3fn":
            model_options["dtype"] = torch.float8_e4m3fn
        elif weight_dtype == "fp8_e4m3fn_fast":
            model_options["dtype"] = torch.float8_e4m3fn
            model_options["fp8_optimizations"] = True
        elif weight_dtype == "fp8_e5m2":
            model_options["dtype"] = torch.float8_e5m2

        unet_path = folder_paths.get_full_path_or_raise("diffusion_models", unet_name)
        model = comfy.sd.load_diffusion_model(unet_path, model_options=model_options)
        return (model,)
```

---

## VAELoader

```python
class VAELoader:
    video_taes = ["taehv", "lighttaew2_2", "lighttaew2_1", "lighttaehy1_5", "taeltx_2"]
    image_taes = ["taesd", "taesdxl", "taesd3", "taef1"]
    @staticmethod
    def vae_list(s):
        vaes = folder_paths.get_filename_list("vae")
        approx_vaes = folder_paths.get_filename_list("vae_approx")
        sdxl_taesd_enc = False
        sdxl_taesd_dec = False
        sd1_taesd_enc = False
        sd1_taesd_dec = False
        sd3_taesd_enc = False
        sd3_taesd_dec = False
        f1_taesd_enc = False
        f1_taesd_dec = False

        for v in approx_vaes:
            if v.startswith("taesd_decoder."):
                sd1_taesd_dec = True
            elif v.startswith("taesd_encoder."):
                sd1_taesd_enc = True
            elif v.startswith("taesdxl_decoder."):
                sdxl_taesd_dec = True
            elif v.startswith("taesdxl_encoder."):
                sdxl_taesd_enc = True
            elif v.startswith("taesd3_decoder."):
                sd3_taesd_dec = True
            elif v.startswith("taesd3_encoder."):
                sd3_taesd_enc = True
            elif v.startswith("taef1_encoder."):
                f1_taesd_dec = True
            elif v.startswith("taef1_decoder."):
                f1_taesd_enc = True
            else:
                for tae in s.video_taes:
                    if v.startswith(tae):
                        vaes.append(v)

        if sd1_taesd_dec and sd1_taesd_enc:
            vaes.append("taesd")
        if sdxl_taesd_dec and sdxl_taesd_enc:
            vaes.append("taesdxl")
        if sd3_taesd_dec and sd3_taesd_enc:
            vaes.append("taesd3")
        if f1_taesd_dec and f1_taesd_enc:
            vaes.append("taef1")
        vaes.append("pixel_space")
        return vaes

    @staticmethod
    def load_taesd(name):
        sd = {}
        approx_vaes = folder_paths.get_filename_list("vae_approx")

        encoder = next(filter(lambda a: a.startswith("{}_encoder.".format(name)), approx_vaes))
        decoder = next(filter(lambda a: a.startswith("{}_decoder.".format(name)), approx_vaes))

        enc = comfy.utils.load_torch_file(folder_paths.get_full_path_or_raise("vae_approx", encoder))
        for k in enc:
            sd["taesd_encoder.{}".format(k)] = enc[k]

        dec = comfy.utils.load_torch_file(folder_paths.get_full_path_or_raise("vae_approx", decoder))
        for k in dec:
            sd["taesd_decoder.{}".format(k)] = dec[k]

        if name == "taesd":
            sd["vae_scale"] = torch.tensor(0.18215)
            sd["vae_shift"] = torch.tensor(0.0)
        elif name == "taesdxl":
            sd["vae_scale"] = torch.tensor(0.13025)
            sd["vae_shift"] = torch.tensor(0.0)
        elif name == "taesd3":
            sd["vae_scale"] = torch.tensor(1.5305)
            sd["vae_shift"] = torch.tensor(0.0609)
        elif name == "taef1":
            sd["vae_scale"] = torch.tensor(0.3611)
            sd["vae_shift"] = torch.tensor(0.1159)
        return sd

    @classmethod
    def INPUT_TYPES(s):
        return {"required": { "vae_name": (s.vae_list(s), )}}
    RETURN_TYPES = ("VAE",)
    FUNCTION = "load_vae"

    CATEGORY = "loaders"

    #TODO: scale factor?
    def load_vae(self, vae_name):
        metadata = None
        if vae_name == "pixel_space":
            sd = {}
            sd["pixel_space_vae"] = torch.tensor(1.0)
        elif vae_name in self.image_taes:
            sd = self.load_taesd(vae_name)
        else:
            if os.path.splitext(vae_name)[0] in self.video_taes:
                vae_path = folder_paths.get_full_path_or_raise("vae_approx", vae_name)
            else:
                vae_path = folder_paths.get_full_path_or_raise("vae", vae_name)
            sd, metadata = comfy.utils.load_torch_file(vae_path, return_metadata=True)
        vae = comfy.sd.VAE(sd=sd, metadata=metadata)
        vae.throw_exception_if_invalid()
        return (vae,)
```

---

## ConditioningSetTimestepRange

```python
class ConditioningZeroOut:
    SEARCH_ALIASES = ["null conditioning", "clear conditioning"]

    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"conditioning": ("CONDITIONING", )}}
    RETURN_TYPES = ("CONDITIONING",)
    FUNCTION = "zero_out"

    CATEGORY = "advanced/conditioning"

    def zero_out(self, conditioning):
        c = []
        for t in conditioning:
            d = t[1].copy()
            pooled_output = d.get("pooled_output", None)
            if pooled_output is not None:
                d["pooled_output"] = torch.zeros_like(pooled_output)
            conditioning_lyrics = d.get("conditioning_lyrics", None)
            if conditioning_lyrics is not None:
                d["conditioning_lyrics"] = torch.zeros_like(conditioning_lyrics)
            n = [torch.zeros_like(t[0]), d]
            c.append(n)
        return (c, )
```

---

## KSampler

```python
class KSampler:
    SCHEDULERS = SCHEDULER_NAMES
    SAMPLERS = SAMPLER_NAMES
    DISCARD_PENULTIMATE_SIGMA_SAMPLERS = set(('dpm_2', 'dpm_2_ancestral', 'uni_pc', 'uni_pc_bh2'))

    def __init__(self, model, steps, device, sampler=None, scheduler=None, denoise=None, model_options={}):
        self.model = model
        self.device = device
        if scheduler not in self.SCHEDULERS:
            scheduler = self.SCHEDULERS[0]
        if sampler not in self.SAMPLERS:
            sampler = self.SAMPLERS[0]
        self.scheduler = scheduler
        self.sampler = sampler
        self.set_steps(steps, denoise)
        self.denoise = denoise
        self.model_options = model_options

    def calculate_sigmas(self, steps):
        sigmas = None

        discard_penultimate_sigma = False
        if self.sampler in self.DISCARD_PENULTIMATE_SIGMA_SAMPLERS:
            steps += 1
            discard_penultimate_sigma = True

        sigmas = calculate_sigmas(self.model.get_model_object("model_sampling"), self.scheduler, steps)

        if discard_penultimate_sigma:
            sigmas = torch.cat([sigmas[:-2], sigmas[-1:]])
        return sigmas

    def set_steps(self, steps, denoise=None):
        self.steps = steps
        if denoise is None or denoise > 0.9999:
            self.sigmas = self.calculate_sigmas(steps).to(self.device)
        else:
            if denoise <= 0.0:
                self.sigmas = torch.FloatTensor([])
            else:
                new_steps = int(steps/denoise)
                sigmas = self.calculate_sigmas(new_steps).to(self.device)
                self.sigmas = sigmas[-(steps + 1):]

    def sample(self, noise, positive, negative, cfg, latent_image=None, start_step=None, last_step=None, force_full_denoise=False, denoise_mask=None, sigmas=None, callback=None, disable_pbar=False, seed=None):
        if sigmas is None:
            sigmas = self.sigmas

        if last_step is not None and last_step < (len(sigmas) - 1):
            sigmas = sigmas[:last_step + 1]
            if force_full_denoise:
                sigmas[-1] = 0

        if start_step is not None:
            if start_step < (len(sigmas) - 1):
                sigmas = sigmas[start_step:]
            else:
                if latent_image is not None:
                    return latent_image
                else:
                    return torch.zeros_like(noise)

        sampler = sampler_object(self.sampler)

        return sample(self.model, noise, positive, negative, cfg, self.device, sampler, sigmas, self.model_options, latent_image=latent_image, denoise_mask=denoise_mask, callback=callback, disable_pbar=disable_pbar, seed=seed)
```

---

## VAEDecodeAudio

```python
class VAEDecodeAudio(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="VAEDecodeAudio",
            search_aliases=["latent to audio"],
            display_name="VAE Decode Audio",
            category="latent/audio",
            inputs=[
                IO.Latent.Input("samples"),
                IO.Vae.Input("vae"),
            ],
            outputs=[IO.Audio.Output()],
        )

    @classmethod
    def execute(cls, vae, samples) -> IO.NodeOutput:
        return IO.NodeOutput(vae_decode_audio(vae, samples))

    decode = execute  # TODO: remove
```

---

## SaveAudioMP3

```python
class SaveAudioMP3(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="SaveAudioMP3",
            search_aliases=["export mp3"],
            display_name="Save Audio (MP3)",
            category="audio",
            inputs=[
                IO.Audio.Input("audio"),
                IO.String.Input("filename_prefix", default="audio/ComfyUI"),
                IO.Combo.Input("quality", options=["V0", "128k", "320k"], default="V0"),
            ],
            hidden=[IO.Hidden.prompt, IO.Hidden.extra_pnginfo],
            is_output_node=True,
        )

    @classmethod
    def execute(cls, audio, filename_prefix="ComfyUI", format="mp3", quality="128k") -> IO.NodeOutput:
        return IO.NodeOutput(
            ui=UI.AudioSaveHelper.get_save_audio_ui(
                audio, filename_prefix=filename_prefix, cls=cls, format=format, quality=quality
            )
        )

    save_mp3 = execute  # TODO: remove
```

---

## ModelSamplingAuraFlow

```python
class ModelSamplingAuraFlow(ModelSamplingSD3):
    @classmethod
    def INPUT_TYPES(s):
        return {"required": { "model": ("MODEL",),
                              "shift": ("FLOAT", {"default": 1.73, "min": 0.0, "max": 100.0, "step":0.01}),
                              }}

    FUNCTION = "patch_aura"

    def patch_aura(self, model, shift):
        return self.patch(model, shift, multiplier=1.0)
        
class ModelSamplingSD3:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": { "model": ("MODEL",),
                              "shift": ("FLOAT", {"default": 3.0, "min": 0.0, "max": 100.0, "step":0.01}),
                              }}

    RETURN_TYPES = ("MODEL",)
    FUNCTION = "patch"

    CATEGORY = "advanced/model"

    def patch(self, model, shift, multiplier=1000):
        m = model.clone()

        sampling_base = comfy.model_sampling.ModelSamplingDiscreteFlow
        sampling_type = comfy.model_sampling.CONST

        class ModelSamplingAdvanced(sampling_base, sampling_type):
            pass

        model_sampling = ModelSamplingAdvanced(model.model.model_config)
        model_sampling.set_parameters(shift=shift, multiplier=multiplier)
        m.add_object_patch("model_sampling", model_sampling)
        return (m, )
```

---

## Preview as Text

```python
class PreviewAny():
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {"source": (IO.ANY, {})},
        }

    RETURN_TYPES = ()
    FUNCTION = "main"
    OUTPUT_NODE = True

    CATEGORY = "utils"
    SEARCH_ALIASES = ["show output", "inspect", "debug", "print value", "show text"]

    def main(self, source=None):
        value = 'None'
        if isinstance(source, str):
            value = source
        elif isinstance(source, (int, float, bool)):
            value = str(source)
        elif source is not None:
            try:
                value = json.dumps(source, indent=4)
            except Exception:
                try:
                    value = str(source)
                except Exception:
                    value = 'source exists, but could not be serialized.'

        return {"ui": {"text": (value,)}}
```

---

## String(Multiline)

```python
class StringMultiline(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id="PrimitiveStringMultiline",
            display_name="String (Multiline)",
            category="utils/primitive",
            essentials_category="Basics",
            inputs=[
                io.String.Input("value", multiline=True),
            ],
            outputs=[io.String.Output()],
        )

    @classmethod
    def execute(cls, value: str) -> io.NodeOutput:
        return io.NodeOutput(value)
```

---

## TextEncodeAceStepAudio15

```python
class TextEncodeAceStepAudio15(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id="TextEncodeAceStepAudio1.5",
            category="conditioning",
            inputs=[
                io.Clip.Input("clip"),
                io.String.Input("tags", multiline=True, dynamic_prompts=True),
                io.String.Input("lyrics", multiline=True, dynamic_prompts=True),
                io.Int.Input("seed", default=0, min=0, max=0xffffffffffffffff, control_after_generate=True),
                io.Int.Input("bpm", default=120, min=10, max=300),
                io.Float.Input("duration", default=120.0, min=0.0, max=2000.0, step=0.1),
                io.Combo.Input("timesignature", options=['2', '3', '4', '6']),
                io.Combo.Input("language", options=["en", "ja", "zh", "es", "de", "fr", "pt", "ru", "it", "nl", "pl", "tr", "vi", "cs", "fa", "id", "ko", "uk", "hu", "ar", "sv", "ro", "el"]),
                io.Combo.Input("keyscale", options=[f"{root} {quality}" for quality in ["major", "minor"] for root in ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]]),
                io.Boolean.Input("generate_audio_codes", default=True, tooltip="Enable the LLM that generates audio codes. This can be slow but will increase the quality of the generated audio. Turn this off if you are giving the model an audio reference.", advanced=True),
                io.Float.Input("cfg_scale", default=2.0, min=0.0, max=100.0, step=0.1, advanced=True),
                io.Float.Input("temperature", default=0.85, min=0.0, max=2.0, step=0.01, advanced=True),
                io.Float.Input("top_p", default=0.9, min=0.0, max=2000.0, step=0.01, advanced=True),
                io.Int.Input("top_k", default=0, min=0, max=100, advanced=True),
                io.Float.Input("min_p", default=0.000, min=0.0, max=1.0, step=0.001, advanced=True),
            ],
            outputs=[io.Conditioning.Output()],
        )

    @classmethod
    def execute(cls, clip, tags, lyrics, seed, bpm, duration, timesignature, language, keyscale, generate_audio_codes, cfg_scale, temperature, top_p, top_k, min_p) -> io.NodeOutput:
        tokens = clip.tokenize(tags, lyrics=lyrics, bpm=bpm, duration=duration, timesignature=int(timesignature), language=language, keyscale=keyscale, seed=seed, generate_audio_codes=generate_audio_codes, cfg_scale=cfg_scale, temperature=temperature, top_p=top_p, top_k=top_k, min_p=min_p)
        conditioning = clip.encode_from_tokens_scheduled(tokens)
        return io.NodeOutput(conditioning)
```

---

## MelBandRoformerModelLoader

```python
class MelBandRoFormerModelLoader:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "model_name": (folder_paths.get_filename_list("diffusion_models"), {"tooltip": "These models are loaded from the 'ComfyUI/models/diffusion_models' -folder",}),
            },
        }

    RETURN_TYPES = ("MELROFORMERMODEL",)
    RETURN_NAMES = ("model", )
    FUNCTION = "loadmodel"
    CATEGORY = "Mel-Band RoFormer"

    def loadmodel(self, model_name):
        model_config = {
                "dim": 384,
                "depth": 6,
                "stereo": True,
                "num_stems": 1,
                "time_transformer_depth": 1,
                "freq_transformer_depth": 1,
                "num_bands": 60,
                "dim_head": 64,
                "heads": 8,
                "attn_dropout": 0,
                "ff_dropout": 0,
                "flash_attn": True,
                "dim_freqs_in": 1025,
                "sample_rate": 44100,  # needed for mel filter bank from librosa
                "stft_n_fft": 2048,
                "stft_hop_length": 441,
                "stft_win_length": 2048,
                "stft_normalized": False,
                "mask_estimator_depth": 2,
                "multi_stft_resolution_loss_weight": 1.0,
                "multi_stft_resolutions_window_sizes": (4096, 2048, 1024, 512, 256),
                "multi_stft_hop_size": 147,
                "multi_stft_normalized": False,
        }
        model = MelBandRoformer(**model_config).eval()
        model_path = folder_paths.get_full_path_or_raise("diffusion_models", model_name)
        model.load_state_dict(load_torch_file(model_path), strict=True)

        return (model,)
```

---

## MelBandRoFormerSampler

```python
class MelBandRoFormerSampler:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "model": ("MELROFORMERMODEL",),
                "audio": ("AUDIO",),
            },
        }

    RETURN_TYPES = ("AUDIO","AUDIO",)
    RETURN_NAMES = ("vocals", "instruments")
    FUNCTION = "process"
    CATEGORY = "Mel-Band RoFormer"

    def process(self, model, audio):

        audio_input = audio["waveform"]
        sample_rate = audio["sample_rate"]

        B, audio_channels, audio_length = audio_input.shape

        sr = 44100

        if audio_channels == 1:
            # Convert mono to stereo by duplicating the channel
            audio_input = audio_input.repeat(1, 2, 1)
            audio_channels = 2
            print("Converted mono input to stereo.")

        if sample_rate != sr:
            print(f"Resampling input {sample_rate} to {sr}")
            audio_input = TAF.resample(audio_input, orig_freq=sample_rate, new_freq=sr)
        audio_input = original_audio = audio_input[0]

        C = 352800
        N = 2
        step = C // N
        fade_size = C // 10
        border = C - step

        if audio_length > 2 * border and border > 0:
            audio_input = F.pad(audio_input, (border, border), mode='reflect')

        windowing_array = get_windowing_array(C, fade_size, device)


        audio_input = audio_input.to(device)
        vocals = torch.zeros_like(audio_input, dtype=torch.float32).to(device)
        counter = torch.zeros_like(audio_input, dtype=torch.float32).to(device)

        total_length = audio_input.shape[1]
        num_chunks = (total_length + step - 1) // step

        model.to(device)

        comfy_pbar = ProgressBar(num_chunks)

        for i in tqdm(range(0, total_length, step), desc="Processing chunks"):
            part = audio_input[:, i:i + C]
            length = part.shape[-1]
            if length < C:
                if length > C // 2 + 1:
                    part = F.pad(input=part, pad=(0, C - length), mode='reflect')
                else:
                    part = F.pad(input=part, pad=(0, C - length, 0, 0), mode='constant', value=0)

            x = model(part.unsqueeze(0))[0]

            window = windowing_array.clone()
            if i == 0:
                window[:fade_size] = 1
            elif i + C >= total_length:
                window[-fade_size:] = 1

            vocals[..., i:i+length] += x[..., :length] * window[..., :length]
            counter[..., i:i+length] += window[..., :length]
            comfy_pbar.update(1)

        model.to(offload_device)

        estimated_sources = vocals / counter

        if audio_length > 2 * border and border > 0:
            estimated_sources = estimated_sources[..., border:-border]

        vocals_out = {
            "waveform": estimated_sources.unsqueeze(0).cpu(),
            "sample_rate": sr,
        }
        instruments_out = {
            "waveform": (original_audio.to(device) - estimated_sources).unsqueeze(0).cpu(),
            "sample_rate": sr,
        }

        return (vocals_out, instruments_out)
```

---

## LoadFasterWhisperModel

```python
class LoadFasterWhisperModel:
    @classmethod
    def INPUT_TYPES(s):
        faster_whisper_models = list(collect_model_paths().keys())

        return {
            "required": {
                "model": (faster_whisper_models,),
                "device": (['cuda', 'cpu', 'auto'],),
            },
        }

    RETURN_TYPES = ("FASTERWHISPERMODEL",)
    RETURN_NAMES = ("faster_whisper_model",)
    FUNCTION = "load_model"
    CATEGORY = "FASTERWHISPER"

    def load_model(self,
                   model: str,
                   device: str,
                   ) -> Tuple[faster_whisper.WhisperModel]:
        os.makedirs(faster_whisper_model_dir, exist_ok=True)
        model = collect_model_paths()[model]

        faster_whisper_model = faster_whisper.WhisperModel(
            device=device,
            model_size_or_path=model,
            download_root=faster_whisper_model_dir,
            local_files_only=False
        )

        return (faster_whisper_model, )
```

---

## FasterWhisperTranscriptionWithAudio

```python
class FasterWhisperTranscriptionWithAudio:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "audio": ("AUDIO",),
                "model": ("FASTERWHISPERMODEL",),
            },
            "optional": {
                "language": ("STRING", {"default": "zh"}),
                "task": (["transcribe", "translate"],),

                # 歌曲人声不建议默认开 VAD，否则长停顿/弱唱段后面容易丢
                "vad_filter": ("BOOLEAN", {"default": False}),

                # 为了做细颗粒切分，必须开
                "word_timestamps": ("BOOLEAN", {"default": True}),

                # 单段最大字数，超过后优先切开
                "max_chars_per_line": ("INT", {"default": 14}),

                # 两词之间停顿超过这个值就切段
                "max_silence_gap": ("FLOAT", {"default": 0.45}),

                # 单段最大持续时长，防止一整长句挂一个时间段里
                "max_segment_duration": ("FLOAT", {"default": 4.2}),

                # 标点后更容易切开
                "split_on_punctuation": ("BOOLEAN", {"default": True}),

                # 更稳一些，减少弱唱段漏掉
                "beam_size": ("INT", {"default": 8}),
                "best_of": ("INT", {"default": 8}),
                "patience": ("FLOAT", {"default": 1.2}),
                "temperature": ("FLOAT", {"default": 0.0}),
                "condition_on_previous_text": ("BOOLEAN", {"default": True}),
                "no_speech_threshold": ("FLOAT", {"default": 0.3}),

                # 尽量短，避免提示词泄漏到识别结果
                "initial_prompt": ("STRING", {"default": ""}),

                # 兼容一些 faster-whisper 参数
                "suppress_tokens": ("STRING", {"default": "[-1]"}),
                "prefix": ("STRING", {"default": ""}),
                "hotwords": ("STRING", {"default": ""}),
                "max_new_tokens": ("INT", {"default": INT_NONE_VALUE}),
                "chunk_length": ("INT", {"default": INT_NONE_VALUE}),
                "hallucination_silence_threshold": ("FLOAT", {"default": FLOAT_NONE_VALUE}),
                "language_detection_threshold": ("FLOAT", {"default": FLOAT_NONE_VALUE}),
            }
        }

    RETURN_TYPES = ("TRANSCRIPTIONS",)
    RETURN_NAMES = ("transcriptions",)
    FUNCTION = "transcribe"
    CATEGORY = "FASTERWHISPER"

    def transcribe(self, audio, model, **params):
        # 提取自定义控制参数
        max_chars = int(params.pop("max_chars_per_line", 14))
        max_gap = float(params.pop("max_silence_gap", 0.45))
        max_segment_duration = float(params.pop("max_segment_duration", 4.2))
        split_on_punctuation = bool(params.pop("split_on_punctuation", True))

        # 预处理音频
        audio_array = self.preprocess_audio(audio)

        # 整理模型参数
        params = self.collect_params(params)

        # 歌曲场景兜底
        params["vad_filter"] = False if params.get("vad_filter") is None else params["vad_filter"]
        params["word_timestamps"] = True if params.get("word_timestamps") is None else params["word_timestamps"]

        if params.get("beam_size") is None:
            params["beam_size"] = 8
        if params.get("best_of") is None:
            params["best_of"] = 8
        if params.get("patience") is None:
            params["patience"] = 1.2
        if params.get("temperature") is None:
            params["temperature"] = 0.0
        if params.get("condition_on_previous_text") is None:
            params["condition_on_previous_text"] = True
        if params.get("no_speech_threshold") is None:
            params["no_speech_threshold"] = 0.3

        # 执行识别
        segments, info = model.transcribe(
            audio=audio_array,
            **params,
        )

        transcriptions = []

        for segment in segments:
            seg_text = self.clean_text(getattr(segment, "text", ""))

            # 整段没中文，直接跳过
            if not self.contains_chinese(seg_text) :
                continue

            # 如果没有单词级时间戳，回退到段落模式，但也做一下基础过滤
            if not hasattr(segment, "words") or segment.words is None or len(segment.words) == 0:
                if self.is_valid_lyric_text(seg_text, params.get("initial_prompt")):
                    transcriptions.append({
                        "start": round(float(segment.start), 2),
                        "end": round(float(segment.end), 2),
                        "text": seg_text
                    })
                continue

            # 基于 word timestamps 做更细颗粒切分
            buffer_words = []
            line_start = None

            valid_words = []
            for word in segment.words:
                w_text = self.clean_text(getattr(word, "word", ""))
                w_start = float(getattr(word, "start", 0.0) or 0.0)
                w_end = float(getattr(word, "end", w_start) or w_start)

                if not w_text:
                    continue

                valid_words.append({
                    "text": w_text,
                    "start": w_start,
                    "end": w_end,
                })

            if not valid_words:
                continue

            for i, word in enumerate(valid_words):
                w_text = word["text"]
                w_start = word["start"]
                w_end = word["end"]

                if line_start is None:
                    line_start = w_start

                prev_word = valid_words[i - 1] if i > 0 else None
                time_gap = w_start - prev_word["end"] if prev_word else 0.0

                current_text = "".join(x["text"] for x in buffer_words)
                next_text = current_text + w_text
                next_duration = w_end - line_start

                should_break_before = False

                # 1) 停顿过长：在当前词之前切开
                if buffer_words and time_gap > max_gap:
                    should_break_before = True

                # 2) 加上当前词后字数超限：在当前词之前切开
                if buffer_words and len(next_text) > max_chars:
                    should_break_before = True

                # 3) 加上当前词后时长超限：在当前词之前切开
                if buffer_words and next_duration > max_segment_duration:
                    should_break_before = True

                if should_break_before:
                    piece = self.build_piece(buffer_words, params.get("initial_prompt"))
                    if piece is not None:
                        transcriptions.append(piece)

                    buffer_words = []
                    line_start = w_start

                buffer_words.append(word)

                # 4) 标点后自然切开
                if split_on_punctuation:
                    merged = "".join(x["text"] for x in buffer_words)
                    last_char = merged[-1] if merged else ""

                    # 只有达到一定长度，或者后面有停顿时，才在标点后切
                    next_gap = 0.0
                    if i < len(valid_words) - 1:
                        next_gap = valid_words[i + 1]["start"] - w_end

                    if last_char in "，,。！？!?；;：:":
                        if len(merged) >= max(4, max_chars // 2) or next_gap > 0.18:
                            piece = self.build_piece(buffer_words, params.get("initial_prompt"))
                            if piece is not None:
                                transcriptions.append(piece)
                            buffer_words = []
                            line_start = None

            # 写入最后一段
            if buffer_words:
                piece = self.build_piece(buffer_words, params.get("initial_prompt"))
                if piece is not None:
                    transcriptions.append(piece)

        # 最后做一次轻量整理
        transcriptions = self.normalize_segments(transcriptions)

        return (transcriptions,)

    def build_piece(self, words: List[Dict], initial_prompt=None):
        if not words:
            return None

        text = self.clean_text("".join(w["text"] for w in words))
        start = round(float(words[0]["start"]), 2)
        end = round(float(words[-1]["end"]), 2)

        if end <= start:
            return None

        if not self.is_valid_lyric_text(text, initial_prompt):
            return None

        return {
            "start": start,
            "end": end,
            "text": text
        }

    @staticmethod
    def preprocess_audio(audio):
        import torchaudio.functional as F

        waveform = audio["waveform"]
        sample_rate = audio["sample_rate"]

        if waveform.dim() == 3:
            waveform = waveform.squeeze(0)

        if waveform.dim() == 2 and waveform.shape[0] > 1:
            waveform = waveform.mean(dim=0, keepdim=True)

        if sample_rate != 16000:
            waveform = F.resample(waveform, orig_freq=sample_rate, new_freq=16000)

        return waveform.squeeze().detach().cpu().numpy().astype(np.float32)

    @staticmethod
    def collect_params(params):
        params = dict(params)

        for key in ["language", "prefix", "hotwords", "initial_prompt"]:
            if key in params and (params[key] == "auto" or not params[key]):
                params[key] = None

        if "suppress_tokens" in params:
            value = params["suppress_tokens"]
            try:
                if isinstance(value, str):
                    value = value.strip()
                    if not value:
                        params["suppress_tokens"] = [-1]
                    else:
                        params["suppress_tokens"] = ast.literal_eval(value)
                elif value is None:
                    params["suppress_tokens"] = [-1]
            except Exception:
                params["suppress_tokens"] = [-1]

        if params.get("max_new_tokens") == INT_NONE_VALUE:
            params["max_new_tokens"] = None
        if params.get("chunk_length") == INT_NONE_VALUE:
            params["chunk_length"] = None
        if params.get("hallucination_silence_threshold") == FLOAT_NONE_VALUE:
            params["hallucination_silence_threshold"] = None
        if params.get("language_detection_threshold") == FLOAT_NONE_VALUE:
            params["language_detection_threshold"] = None

        return params

    @staticmethod
    def clean_text(text: str) -> str:
        if text is None:
            return ""
        text = str(text).replace("\u3000", " ")
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def contains_chinese(text: str) -> bool:
        if not text:
            return False
        return bool(re.search(r"[\u4e00-\u9fff]", text))

    def is_valid_lyric_text(self, text: str, initial_prompt=None) -> bool:
        text = self.clean_text(text)
        if not text:
            return False

        # 提示词泄漏过滤
        if initial_prompt:
            prompt = self.clean_text(initial_prompt)
            if prompt:
                if len(text) >= 4 and text in prompt:
                    return False

        NON_LYRIC_PATTERNS = [
            "中文字幕",
            "字幕组",
            "中文字幕组",
            "中文字幕小组",
            "双语字幕",
            "听译",
            "校对",
            "压制",
            "上传",
            "感谢观看",
            "版权所有",
        ]
        if any(p in text for p in NON_LYRIC_PATTERNS):
            return False
        
        META_KEYWORDS = [
            "作词", "作曲", "编曲", "混音", "母带", "录音",
            "制作人", "监制", "出品", "发行"
        ]
        if any(k in text for k in META_KEYWORDS):
            return False
        
        if(len(text) <= 2):
            return False
            
        return True

    @classmethod
    def normalize_segments(cls, items: List[Dict]) -> List[Dict]:
        """
        轻量规范化：
        1. 排序
        2. 去掉空段
        3. 修复轻微重叠
        4. 合并同文本且几乎无缝衔接的小碎片
        """
        if not items:
            return []

        items = sorted(items, key=lambda x: (float(x["start"]), float(x["end"])))
        normalized = []

        for seg in items:
            start = float(seg["start"])
            end = float(seg["end"])
            text = cls.clean_text(seg["text"])

            if end <= start or not text:
                continue

            if not normalized:
                normalized.append({
                    "start": round(start, 2),
                    "end": round(end, 2),
                    "text": text,
                })
                continue

            prev = normalized[-1]

            # 同一句并且几乎挨着，就合并
            if (
                cls.clean_text(prev["text"]) == text
                and abs(start - float(prev["end"])) <= 0.12
            ):
                prev["end"] = round(max(float(prev["end"]), end), 2)
                continue

            # 轻微重叠修正
            if start < float(prev["end"]) < end:
                start = float(prev["end"])

            if end <= start:
                continue

            normalized.append({
                "start": round(start, 2),
                "end": round(end, 2),
                "text": text,
            })

        return normalized
```

---

## LyricsToTitle

```python
def load_config_data() -> dict:
    """
    从外部JSON配置文件加载停用词、情感词汇和歌名模板
    
    配置文件路径：lyrics_to_title_data.json（与py文件同目录）
    
    返回:
        包含stopwords、sentiment_keywords、title_templates的字典
    """
    # 获取当前文件所在目录
    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(base_dir, "lyrics_to_title_data.json")
    
    # 尝试读取配置文件
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    
    # 如果配置文件读取失败，返回空字典
    return {}


# 加载配置数据
CONFIG_DATA = load_config_data()

# 从配置中获取停用词，如果失败则使用默认空集合
STOPWORDS = set(CONFIG_DATA.get("stopwords", []))

# 从配置中获取情感关键词
SENTIMENT_KEYWORDS = CONFIG_DATA.get("sentiment_keywords", {
    "positive": {"high": [], "medium": []},
    "negative": {"high": [], "medium": []},
    "neutral": []
})

# 从配置中获取歌名模板
TITLE_TEMPLATES = CONFIG_DATA.get("title_templates", {
    "positive": [],
    "negative": [],
    "neutral": []
})


# 正则表达式：匹配常见Emoji表情符号
# 用于在预处理阶段移除歌词中的表情符号
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # 笑脸表情
    "\U0001F300-\U0001F5FF"  # 符号和图案
    "\U0001F680-\U0001F6FF"  # 交通和地图符号
    "\U0001F1E0-\U0001F1FF"  # 国旗
    "\U00002702-\U000027B0"  # 符号
    "\U000024C2-\U0001F251"  # 封闭式字母
    "]+", flags=re.UNICODE
)


def clean_lyrics(text: str) -> str:
    """
    清洗歌词文本，去除干扰信息
    
    处理步骤：
        1. 移除方括号[]内容（如[00:00]时间戳、[合唱]等标签）
        2. 移除圆括号()内容
        3. 移除花括号{}内容
        4. 移除数字（纯数字和时间戳如x2等）
        5. 只保留中文字符和英文字母
    
    参数:
        text: 原始歌词文本
        
    返回:
        清洗后的歌词文本
    """
    # 移除方括号[]及其内容（歌词中常见标签如[00:00]、[合唱]等）
    text = re.sub(r"\[.*?\]", "", text)
    # 移除圆括号()及其内容
    text = re.sub(r"\(.*?\)", "", text)
    # 移除花括号{}及其内容
    text = re.sub(r"\{.*?\}", "", text)
    # 移除时间戳格式 [00:00]
    text = re.sub(r"\[\d+:\d+\]", "", text)
    # 移除重复标记如 x2、x3
    text = re.sub(r"x\d+", "", text)
    # 移除所有纯数字
    text = re.sub(r"\d+", "", text)
    return text.strip()


def extract_keywords(lyrics: str, topk: int = 20) -> list[tuple[str, float]]:
    """
    使用jieba的TF-IDF算法提取关键词
    
    算法说明：
        - TF-IDF是一种统计方法，用于评估一个词对于一个文档的重要程度
        - 重要程度随词在该文档中出现的次数成正比
        - 随其在语料库中出现的频率成反比
    
    参数:
        lyrics: 清洗后的歌词文本
        topk: 返回前k个最重要的关键词，默认20个
        
    返回:
        关键词列表，每个元素为(词语, 权重)元组
    """
    if not JIEBA_AVAILABLE:
        return []
    
    # 使用jieba.analyse.extract_tags提取关键词
    # withWeight=True返回关键词及其权重
    keywords = jieba.analyse.extract_tags(lyrics, topK=topk, withWeight=True)
    return keywords


def extract_keyphrases(lyrics: str) -> list[str]:
    """
    提取歌词中的二字短语
    
    实现逻辑：
        1. 使用jieba分词将歌词分割成词语列表
        2. 过滤掉停用词和单字
        3. 组合相邻的两个有效词语形成短语
        4. 筛选长度为2-8字的短语
    
    参数:
        lyrics: 清洗后的歌词文本
        
    返回:
        符合条件的短语列表
    """
    if not JIEBA_AVAILABLE:
        return []
    
    # jieba分词
    words = jieba.cut(lyrics)
    # 过滤：保留长度>=2且不在停用词中的词语
    word_list = [w for w in words if len(w) >= 2 and w not in STOPWORDS]
    
    phrases = []
    # 遍历词语列表，将相邻的两个词组合成短语
    for i in range(len(word_list) - 1):
        # 如果下一个词也不是停用词，则组合成短语
        if word_list[i+1] not in STOPWORDS:
            phrase = word_list[i] + word_list[i+1]
            # 短语长度需在2-8字之间（符合歌名长度要求）
            if 2 <= len(phrase) <= 8:
                phrases.append(phrase)
    
    return phrases


def analyze_sentiment(lyrics: str) -> str:
    """
    分析歌词的情感倾向
    
    实现逻辑：
        1. 统计正面情感词汇的出现次数（高权重词*2 + 中权重词*1）
        2. 统计负面情感词汇的出现次数
        3. 比较正负得分，判断整体情感倾向
    
    参数:
        lyrics: 清洗后的歌词文本
        
    返回:
        情感分类字符串: "positive"(正面)、"negative"(负面)、"neutral"(中性)
    """
    lyrics_lower = lyrics.lower()
    pos_count = 0  # 正面情感得分
    neg_count = 0  # 负面情感得分
    
    # 获取情感关键词配置
    positive_high = SENTIMENT_KEYWORDS.get("positive", {}).get("high", [])
    positive_medium = SENTIMENT_KEYWORDS.get("positive", {}).get("medium", [])
    negative_high = SENTIMENT_KEYWORDS.get("negative", {}).get("high", [])
    negative_medium = SENTIMENT_KEYWORDS.get("negative", {}).get("medium", [])
    
    # 统计高权重正面词汇（权重*2）
    for word in positive_high:
        pos_count += lyrics.count(word) * 2
    # 统计中权重正面词汇（权重*1）
    for word in positive_medium:
        pos_count += lyrics.count(word)
    
    # 统计高权重负面词汇（权重*2）
    for word in negative_high:
        neg_count += lyrics.count(word) * 2
    # 统计中权重负面词汇（权重*1）
    for word in negative_medium:
        neg_count += lyrics.count(word)
    
    # 判断情感倾向
    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    else:
        return "neutral"


def generate_title_by_sentiment(sentiment: str) -> str:
    """
    根据情感倾向生成歌名（情感分析备选方案）
    
    当无法从歌词中提取有效关键词时使用此函数
    根据分析出的情感类型，从配置文件的模板中随机选择歌名
    
    参数:
        sentiment: 情感类型 ("positive"/"negative"/"neutral")
        
    返回:
        符合情感氛围的歌名
    """
    import random
    
    # 从配置文件获取对应情感类型的模板
    templates = TITLE_TEMPLATES.get(sentiment, [])
    
    # 如果模板为空，返回默认歌名
    if not templates:
        if sentiment == "positive":
            return "美好时光"
        elif sentiment == "negative":
            return "心碎时刻"
        else:
            return "岁月如歌"
    
    return random.choice(templates)


def select_best_title(lyrics: str) -> str:
    """
    选择最佳歌名的核心算法
    
    算法流程：
        1. 清洗歌词文本
        2. 提取关键词（TF-IDF）和短语
        3. 为每个候选词计算综合权重
        4. 筛选权重最高的候选词
        5. 如果没有符合条件的候选词，使用情感分析生成歌名
    
    参数:
        lyrics: 原始歌词文本
        
    返回:
        最佳歌名（1-8字）
    """
    # 第一步：清洗歌词
    cleaned = clean_lyrics(lyrics)
    # 第二步：提取关键词和短语
    keywords = extract_keywords(cleaned)
    phrases = extract_keyphrases(cleaned)
    
    # 第三步：构建候选词及其权重
    candidates = {}
    
    # 处理关键词：权重*1.5（提高关键词优先级）
    for word, weight in keywords:
        if 1 <= len(word) <= 8 and word not in STOPWORDS:
            candidates[word] = weight * 1.5
    
    # 处理短语：使用词频作为权重
    phrase_counts = Counter(phrases)
    for phrase, count in phrase_counts.items():
        if phrase in candidates:
            # 如果短语已存在，取较高权重
            candidates[phrase] = max(candidates[phrase], count * 1.0)
        else:
            candidates[phrase] = count * 1.0
    
    # 第四步：选择最佳候选
    if candidates:
        # 找出最高权重
        max_weight = max(candidates.values())
        # 筛选权重接近最高值的候选词（允许0.01的浮动范围）
        best_candidates = [k for k, v in candidates.items() if abs(v - max_weight) < 0.01]
        
        # 从最佳候选中随机选择
        if best_candidates:
            import random
            return random.choice(best_candidates)
    
    # 第五步：无法提取有效关键词时，使用情感分析
    sentiment = analyze_sentiment(cleaned)
    return generate_title_by_sentiment(sentiment)

class LyricsToTitle:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "lyrics": ("STRING", {"multiline": True, "default": ""}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("title",)
    FUNCTION = "generate_title"
    CATEGORY = "text/title"

    def generate_title(self, lyrics):
        if not lyrics or not lyrics.strip():
            # YYMusic Song [时间戳]
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            return ("YYMusic Song " + timestamp,)
        title = select_best_title(lyrics)
        
        if len(title) > 8:
            title = title[:8]
        
        return (title,)
```

