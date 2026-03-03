# Design System MCP Server

## Goal

Design System'i (headless renkler, farklı dosyalardaki tipografi ve UI bileşenleri) Claude/Cursor gibi araçların doğrudan okuyabilmesi ve projelere tam uyumlu kod (şimdilik ağırlıklı React, ileride Flutter/Swift eklenebilir) üretebilmesi için SSE (Server-Sent Events) tabanlı bir MCP sunucusu geliştirmek.

## Tasks

- [x] Task 1: Proje iskeletinin oluşturulması (Node.js, TypeScript, pnpm/npm) → Verify: `package.json` ve `tsconfig.json` dosyalarının varlığı.
- [x] Task 2: `@modelcontextprotocol/sdk` ve gerekli paketlerin (Express ortamında SSE için) kurulması → Verify: SDK'nın node_modules içinde olması.
- [x] Task 3: Express/Hono tabanlı veya standart Node HTTP ile SSE Transport katmanının kurulması → Verify: `/sse` veya `/message` endpointlerinin çalışır durumda olması.
- [x] Task 4: Design System verilerinin (Renk, Tipografi, Component specleri) `src/data` klasöründe yapılandırılması (Renk/Tipografi için `.json`, Component specleri için `.md` veya `.ts` formatlarında hazırlanması) → Verify: İlgili `colors.json`, `typography.json` ve `components/Button.md` vb. örnek dosyaların varlığı.
- [ ] Task 5: Tasarım sistemindeki "okunabilir" kaynakların (Resources) oluşturulan data dosyalarından okunarak tanımlanması (`design-system://tokens/colors`, `design-system://tokens/typography`) → Verify: MCP sunucusunun `resources/list` isteğine doğru yanıt vermesi.
- [ ] Task 6: Component bazlı "Tool" ların programlanması (örn: `get_button_component`, `get_input_component` vb. veya jenerik `get_component(name)`) ve data dosyalarından beslenmesi → Verify: MCP sunucusunun `tools/call` ile istenen bileşenin import'unu ve kodunu dönmesi.
- [ ] Task 7: LLM'leri yönlendirecek "Prompt"ların eklenmesi (örn: "Design system kullanarak form oluştur") → Verify: `prompts/list` isteğine yanıt alınması.
- [ ] Task 8: Birden fazla platform desteği için (React, Flutter, Swift) altyapının hazırlanması (Resource veya Tool parametrelerine platform bilgisinin eklenmesi) → Verify: `get_component(name="button", platform="flutter")` tarzı bir yapının desteklenmesi.
- [ ] Task 9: Lokal ortamda Claude Desktop veya mcp-inspector ile SSE üzerinden test edilmesi → Verify: Inspector üzerinden ilgili tool'ların hatasız çağrılabilmesi.

## Done When

- [ ] MCP Sunucusu SSE protokolünde ayağa kalkıyor.
- [ ] `resources`, `tools`, `prompts` endpointleri listeleme yapabiliyor.
- [ ] Belirli bir bileşenin (örn: Button) kodu MCP üzerinden string olarak eksiksiz alınabiliyor.
- [ ] Platforma (React, Flutter vb.) göre bileşen/token getirme mantığı kurgulanmış durumda.
