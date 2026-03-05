import { Button } from './components/button';
import { Badge } from './components/badge';
import { Input } from './components/input';
import { Radio } from './components/radio';

function App() {
  return (
    <div className="min-h-screen p-8 bg-[var(--level-basement)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="mb-12 border-b border-[var(--level-elevation-\+1)] pb-4">
          <h1 className="text-3xl font-bold">🎨 BTCTurk Design System - Playground</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            These are the production-ready React snippet components we extracted & mapped from Figma.
          </p>
        </header>

        {/* --- BUTTONS --- */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-focus)] mb-4">Button Component (FK-Button)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="Solid">CTA Text</Button>
            <Button variant="Solid Focus">CTA Text</Button>
            <Button variant="Outline">CTA Text</Button>
            <Button variant="Outline Focus">CTA Text</Button>
            <Button variant="Solid" disabled>CTA Text</Button>
          </div>
          <div className="flex gap-4 items-center mt-6 p-4 rounded bg-[#ffffff08]">
            <Button variant="Solid" size="Small">CTA Text</Button>
            <Button variant="Solid" size="Medium">CTA Text</Button>
            <Button variant="Solid" size="Large" typeProps="Icon+Text">CTA Text</Button>
          </div>
        </section>

        {/* --- BADGES --- */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-focus)] mb-4">Badge Component</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="Default" type="Subtle">Default Subtle</Badge>
            <Badge variant="Success" type="Subtle">Success Subtle</Badge>
            <Badge variant="Error" type="Subtle">Error Subtle</Badge>
            <Badge variant="Success" type="Subtle" dot>With Dot</Badge>
            <Badge variant="Default" size="Small">Small</Badge>
            <Badge variant="Error" size="Large" dot>Large Error</Badge>
          </div>
        </section>

        {/* --- INPUTS --- */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-focus)] mb-4">Input Component</h2>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Default Input" placeholder="Enter text here..." />
            <Input label="Success Input" state="success" placeholder="Valid data" assistiveText="Input verified." />
            <Input label="Error Input" state="error" placeholder="Invalid data" assistiveText="Please check this format." />
            <Input label="Disabled Input" state="disabled" placeholder="Cannot type..." />
          </div>
        </section>

        {/* --- RADIOS --- */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-focus)] mb-4">Radio Component</h2>
          <div className="flex flex-col gap-4">
            <Radio name="demoRadio" state="Default" label="Default Option" />
            <Radio name="demoRadio" state="Enable" label="Selected Option (Enable CSS)" defaultChecked />
            <Radio name="demoRadio" state="Disabled" label="Disabled Option" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
