
#!/usr/bin/env python3
"""
Batch-normalize game audio (music & SFX) using the `ffmpeg-normalize` tool.

This script wraps the `ffmpeg-normalize` CLI to give you:
  - Separate loudness targets for music vs SFX (e.g., -18 vs -16 LUFS)
  - True-peak limiting
  - Preserved folder structure in a single output root
  - Consistent output codec/bitrate/sample rate

Requirements:
  - Python 3.8+
  - ffmpeg installed and on PATH (https://ffmpeg.org/)
  - ffmpeg-normalize (`pip install ffmpeg-normalize`)

Usage examples:
  # Normalize ./music and ./sfx with defaults into ./normalized_out
  python normalize_with_ffmpeg_normalize.py --music ./music --sfx ./sfx

  # Custom targets and output audio settings
  python normalize_with_ffmpeg_normalize.py \
    --music ./bgm --sfx ./sfx \
    --music-lufs -18 --sfx-lufs -16 --true-peak -1 \
    --out ./game_audio_out --bitrate 192k --ar 48000 --codec libmp3lame

  # Dry run
  python normalize_with_ffmpeg_normalize.py --music ./music --sfx ./sfx --dry-run

Notes:
  - Output filenames keep original names, placed under {out_root}/music/... and {out_root}/sfx/...
  - Input can be any format ffmpeg reads; output codec defaults to MP3 (libmp3lame).
  - We invoke the external `ffmpeg-normalize` tool per file to have predictable output paths.
"""

import argparse
import shutil
import subprocess
from pathlib import Path
from typing import List

SUPPORTED_EXTS = {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".aiff", ".aif", ".opus", ".wma"}

def require(cmd: str, check_args: list[str]) -> None:
    exe = shutil.which(cmd)
    if not exe:
        raise RuntimeError(f"'{cmd}' not found on PATH. Please install it and ensure it's available in your shell.")
    try:
        subprocess.run([cmd] + check_args, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        # still consider it present; just ignore non-zero exit for --version on some builds
        pass

def collect_files(paths: List[Path]) -> List[Path]:
    files: List[Path] = []
    for p in paths:
        if not p.exists():
            continue
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS:
            files.append(p)
        elif p.is_dir():
            for f in p.rglob("*"):
                if f.is_file() and f.suffix.lower() in SUPPORTED_EXTS:
                    files.append(f)
    return files

def rel_under_any(file: Path, roots: List[Path]) -> Path:
    for r in roots:
        try:
            return file.relative_to(r)
        except Exception:
            continue
    return Path(file.name)

def normalize_file(
    infile: Path,
    outfile: Path,
    target_lufs: float,
    true_peak: float,
    codec: str,
    bitrate: str,
    samplerate: int,
    dry_run: bool
) -> None:
    outfile.parent.mkdir(parents=True, exist_ok=True)
    # Compose ffmpeg-normalize command.
    # Use equals for long args to be compatible across versions; also include short -t where supported.
    cmd = [
        "ffmpeg-normalize", str(infile),
        "-o", str(outfile),
        "-c:a", codec,
        "-b:a", str(bitrate),
        "-ar", str(samplerate),
        "-t", str(target_lufs),
        "--true-peak", str(true_peak),
    ]
    print("    $", " ".join(map(str, cmd)))
    if dry_run:
        return
    # Run and stream stderr for progress if available
    proc = subprocess.run(cmd, text=True, capture_output=True)
    if proc.returncode != 0:
        # Surface helpful error
        raise RuntimeError(f"ffmpeg-normalize failed for '{infile}':\n{proc.stderr}\n{proc.stdout}")

def main():
    ap = argparse.ArgumentParser(description="Normalize music and SFX with ffmpeg-normalize.")
    ap.add_argument("--music", nargs="*", type=Path, default=[], help="Folders/files containing background music.")
    ap.add_argument("--sfx", nargs="*", type=Path, default=[], help="Folders/files containing sound effects.")
    ap.add_argument("--out", type=Path, default=Path("./normalized_out"), help="Output root directory.")

    ap.add_argument("--music-lufs", type=float, default=-18.0, help="Integrated LUFS target for music (default: -18.0).")
    ap.add_argument("--sfx-lufs", type=float, default=-16.0, help="Integrated LUFS target for SFX (default: -16.0).")
    ap.add_argument("--true-peak", type=float, default=-1.0, help="True-peak ceiling in dBTP (default: -1.0).")

    ap.add_argument("--codec", type=str, default="libmp3lame", help="Output audio codec (default: libmp3lame).")
    ap.add_argument("--bitrate", type=str, default="192k", help="Output audio bitrate (default: 192k).")
    ap.add_argument("--ar", type=int, default=48000, help="Output sample rate in Hz (default: 48000).")

    ap.add_argument("--skip-existing", action="store_true", default=True, help="Skip files that already exist in output.")
    ap.add_argument("--no-skip-existing", dest="skip_existing", action="store_false", help="Do not skip existing files.")
    ap.add_argument("--dry-run", action="store_true", help="List operations without writing files.")

    args = ap.parse_args()

    if not args.music and not args.sfx:
        ap.error("Provide at least one --music or --sfx path.")

    # Check dependencies
    require("ffmpeg", ["-version"])
    require("ffmpeg-normalize", ["--help"])

    music_files = collect_files(args.music)
    sfx_files = collect_files(args.sfx)

    print(f"[music] {len(music_files)} file(s) found. Target: {args.music_lufs} LUFS, TP {args.true_peak} dBTP")
    for f in music_files:
        rel = rel_under_any(f, args.music)
        # force .mp3 extension if codec is libmp3lame
        out_ext = ".mp3" if args.codec == "libmp3lame" else f.suffix.lower()
        out_file = args.out / "music" / rel.with_suffix(out_ext)
        if args.skip_existing and out_file.exists():
            print(f"  - Skipping (exists): {out_file}")
            continue
        print(f"  - {f} -> {out_file}")
        try:
            normalize_file(
                f, out_file,
                target_lufs=args.music_lufs,
                true_peak=args.true_peak,
                codec=args.codec,
                bitrate=args.bitrate,
                samplerate=args.ar,
                dry_run=args.dry_run
            )
        except Exception as e:
            print(f"    ! Error: {e}")

    print(f"[sfx] {len(sfx_files)} file(s) found. Target: {args.sfx_lufs} LUFS, TP {args.true_peak} dBTP")
    for f in sfx_files:
        rel = rel_under_any(f, args.sfx)
        out_ext = ".mp3" if args.codec == "libmp3lame" else f.suffix.lower()
        out_file = args.out / "sfx" / rel.with_suffix(out_ext)
        if args.skip_existing and out_file.exists():
            print(f"  - Skipping (exists): {out_file}")
            continue
        print(f"  - {f} -> {out_file}")
        try:
            normalize_file(
                f, out_file,
                target_lufs=args.sfx_lufs,
                true_peak=args.true_peak,
                codec=args.codec,
                bitrate=args.bitrate,
                samplerate=args.ar,
                dry_run=args.dry_run
            )
        except Exception as e:
            print(f"    ! Error: {e}")

    print("\nDone.")

if __name__ == "__main__":
    main()
