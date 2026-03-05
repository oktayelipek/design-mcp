# Wallet Design Rules & Patterns (BTCTurk Edition)

Bu doküman, Figma DevMode MCP (`get_design_context`) üzerinden analiz edilen **Wallet (Cüzdan)** sayfasındaki görsel kuralları, Atomic Design bileşenlerini ve platformlar arası (Web, iOS, Android) uygulama standartlarını tanımlar.

## 1. Sayfa Yapısı & Hiyerarşi (Layout)

- **Header (Navigation Control)**:
  - **Title**: `Title 03/Semibold` (20px), "Varlıklarım".
  - **Icons**: Sağ tarafta 3'lü grup (Varlık Analizi, Bildirim, Profil). İkon kutusu `26x26px`, iç ikon `20x20px`.
  - **Tab Bar**: Sayfa başlığının altında sticky olarak yer alır.
    - **Tabs**: "Tümü", "Kripto", "Hisse".
    - **Active State**: `text/focus` rengi, altında `2px` yükseklik ve full-width `Rail` (çizgi).
    - **Inactive State**: `text/tertiary` (#4c5d72).
    - **Spacing**: Tab'ler arası `16px`.

- **Bilgi Panelleri (InfoRow)**:
  - **Deposit Warning**: `actions/action-03` (#ffac2b) renginde, `%10 opacity` arka plan ve `%20 opacity` border ile (`rounded-10px`).
  - **Padding**: `16px` iç boşluk. Gap: `16px`.

- **Cüzdan Özet Kartı (Balance Card)**:
  - **Arka Plan**: `level/elevation` (#131f2f).
  - **Border Radius**: `10px`.
  - **Spacing**: Kart içindeki elementler arası dikey gap: `20px` (Başlık ve Tutar arası), `16px` (Tutar ve Aksiyonlar arası).

## 2. Boşluk Standartları (8-Point Grid)

- **Genel Padding**: `16px`.
- **Dikey Gap (Vertical Stack)**:
  - **Balance <-> PNL**: `16px` (Ayracı üstten kesen `level/elevation +2` border).
  - **PNL <-> Quick Actions**: `16px`.
- **Hızlı Aksiyonlar (Buttons)**:
  - Grid: 3'lü kolon, arası `10px`.
  - Buton İç Padding: `8px` dikey, `36px` yatay (Subtle Large).

## 3. Bileşen Bazlı Kurallar (Atoms & Molecules)

### 3.1. Varlık Listesi (Asset List)

- **Header (Stickly Controls)**:
  - `Asset List Search+Button`: Altında `1px` `level/elevation` border.
  - **Düşük Bakiyeleri Gizle**: Solda `Checkbox` (24x24) + `Caption` (12px).
  - **Dönüştür Linki**: Sağda `Caption` + `20px` ikon.
- **Liste Satırı (Asset List Item)**:
  - **Dikey Padding**: `12px` (Daha sıkı bir görünüm için).
  - **Sol Taraf**: İkon (`28px`) + 2px boşluk + Ticker (`Asset/Semibold` 15px).
  - **Sağ Taraf**: Tutar (`Asset/Semibold` 15px) + Sub-price (`Footnote` 11px).

### 3.2. Kar/Zarar (PNL) Analizi

- **Prefix**: Pozitif değerlerde `+`, negatif değerlerde `-` karakteri zorunludur.
- **Color Coding**:
  - Pozitif: `actions/action-01` (#4fa963).
  - Negatif: `actions/action-02` (#e93a40).
- **Typography**: Yüzdelik oran her zaman `12px Medium` (Caption).

## 4. Renk & Tipografi Karşılıkları (Tokens)

| Element                  | Token Path              | Value (HEX)             |
| :----------------------- | :---------------------- | :---------------------- |
| Focus Text               | `text/focus`            | #f0f4f7                 |
| Muted/Secondary          | `text/secondary`        | #858fa6                 |
| Main Card Background     | `level/elevation`       | #131f2f                 |
| Warning Bar (Background) | `actions/action-03-10%` | rgba(255, 172, 43, 0.1) |
| Asset Amount             | `font-size/Asset`       | 15px                    |
| Table Headers            | `font-size/Micro UI 03` | 8px (Uppercase)         |

---

_Son Güncelleme: 2026-03-05 (Figma DevMode Analizi ile Detaylandırıldı)_
