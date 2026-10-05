# ShopLink – danh sách rương (GitHub Pages + Supabase)

Thiết bị mới tự sinh ID `device_<uuid>`, gửi yêu cầu, chờ Admin duyệt. Việc chặn/cho phép đọc dữ liệu được thực thi ở **server** bằng Row Level Security (không chỉ ẩn giao diện).

## 1. Supabase
1. Tạo project tại supabase.com (gói miễn phí).
2. SQL Editor → dán toàn bộ `schema.sql` → Run.
3. Authentication → Users → Add user (email + mật khẩu) cho admin. Tắt "Allow new users to sign up" ở Authentication → Providers → Email.
4. Chạy: `insert into public.admins select id from auth.users where email = 'email-admin-cua-ban';`
5. Project Settings → API: chép **Project URL** và **anon public key** vào `config.js`. Không bao giờ đưa `service_role` key vào repo.

## 2. GitHub Pages
1. Tạo repo, đẩy toàn bộ file (index.html, admin.html, common.js, style.css, config.js).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Trang người dùng: `https://<user>.github.io/<repo>/`  ·  Trang Admin: `.../admin.html`

## 3. Dùng
- Người dùng mở trang → thấy màn hình CHƯA CẤP PHÉP + ID thiết bị → gửi ID cho Admin.
- Admin đăng nhập `admin.html` → Duyệt. Máy người dùng tự mở khóa trong ~3 giây.
- Thêm rương bằng form hoặc JSON (`id`, `type` = box|tele|clover|bag, `cur`, `max`, `flag`, `rate`, `views`, `level`, `note`, `link`). Trùng mã sẽ được cập nhật, không nhân đôi.

## 4. Nạp dữ liệu tự động từ nguồn hợp lệ
Dịch vụ của bạn (server, GitHub Action…) có quyền dùng nguồn dữ liệu đó có thể gọi REST của Supabase với `service_role` key lưu trong **Secrets**:

    curl -X POST "$SUPABASE_URL/rest/v1/chests?on_conflict=code" \
      -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
      -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates" \
      -d '[{"code":"R12808","type":"box","cur":50,"max":30,"rate":1.7,"views":124,"link":"https://..."}]'

## Lưu ý
- ID thiết bị là bí mật mang tính "bearer": ai biết ID đã duyệt thì dùng được. Thu hồi trong trang Admin khi cần.
- Người lạ có thể gửi nhiều yêu cầu pending; xóa trong tab Chờ duyệt. Có thể bật CAPTCHA/giới hạn tốc độ của Supabase nếu bị spam.
- Dữ liệu cập nhật bằng polling 3 giây (Realtime không mang được header ID thiết bị).
