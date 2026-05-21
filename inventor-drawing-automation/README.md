# Inventor — Tự động xuất bản vẽ tủ điện sheet metal

Bộ script này tự động sinh **bản vẽ lắp ráp + bản vẽ chi tiết** cho file `.iam`
dạng tấm thép (tủ điện) trong **Autodesk Inventor Professional 2026**
(test OK trên 2022+).

Output:
- `Sheet 1` – bản vẽ tổng: 4 hình chiếu (Front / Right / Back / Top) + Isometric
  + BOM tổng + khung text dự án (TU…, DU AN, RAL, SO LUONG).
- `Sheet 2+` – mỗi sheet **4 part** (lưới 2×2): folded view + side view +
  **flat pattern** + mini-BOM riêng cho part đó.
- File `.idw` và `.pdf` lưu cùng folder với file `.iam`.

Mẫu output mong muốn (xem file `TU-W550xH1050xD250xT1.2.pdf` đính kèm trong thread).

---

## 1. Cài đặt (lần đầu)

1. Chép file `ExportSheetMetalAssembly.iLogicVb` vào 1 folder cố định, ví dụ
   `D:\iLogic-Rules\ExportSheetMetalAssembly.iLogicVb`.
2. Mở Inventor 2026 → tab **Manage** → **iLogic Browser**.
3. Trong cửa sổ iLogic Browser → tab **External Rules** → click **+** →
   trỏ tới file `.iLogicVb` vừa chép.
4. (Tùy chọn) Click chuột phải vào rule → **Add to Quick Access Toolbar**
   để chạy 1 click.

> Lưu ý: Inventor 2026 chỉ chấp nhận đuôi `.iLogicVb`. Nếu Windows ẩn đuôi
> mở rộng, hãy bật **View › File name extensions** trong File Explorer.

---

## 2. Cấu hình

Mở file `.iLogicVb` bằng Notepad (hoặc trực tiếp trong iLogic editor),
chỉnh các biến ở mục **CẤU HÌNH NGƯỜI DÙNG** ở đầu file:

```vb
Dim cfgProjectName    = "CN LINK"   ' tên dự án in trong khung text
Dim cfgRAL            = "7035"      ' mã sơn RAL
Dim cfgQuantity       = "02"        ' số lượng tủ
Dim cfgDesigner       = "Admin"     ' designer field title block
Dim cfgDefaultMaterial = "T.DEN 1.2"' vật liệu fallback ghi BOM khi part chưa set Material

Dim cfgAssemblyScale  = 1.0 / 5.0   ' tỉ lệ bản vẽ tổng       (1:5)
Dim cfgPartScale      = 1.0 / 5.0   ' tỉ lệ bản vẽ chi tiết    (1:5)
Dim cfgDetailScale    = 1.5         ' tỉ lệ view detail bend  (1.5:1)
Dim cfgPartsPerSheet  = 4           ' số part / sheet chi tiết

Dim cfgSheetSize      = kA3DrawingSheetSize   ' kA0..kA4
Dim cfgLandscape      = True

Dim cfgAddDetailViews = True        ' auto detail view cho góc bend
Dim cfgAddSectionFF   = False       ' section F-F (cần custom thêm)
Dim cfgSavePDF        = True
Dim cfgSaveIDW        = True
Dim cfgOverwrite      = True
Dim cfgOutputFolder   = ""          ' "" = cùng folder .iam
Dim cfgTemplatePath   = ""          ' "" = template Inventor mặc định
```

---

## 3. Sử dụng

1. Trong Inventor, mở file `.iam` của tủ (ví dụ `TU W550xH1050xD250xT1.2.iam`).
2. Đảm bảo tất cả part bên trong đã set **Material = T.DEN 1.2** (hoặc material
   khác – script tự đọc). Part nào chưa có Material sẽ dùng `cfgDefaultMaterial`.
3. Đảm bảo **Part Number** của mỗi part được set đúng (BODY, BOTTOM, TOP-2,…) —
   đây là khóa gom nhóm và là dòng hiển thị trong BOM.
4. iLogic Browser → click chuột phải `ExportSheetMetalAssembly` → **Run Rule**.
5. Chờ Inventor chạy. Khi xong sẽ hiện hộp thoại "Hoàn tất" báo đường dẫn
   file `.idw` và `.pdf`.

---

## 4. Quy ước iProperties cần có trên từng part

| Field        | Vai trò                                                   |
|--------------|-----------------------------------------------------------|
| Part Number  | Mã chi tiết (BODY, TOP-2…) — hiện trong BOM               |
| Material     | Vật liệu (T.DEN 1.2) — cột Vật liệu trong BOM             |
| Description  | (tùy chọn) mô tả                                          |

Set trong Inventor: chọn part → **iProperties → Project/Summary** tab.

---

## 5. Tùy chỉnh nâng cao

**Đổi layout sheet 1**: tìm hàm `BuildAssemblySheet`, chỉnh `cxFront`, `cyFront`,
`dx`, `dy` (đơn vị **cm**). A3 ngang có kích thước 42 × 29.7 cm.

**Đổi số part per sheet**: chỉnh `cfgPartsPerSheet` và sửa hằng `rows` trong
`BuildPartSheets` (mặc định 2 hàng × 2 cột = 4 ô).

**Section view F-F**: bật `cfgAddSectionFF = True`. Section line mặc định cắt
ngang chính giữa, theo phương thẳng đứng của front view. Muốn thay đổi vị trí,
sửa `pts(0)` / `pts(1)` trong hàm `BuildAssemblySheet`.

**Title block tự động**: rule có sẵn gọi `SetAssemblyIProperties()` để điền
Designer, Project, Stock Number, Description vào iProperties. Title block của
template Inventor sẽ tự đọc các field này — không cần sửa template.

---

## 6. Troubleshooting

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Báo "Vui lòng mở file lắp ráp" | Đang mở `.ipt` hoặc `.idw`. Cần mở `.iam`. |
| Flat pattern không sinh | Part không phải Sheet Metal. Convert: **3D Model → Sheet Metal → Convert to Sheet Metal**. |
| BOM rỗng | Part Number bị trùng `null` hoặc tất cả part đặt cùng 1 Part Number. Xem mục 4. |
| Title block trống | Template Inventor cũ. Update template hoặc set iProperties thủ công. |
| Lỗi `AddBaseView` | Part bị suppress hoặc file bị thiếu reference. Mở `.iam`, click **Update** trước. |
| View quá lớn vượt khung | Hàm `AutoFitScale` tự giảm tỉ lệ. Nếu vẫn lớn, set `cfgPartScale = 1.0/10.0` (1:10). |

---

## 7. File trong folder

```
inventor-drawing-automation/
├── ExportSheetMetalAssembly.iLogicVb   ← script chính
├── README.md                            ← file này
└── samples/
    └── TU-W550xH1050xD250xT1.2.pdf      ← bản vẽ mẫu (output mong muốn)
```

---

## 8. License & feedback

Free to modify cho mục đích nội bộ. Có lỗi / muốn thêm tính năng (section view
tự động, balloon callout, danh sách bend table…), tạo PR hoặc reply tại
thread Capy.
