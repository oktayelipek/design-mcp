# Wallet Design Rules & Patterns

Bu doküman, Figma MCP (`get_design_context`) üzerinden analiz edilen **Wallet (Cüzdan)** sayfasındaki görsel kuralları ve Atomic Design desenlerini tanımlar.

## 1. Sayfa Hiyerarşisi (Layout)

- **Top Bar**: Sabit (Sticky) header, sayfa başlığı (`Cüzdan`) ve sağda bildirim/ayar ikonları.
- **Bakiye Kartı (Balance Card)**: En üstte, sayfa genişliğinde (padding sonrası `343px`), `var(--level/elevation, #131f2f)` arka plan rengine sahip ana kart.
- **Varlık Listesi (Asset List)**: Bakiye kartının altında, dikey olarak uzanan liste yapısı.

## 2. Boşluk Kuralları (Spacing)

- **Sayfa Kenar Boşluğu**: `16px`.
- **Modüller Arası Boşluk**: `16px` (Bakiye kartı ile Liste arası).
- **Kart İçi Padding**: `16px`.
- **Varlık Satırı Padding**: `16px` dikey, `16px` yatay.
- **Dikey Gruplama (Stacking Control)**:
  - Toplam Bakiye ile PNL Analizi arası: `20px`.
  - Hızlı Aksiyon Butonları arası: `10px`.

## 3. Renk & Durum Kuralları (Colors & States)

- **PNL (Kar/Zarar)**:
  - Pozitif: `var(--actions/action-01, #4fa963)` (Yeşil).
  - Negatif: `var(--actions/action-02, #e93a40)` (Kırmızı).
- **Metin Hiyerarşisi**:
  - Odaklanmış/Ana Başlıklar: `var(--text/focus, #f0f4f7)`.
  - İkincil Bilgiler (Maliyet, Yaklaşık Değer): `var(--text/secondary, #858fa6)`.
- **Arka Plan**:
  - Ana Sayfa: `var(--level/surface, #0b0f1a)`.
  - Kartlar: `var(--level/elevation, #131f2f)`.

## 4. Tipografi (Typography)

- **Toplam Bakiye**: `24px` SemiBold (`Inter Variable`).
- **Varlık Ticker (BTC/ETH)**: `15px` SemiBold, Tracking: `-0.2px`.
- **Birimler (TRY/USDT)**: `12px` Medium, her zaman ana değerin sağında veya altında.
- **Feragatname (Disclaimer)**: `12px` Medium, listenin en altında sağa yaslı.

## 5. İkonografi

- **Varlık İkonları**: `28x28px` daire içinde.
- **Aksiyon İkonları**: `20x20px`.
- **PNL Okları**: Değerin solunda, rengine uygun (yukarı/aşağı).

---

_Son Güncelleme: 2026-03-04 (Figma MCP Context Analizi)_
