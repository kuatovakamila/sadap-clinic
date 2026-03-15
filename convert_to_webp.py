from PIL import Image
import os

SOURCE_BASE = "client/public/images"
DEST_BASE = "client/public/images2"

FOLDER_MAP = {
    "1": "12",
    "2": "22",
    "3": "32",
}

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def convert_folder(src_folder, dst_folder):
    os.makedirs(dst_folder, exist_ok=True)

    files = [
        f for f in os.listdir(src_folder)
        if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS
    ]
    total = len(files)

    for idx, filename in enumerate(sorted(files), start=1):
        src_path = os.path.join(src_folder, filename)
        stem = os.path.splitext(filename)[0]
        dst_path = os.path.join(dst_folder, stem + ".webp")

        with Image.open(src_path) as img:
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            img.save(dst_path, format="WEBP", quality=75, method=6)

        print(f"  [{idx}/{total}] {filename} → {stem}.webp")

    return total


def main():
    total_converted = 0

    for src_name, dst_name in FOLDER_MAP.items():
        src_folder = os.path.join(SOURCE_BASE, src_name)
        dst_folder = os.path.join(DEST_BASE, dst_name)

        if not os.path.isdir(src_folder):
            print(f"Skipping folder '{src_name}' — not found at {src_folder}")
            continue

        print(f"\nConverting folder {src_name} → {dst_name}:")
        count = convert_folder(src_folder, dst_folder)
        print(f"  Done: {count} files converted.")
        total_converted += count

    print(f"\n✓ Total files converted: {total_converted}")


if __name__ == "__main__":
    main()
