# Thiệp cưới Văn Tuấn - Mỹ Dung

Trang tĩnh để đăng bằng GitHub Pages. Mở `index.html` để xem bản nháp.

Trang mặc định bằng tiếng Việt. Khách có thể đổi sang tiếng Anh bằng nút **VI / EN** ở đầu trang; lựa chọn được giữ khi tải lại. Có thể chia sẻ trực tiếp bản tiếng Anh bằng cách thêm `?lang=en` vào URL.

Bản VI giữ các tiêu đề và dòng trang trí tiếng Anh như mẫu tham khảo; thông tin sự kiện và biểu mẫu bằng tiếng Việt. `reference-fonts.css` dùng chính các font được trang mẫu tải từ `assets.cinelove.me`; trang hiện phụ thuộc vào máy chủ font đó. Font dự phòng đã được cấu hình nếu nguồn này ngừng hoạt động.

## Nội dung đã nhập từ thiệp giấy

- Nhà gái: 18/10/2026, Lễ Vu Quy 09:00 tại tư gia nhà gái, tiệc 10:00 tại Nhà Văn Hóa Thôn Tân Quý, Xã Chiên Đàn, TP. Đà Nẵng.
- Nhà trai: 25/10/2026, tiệc 10:00 tại gia đình nhà trai, TDP Tống Văn, P. Trần Lãm, T. Hưng Yên.
- Cha mẹ nhà gái: Huỳnh Đức Dũng và Phạm Thị Vinh.
- Cha mẹ nhà trai: Nguyễn Văn Thanh và Mai Thị Loan.

## Cần hoàn thiện

1. Ảnh cưới nằm trong `assets/photos/` (bản web ~2200px). `photos.js` tự cắt/phóng to quanh người dựa trên vị trí khuôn mặt trong `photos-data.js`; chỉnh tay từng ảnh bằng `PHOTO_TWEAKS`. Ảnh cho từng vị trí đặt bằng `data-photo` trong `index.html`, album dùng `data-photos` của `.album-grid`.
2. Cung cấp địa chỉ chính xác/Google Maps pin của từng địa điểm. Link hiện tại chỉ tìm theo tên, chưa xác thực đúng cổng vào.
3. Tạo Google Form theo [GOOGLE_FORM.md](GOOGLE_FORM.md), rồi gửi link trả lời để kết nối. Phần xác nhận hiện thông báo “sắp mở”; biểu mẫu được ẩn để không nhận dữ liệu vào nơi chưa kết nối.
4. Nhạc nền `assets/music.mp3` phát nguyên bài, lặp lại. Trang tự phát khi mở; nếu trình duyệt chặn tự phát (đa số điện thoại), nhạc bắt đầu ngay khi khách chạm vào màn hình lần đầu. Đĩa nhạc quay ở góc phải trên để tắt/bật.

Website: `https://teddyvantuan-bit.github.io/teddy-sunny/`.

Thiết kế được viết lại từ đầu theo bố cục tham khảo của CineLove; không sao chép ảnh, mã hay nhạc của trang mẫu.

## Tính năng mới (09/2026)

- **Xác nhận tham dự + lời chúc** lưu vào Google Sheet "Thiệp cưới – Xác nhận tham dự & Lời chúc" (script trong `backend/Code.gs`, link web app trong `config.js`). Bỏ tick "Hiện trên web" để ẩn một lời chúc.
- **Link mời riêng:** mở `tao-link.html`, dán danh sách tên khách → mỗi khách một link `?to=Tên&side=bride|groom`.
- **Hiệu ứng:** chữ/ảnh hiện dần khi cuộn (1,3s), cánh hoa rơi, ảnh bìa zoom chậm (`extras.js`, `extras.css`).
- **Ảnh xem trước khi chia sẻ link:** `assets/og.jpg`.
