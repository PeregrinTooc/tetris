
#!/usr/bin/env python3
"""
Batch-normalize game audio (music & SFX) with EBU R128 (LUFS) using ffmpeg's loudnorm (two-pass).

Requirements:
  - Python 3.8+
  - ffmpeg installed and available on PATH (https://ffmpeg.org/)

Usage examples:
  - Normalize all files in ./music and ./sfx with defaults:
        python normalize_audio.py --music ./music --sfx ./sfx
  - Custom targets (e.g., music -18 LUFS, SFX -16 LUFS, true peak -1 dBTP):
        python normalize_audio.py --music ./music --sfx ./sfx --music-lufs -18 --sfx-lufs -16 --true-peak -1
  - Process a single folder as "music":
        python normalize_audio.py --music ./bgm --out ./out_bgm
  - Dry run to see what would be processed:
        python normalize_audio.py --music ./music --sfx ./sfx --dry-run

Notes:
  - Output preserves folder structure under the chosen --out directory (default: ./normalized_out).
  - MP3 is re-encoded; you can set --bitrate and --ar (sample rate). For lossless intermediates, consider WAV input.
  - The script skips files that look like already-normalized outputs if --skip-existing is set (default True).
  - Supported inputs: anything ffmpeg can read (.mp3, .wav, .flac, .ogg, .m4a, etc.). Output codec defaults to MP3.
"""

import argparse
import json
import os
import re
import shlex
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple, Optional

def run(cmd: List[str]) -> Tuple[int, str, str]:
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = proc.communicate()
    return proc.returncode, out, err

def find_ffmpeg() -> None:
    code, out, err = run(["ffmpeg", "-version"])
    if code != 0:
        raise RuntimeError("ffmpeg not found on PATH. Please install ffmpeg and ensure it's available in your shell.")

def first_pass_json(in_path: Path, I: float, LRA: float, TP: float) -> Dict:
    # Run loudnorm first pass, capture JSON from stderr (ffmpeg prints to stderr).
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-y",
        "-i", str(in_path),
        "-af", f"loudnorm=I={I}:LRA={LRA}:TP={TP}:print_format=json",
        "-f", "null", "-"
    ]
    code, out, err = run(cmd)
    if code != 0:
        raise RuntimeError(f"First pass failed for {in_path.name}:\n{err}")
    # Extract the JSON object from stderr
    # ffmpeg prints something like:
    # {
    #     "input_i" : "-27.83",
    #     "input_tp" : "-2.05",
    #     "input_lra" : "8.97",
    #     "input_thresh" : "-38.12",
    #     "output_i" : "-18.00",
    #     "output_tp" : "-1.16",
    #     "output_lra" : "6.45",
    #     "output_thresh" : "-28.73",
    #     "normalization_type" : "dynamic",
    #     "target_offset" : "0.04"
    # }
    json_match = re.search(r"\{\s*\"input_i\".*?\}", err, re.S)
    if not json_match:
        # Sometimes ffmpeg prints to stdout; try there too
        json_match = re.search(r"\{\s*\"input_i\".*?\}", out, re.S)
    if not json_match:
        raise RuntimeError(f"Could not parse loudnorm JSON for {in_path.name}.")
    return json.loads(json_match.group(0))

def second_pass(in_path: Path, out_path: Path, I: float, LRA: float, TP: float, measure: Dict,
                ar: int, bitrate: str, codec: str) -> None:
    # Build the loudnorm filter with measured values
    # Using two-pass with linear=true for consistent gain application and true peak management.
    ln = (
        f"loudnorm=I={I}:LRA={LRA}:TP={TP}"
        f":measured_I={measure['input_i']}"
        f":measured_LRA={measure['input_lra']}"
        f":measured_TP={measure['input_tp']}"
        f":measured_thresh={measure['input_thresh']}"
        f":offset={measure.get('target_offset', '0.0')}"
        f":linear=true:print_format=summary"
    )
    # Ensure output directory exists
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Choose codec; default to libmp3lame for mp3
    acodec = codec
    # Assemble ffmpeg command
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-y",
        "-i", str(in_path),
        "-ar", str(ar),
        "-af", ln,
        "-c:a", acodec,
        "-b:a", bitrate,
        str(out_path)
    ]
    code, out, err = run(cmd)
    if code != 0:
        raise RuntimeError(f"Second pass failed for {in_path.name}:\n{err}")

def is_audio_file(p: Path) -> bool:
    return p.suffix.lower() in {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".aiff", ".aif", ".wma", ".opus"}

def rel_to_root(root: Path, file: Path) -> Path:
    try:
        return file.relative_to(root)
    except ValueError:
        # If file isn't inside root, just return basename
        return Path(file.name)

def collect_files(roots: List[Path]) -> List[Path]:
    files = []
    for r in roots:
        if not r.exists():
            continue
        if r.is_file() and is_audio_file(r):
            files.append(r)
        else:
            files.extend([p for p in r.rglob("*") if p.is_file() and is_audio_file(p)])
    return files

def normalize_group(files: List[Path], group_name: str, I: float, LRA: float, TP: float,
                    out_root: Path, in_root_list: List[Path], ar: int, bitrate: str,
                    codec: str, skip_existing: bool, dry_run: bool) -> None:
    if not files:
        print(f"[{group_name}] No files found.")
        return
    print(f"[{group_name}] {len(files)} file(s) to process. Target: I={I} LUFS, LRA={LRA}, TP={TP} dBTP")
    for f in files:
        # Compute relative path under any of the provided roots
        rel = None
        for r in in_root_list:
            if r.exists():
                try:
                    rel = f.relative_to(r)
                    break
                except ValueError:
                    continue
        if rel is None:
            rel = Path(f.name)
        # Force .mp3 extension if codec is libmp3lame
        out_ext = ".mp3" if codec == "libmp3lame" else f.suffix.lower()
        out_path = out_root / group_name / rel.with_suffix(out_ext)
        if skip_existing and out_path.exists():
            print(f"  - Skipping (exists): {out_path}")
            continue
        print(f"  - {f} -> {out_path}")
        if dry_run:
            continue
        try:
            measure = first_pass_json(f, I, LRA, TP)
            second_pass(f, out_path, I, LRA, TP, measure, ar=ar, bitrate=bitrate, codec=codec)
        except Exception as e:
            print(f"    ! Error: {e}")

def main():
    parser = argparse.ArgumentParser(description="Normalize game audio (music/SFX) to LUFS with ffmpeg loudnorm (two-pass).")
    parser.add_argument("--music", nargs="*", type=Path, default=[], help="Folders/files containing background music.")
    parser.add_argument("--sfx", nargs="*", type=Path, default=[], help="Folders/files containing sound effects.")
    parser.add_argument("--out", type=Path, default=Path("./normalized_out"), help="Output root folder.")
    parser.add_argument("--music-lufs", type=float, default=-18.0, help="Integrated LUFS target for music (default: -18.0).")
    parser.add_argument("--sfx-lufs", type=float, default=-16.0, help="Integrated LUFS target for SFX (default: -16.0).")
    parser.add_argument("--lra", type=float, default=11.0, help="Target loudness range (LRA) in LU (default: 11.0).")
    parser.add_argument("--true-peak", type=float, default=-1.0, help="True peak ceiling in dBTP (default: -1.0).")
    parser.add_argument("--ar", type=int, default=48000, help="Output sample rate (default: 48000 Hz).")
    parser.add_argument("--bitrate", type=str, default="192k", help="Output audio bitrate (default: 192k).")
    parser.add_argument("--codec", type=str, default="libmp3lame", help="Audio codec for output (default: libmp3lame).")
    parser.add_argument("--skip-existing", action="store_true", default=True, help="Skip files that already exist in output.")
    parser.add_argument("--no-skip-existing", dest="skip_existing", action="store_false", help="Do not skip existing files.")
    parser.add_argument("--dry-run", action="store_true", help="List what would be processed without writing files.")
    args = parser.parse_args()

    if not args.music and not args.sfx:
        parser.error("Provide at least one --music or --sfx path.")

    find_ffmpeg()

    music_files = collect_files(args.music)
    sfx_files = collect_files(args.sfx)

    # Normalize each group with its own targets
    normalize_group(
        music_files, "music", I=args.music_lufs, LRA=args.lra, TP=args.true_peak,
        out_root=args.out, in_root_list=args.music, ar=args.ar, bitrate=args.bitrate, codec=args.codec,
        skip_existing=args.skip_existing, dry_run=args.dry_run
    )
    normalize_group(
        sfx_files, "sfx", I=args.sfx_lufs, LRA=args.lra, TP=args.true_peak,
        out_root=args.out, in_root_list=args.sfx, ar=args.ar, bitrate=args.bitrate, codec=args.codec,
        skip_existing=args.skip_existing, dry_run=args.dry_run
    )

    print("\nDone.")

if __name__ == "__main__":
    main()
