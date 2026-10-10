# 🎂 Thiệp sinh nhật Hữu Lãm

**Thiệp trực tiếp (GitHub Pages):** https://nghiaharu.github.io/birthday/

Thiệp 3D dành riêng cho **Hữu Lãm**, được tùy biến từ [Vuiver/thiep-chuc-mung](https://github.com/Vuiver/thiep-chuc-mung).

## Nội dung

- 🎉 50 lời chúc sinh nhật bằng tiếng Việt.
- 📷 Ảnh Hữu Lãm dùng làm ảnh nền và khung Polaroid 3D.
- 🎂 Bánh sinh nhật, quà, gấu bông, hoa và bóng bay tương tác.
- 🎵 Nhạc sinh nhật, pháo giấy và hiệu ứng 3D.
- 📱 Hỗ trợ trên điện thoại và máy tính.

## Cấu hình

Chỉnh người nhận và lời chúc trong `config.js`, giữ định dạng `window.CARD_CONFIG = {...}`.

**Ảnh chất lượng cao:** tải ảnh gốc `huu-lam.jpg` (1290×1738) lên thư mục gốc của repo bằng giao diện **Add file → Upload files → Commit changes**. `index.html` và `config.js` đã cấu hình ưu tiên ảnh JPG, và tự dùng bản `huu-lam.svg` nếu JPG chưa có. Không cần sửa lại code sau khi tải ảnh lên.

Trang sử dụng Three.js và nhạc nền từ mẫu gốc. Trên điện thoại, có thể cần chạm vào màn hình để bật nhạc.

## Bật GitHub Pages

Vào **Settings → Pages → Build and deployment** → `Deploy from a branch` → `main`, `/(root)` → **Save**.

## Nguồn

Chỉnh sửa từ [Vuiver/thiep-chuc-mung](https://github.com/Vuiver/thiep-chuc-mung). Ghi nhận tác giả gốc và giữ tinh thần của dự án.
