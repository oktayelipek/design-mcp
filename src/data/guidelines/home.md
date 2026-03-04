# Home Page Design Rules & Patterns

Bu doküman, Figma MCP (`get_design_context`) üzerinden analiz edilen **Home Page (Ana Sayfa)** modülündeki görsel kuralları ve bileşen desenlerini tanımlar.

## 1. Sayfa Yapısı (Layout & Hierarchy)

- **Header / Top Bar**: Sayfa başlığı ve profil/bildirim ikonlarını içeren üst alan.
- **Bakiye Özeti**: Kullanıcının toplam varlığını gösteren vurgulu alan.
- **Hızlı Aksiyonlar**: Al/Sat, Yatır/Çek gibi sık kullanılan butonlar.
- **Takip Edilen Pozisyonlar (Positions List)**:
  - Liste başlığı: `Takip Ettiğim Pozisyonlar`.
  - Liste yapısı: `12px` radiuslu, `var(--level/elevation, #131f2f)` arka planlı konteyner.
  - Alt kısımdaki "Tümünü Gör" butonu: `14px` dikey padding, üstten border'lı.
- **Pazarlama Banner'ları (Marketing Banners)**:
  - Yatay kaydırılabilir (swipeable) kartlar.
  - Boyut: `264px` genişlik, `108px` içerik yüksekliği.
  - Kenarlık: `1px solid rgba(255,255,255,0.1)`.
  - Arka Plan: Gradyanlar (örn: `rgba(0, 95, 174, 0.2)` mavi tonlu).

## 2. Boşluk Kuralları (Spacing)

- **Grid Sistemi**: Standart `16px` sayfa kenar boşluğu.
- **Modüller Arası Mesafe**: `24px` veya dikey stack yapısında `16px`.
- **Pozisyon Satırı Padding**: `16px` (İçerik ile kenar arası).
- **Eleman Arası Boşluklar**:
  - İkon ve Metin arası: `8px`.
  - Başlık ve Liste arası: `16px`.

## 3. Renk & Durum Kuralları (Colors & States)

- **Fiyat Değişim Renkleri**:
  - Pozitif Değişim: `var(--actions/action-01, #4fa963)`.
  - Negatif Değişim: `var(--actions/action-02, #e93a40)`.
- **Zemin Renkleri**:
  - Ana Yüzey: `var(--level/surface, #0b0f1a)`.
  - İkincil Konteyner: `var(--level/elevation, #131f2f)`.
- **Metin Renkleri**:
  - Odaklanmış/Ana Başlıklar: `var(--text/focus, #f0f4f7)`.
  - İkincil/Açıklama: `var(--text/secondary, #858fa6)`.

## 4. Tipografi (Typography)

- **Pozisyon Başlığı**: `13px` Medium (`Inter Variable`).
- **Ticker (BTC/ETH)**: `14px` SemiBold.
- **Pazarlama Metinleri**: `13px` SemiBold, `18px` satır yüksekliği.
- **Alt Değerler/Tarihler**: `10px` Medium (`micro-ui-01`).

## 5. Görsel Öğeler & İkonlar

- **Varlık İkonları**: Genellikle `24x24px` veya maskelenmiş SVG yapısı.
- **Banner Görselleri**: `140x140px` alan içinde, genellikle sağa yaslı.
- **Oklar / Chevron**: Listelerin sağında `8x4.2px` boyutunda, genellikle `90deg` döndürülmüş.

---

_Son Güncelleme: 2026-03-04 (Figma Context Analizi)_
