# UEH WorkHub – Điều phối công việc

Web giao việc & theo dõi deadline cho chương trình UEH – Rennes (cử nhân song bằng), palette màu logo UEH.

## Tính năng
- **Dự án & thành viên**: mỗi dự án có Quản lý / Thành viên. Ai được thêm vào dự án đều thấy toàn bộ công việc, thảo luận và lịch sử cập nhật của dự án đó.
- **Giao việc**: người phụ trách (nhiều người), hạng mục (10 hạng mục vận hành), ngày bắt đầu, deadline, ưu tiên, nhãn, việc con, checklist, mô tả.
- **Quy trình duyệt**: Chưa bắt đầu → Đang thực hiện → *Gửi duyệt* → Quản lý *Duyệt hoàn thành* hoặc *Yêu cầu chỉnh sửa*.
- **Thông báo**: khi được giao, đổi hạn, bình luận, @nhắc tên, gửi/duyệt; cảnh báo việc quá hạn và sắp đến hạn.
- **Các chế độ xem (kiểu Quire)**: Danh sách dạng cây theo hạng mục, Kanban kéo-thả, Timeline/Gantt, Tổng quan (heatmap deadline, tạo mới vs hoàn thành, khối lượng theo thành viên, rủi ro), Lịch deadline, Portfolio health.

## Chạy local
```bash
npm install
npm run dev
```

## Chế độ dữ liệu
- **Demo** (mặc định): dữ liệu lưu trong trình duyệt, đăng nhập bằng cách chọn nhân sự mẫu.
- **Dùng chung (Supabase)**: đặt `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (xem `.env.example`), rồi chạy lần lượt trong SQL Editor:
  1. `supabase/schema.sql` – bảng dữ liệu
  2. `supabase/security.sql` – khóa quyền (chỉ xem dự án mình tham gia, tham gia bằng mã, chặn tự nâng quyền)
  3. `supabase/add-admin.sql` – khai báo quản trị đầu tiên (sửa email)
  4. `supabase/seed-rennes.sql` – tạo dự án UEH – Rennes + in ra mã tham gia

  Ai cũng tự đăng ký được nhưng chỉ là Nhân sự; muốn vào dự án phải nhập mã do quản lý cung cấp (tab Thành viên của dự án).
