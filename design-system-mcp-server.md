# Design System MCP Server

## Goal

Design System'i (headless renkler, farklı dosyalardaki tipografi ve UI bileşenleri) Claude/Cursor gibi araçların doğrudan okuyabilmesi ve projelere tam uyumlu kod (şimdilik ağırlıklı React, ileride Flutter/Swift eklenebilir) üretebilmesi için SSE (Server-Sent Events) tabanlı bir MCP sunucusu geliştirmek.

## Tasks

- [ ] Task 1: Proje iskeletinin oluşturulması (Node.js, TypeScript, pnpm/npm) → Verify: `package.json` ve `tsconfig.json` dosyalarının varlığı.
- [ ] Task 2: `@modelcontextprotocol/sdk` ve gerekli paketlerin (Express ortamında SSE için) kurulması → Verify: SDK'nın node_modules içinde olması.
- [ ] Task 3: Express/Hono tabanlı veya standart Node HTTP ile SSE Transport katmanının kurulması → Verify: `/sse` veya `/message` endpointlerinin çalışır durumda olması.
- [ ] Task 4: Tasarım sistemindeki "okunabilir" kaynakların (Resources) tanımlanması (`design-system://tokens/colors`, `design-system://tokens/typography`) → Verify: MCP sunucusunun `resources/list` isteğine doğru yanıt vermesi.
- [ ] Task 5: Component bazlı "Tool" ların programlanması (örn: `get_button_component`, `get_input_component` vb. veya jenerik `get_component(name)`) → Verify: MCP sunucusunun `tools/call` ile istenen bileşenin import'unu ve kodunu dönmesi.
- [ ] Task 6: LLM'leri yönlendirecek "Prompt"ların eklenmesi (örn: "Design system kullanarak form oluştur") → Verify: `prompts/list` isteğine yanıt alınması.
- [ ] Task 7: Birden fazla platform desteği için (React, Flutter, Swift) altyapının hazırlanması (Resource veya Tool parametrelerine platform bilgisinin eklenmesi) → Verify: `get_component(name="button", platform="flutter")` tarzı bir yapının desteklenmesi.
- [ ] Task 8: Lokal ortamda Claude Desktop veya mcp-inspector ile SSE üzerinden test edilmesi → Verify: Inspector üzerinden ilgili tool'ların hatasız çağrılabilmesi.

## Done When

- [ ] MCP Sunucusu SSE protokolünde ayağa kalkıyor.
- [ ] `resources`, `tools`, `prompts` endpointleri listeleme yapabiliyor.
- [ ] Belirli bir bileşenin (örn: Button) kodu MCP üzerinden string olarak eksiksiz alınabiliyor.
- [ ] Platforma (React, Flutter vb.) göre bileşen/token getirme mantığı kurgulanmış durumda.
