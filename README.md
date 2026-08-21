# EduPulse Quantum OS

Hệ thống quản trị giáo dục tích hợp AI — backend + frontend đầy đủ, kết nối trực tiếp với nhau, đóng gói sẵn để chạy trên máy tính và điện thoại (PWA - có thể "Cài đặt vào màn hình chính").

## Tính năng chính

- **Quản lý tài khoản (Admin):** tạo tài khoản, nâng cấp/hạ cấp vai trò (student/teacher/admin), khoá/mở khoá, đặt lại mật khẩu, xoá tài khoản.
- **Trường & Lớp học:** tạo trường có logo, tạo lớp học, gán học sinh vào lớp.
- **Điểm danh học vụ:** điểm danh theo lớp/ngày, trạng thái Có mặt/Đi trễ/Có phép/Vắng.
- **AI IDE & Lập trình:** trình soạn thảo Monaco, chạy code trực tiếp với hơn 30 ngôn ngữ lập trình (JavaScript, Python, Java, C, C++, C#, Go, PHP, Ruby, Rust, TypeScript, Kotlin, Swift, Dart, Bash...) thông qua Piston API, kèm gợi ý phân tích nhanh.
- **Học Tiếng Anh:** bài học từ vựng theo trình độ, chế độ flashcard lật thẻ.
- **Mạng xã hội nội bộ:** đăng bài kèm ảnh, thích, bình luận, trò chuyện thời gian thực (WebSocket) giống Messenger.
- **Dự án & Website:** tạo dự án HTML/CSS/JS, công khai thành trang web thật với đường dẫn `/p/ten-du-an` (khi triển khai qua HTTPS, đây chính là trang web công khai của dự án).
- **Cửa hàng tiện ích mở rộng:** cài đặt/gỡ các tiện ích bổ sung cho tài khoản.
- **Cài đặt tài khoản:** hồ sơ cá nhân, ảnh đại diện, đổi mật khẩu, giao diện sáng/tối, tuỳ chọn thông báo.
- **Đa nền tảng:** giao diện responsive, cài đặt được như ứng dụng (PWA) trên cả máy tính và điện thoại.

## Cấu trúc thư mục

```
edupulse/
├── backend/            # API server (Node.js + Express, JSON file DB - không cần cài đặt native)
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   ├── middleware/
│   ├── data/            # db.json được tự tạo khi chạy lần đầu
│   └── uploads/          # avatar, logo, ảnh bài đăng
└── frontend/            # Giao diện web tĩnh (HTML + Tailwind), gọi API qua fetch/WebSocket
    ├── index.html         # Đăng nhập + Bảng điều khiển
    ├── admin.html          # Quản lý tài khoản
    ├── academic.html       # Trường & Lớp học
    ├── attendance.html     # Điểm danh
    ├── ide.html            # AI IDE
    ├── english.html        # Học tiếng Anh
    ├── social.html         # Mạng xã hội + chat
    ├── projects.html       # Dự án & Website
    ├── store.html          # Cửa hàng tiện ích
    ├── settings.html       # Cài đặt tài khoản
    ├── manifest.json / sw.js  # Hỗ trợ cài đặt PWA
    └── assets/
```

## Đưa dự án lên GitHub

```bash
cd edupulse
git init
git add .
git commit -m "Initial commit - EduPulse Quantum OS"
git branch -M main
git remote add origin https://github.com/<ten-cua-ban>/<ten-repo>.git
git push -u origin main
```

Repo đã có sẵn 2 workflow GitHub Actions trong `.github/workflows/`:

- **`backend-ci.yml`** — mỗi lần push/PR đụng tới `backend/`, tự động `npm install`, kiểm tra cú pháp toàn bộ route, và khởi động thử server để chắc chắn không lỗi trước khi merge.
- **`deploy-pages.yml`** — mỗi lần push vào nhánh `main` (đụng tới `frontend/`), tự động deploy thư mục `frontend/` lên **GitHub Pages**. Để bật:
  1. Vào repo trên GitHub → **Settings → Pages** → mục "Build and deployment" chọn **Source: GitHub Actions**.
  2. Push code lên `main`, workflow sẽ tự chạy và cho bạn 1 link dạng `https://<ten-cua-ban>.github.io/<ten-repo>/`.
  3. **Trước khi push**, nhớ deploy `backend/` (xem mục bên dưới) và điền URL backend vào `frontend/assets/js/config.js` — nếu không các trang trên GitHub Pages sẽ không gọi được API.

> `package-lock.json` trong `backend/` được commit sẵn để CI cài đặt phụ thuộc nhanh và ổn định — không xoá file này.

## Cài đặt & chạy

Yêu cầu: **Node.js >= 18** (đã có `fetch` sẵn, không cần cài thêm).

```bash
cd backend
npm install
cp .env.example .env     # chỉnh sửa JWT_SECRET, PORT nếu cần
npm start
```

Server sẽ chạy tại `http://localhost:4000` và **tự động phục vụ luôn cả frontend** (mở thẳng `http://localhost:4000` trên trình duyệt máy tính hoặc điện thoại trong cùng mạng LAN là dùng được ngay — không cần cấu hình gì thêm).

> ⚠️ **Không mở file `index.html` bằng cách double-click / kéo vào trình duyệt.** Khi mở kiểu `file://`, trình duyệt chặn toàn bộ API, `localStorage` và `manifest.json` (lỗi "Failed to fetch", CORS "origin null"...). Luôn chạy `npm start` rồi truy cập qua `http://localhost:4000`.

### Deploy frontend lên GitHub Pages / Netlify / Vercel (tách riêng backend)

**GitHub Pages KHÔNG chạy được Node.js** — nó chỉ phục vụ file tĩnh (HTML/CSS/JS). Nếu bạn push cả repo này lên và bật GitHub Pages, mọi lời gọi API sẽ báo lỗi **405/404/"Failed to fetch"** vì không có backend nào đang chạy phía sau. Cách làm đúng:

1. **Deploy `backend/`** lên một nơi chạy được Node.js: [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io), hoặc VPS riêng. Nhớ đặt biến môi trường `JWT_SECRET`, `PORT` trong phần cấu hình của dịch vụ (dựa theo `.env.example`).
2. Sau khi deploy xong, bạn sẽ có 1 URL backend, ví dụ `https://edupulse-backend.onrender.com`.
3. Mở file `frontend/assets/js/config.js` và sửa:
   ```js
   window.EDUPULSE_API_BASE = 'https://edupulse-backend.onrender.com';
   ```
4. Push riêng thư mục `frontend/` lên GitHub Pages/Netlify/Vercel như bình thường — mọi trang sẽ tự gọi API tới backend đã deploy ở bước 1.
5. Trong `backend/.env`, đặt `CORS_ORIGIN` bằng đúng domain frontend của bạn (VD: `https://your-username.github.io`) để backend chấp nhận request từ đó.

Nếu frontend và backend chạy **chung 1 server** (cách mặc định ở mục cài đặt phía trên), để nguyên `config.js` với giá trị rỗng `''` — không cần sửa gì.


## Tài khoản Admin mặc định

Được khởi tạo tự động trong `backend/db.js`, **giữ nguyên đúng như tài khoản admin gốc trong `main.html`**:

| Trường | Giá trị |
|---|---|
| Tài khoản | `tungnguyenADMIN12345678` |
| Mật khẩu | `Tunglaihoclaptrinhmobile@1142010ADMIN` |
| Vai trò | `admin` |

> Khuyến nghị: sau khi triển khai thật, vào **Cài Đặt Tài Khoản** để đổi mật khẩu, hoặc dùng trang **Quản Lý Tài Khoản** để tạo thêm admin phụ rồi giới hạn quyền tài khoản gốc.

## Đưa dự án lên Internet (HTTPS)

1. Triển khai `backend/` lên VPS/hosting Node.js bất kỳ (Render, Railway, VPS riêng, v.v.) — nhớ đặt `JWT_SECRET` mạnh trong `.env` và bật HTTPS (qua reverse proxy Nginx/Caddy hoặc dịch vụ hosting có sẵn SSL).
2. Trỏ tên miền về server đó — toàn bộ frontend đã được phục vụ kèm theo, không cần thêm bước nào khác.
3. Các "Dự Án" mà người dùng công khai trong mục **Dự Án & Website** sẽ tự động có đường dẫn công khai dạng `https://your-domain.com/p/ten-du-an`.

## Ghi chú kỹ thuật

- CSDL dùng file JSON (`backend/data/db.json`) — không cần cài native module, chạy được trên Windows/macOS/Linux/Termux. Muốn nâng cấp lên PostgreSQL/MongoDB cho quy mô lớn, chỉ cần thay nội dung `backend/db.js` (`getDB`/`saveDB`) mà không phải sửa các route khác.
- AI IDE dùng dịch vụ chạy mã công khai [Piston](https://github.com/engineer-man/piston) (`emkc.org/api/v2/piston`) — cần kết nối Internet. Nếu mạng bị chặn, danh sách ngôn ngữ sẽ dùng bộ dự phòng tĩnh và tính năng "Chạy Code" sẽ báo lỗi kết nối.
- Chat thời gian thực dùng WebSocket thuần (`ws`), tự động fallback sang REST (`/api/messages`) nếu WebSocket không kết nối được.
- Toàn bộ mã nguồn được tổ chức theo REST route riêng biệt theo từng tính năng để dễ bảo trì và nâng cấp thêm sau này.

## Giấy phép

Phát hành theo giấy phép MIT — xem file [LICENSE](LICENSE).
