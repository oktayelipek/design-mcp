import json

print("Reading JSON file...")
with open("data_dump/fk_wallet_page.json", "r") as f:
    data = json.load(f)

print("Searching for components...")
def find_component_sets(node, results):
    if not isinstance(node, dict):
        return
        
    t = node.get("type")
    
    # "COMPONENT_SET" corresponds to the root wrapper of components like {FKRadio}
    if t in ["COMPONENT_SET", "COMPONENT"]:
        results.append(node)
        
    for child in node.get("children", []):
        find_component_sets(child, results)

sets = []
doc = data.get("document", {})
find_component_sets(doc, sets)

print(f"Found {len(sets)} Component Sets.")

for s in sets:
    print(f"\n=== SET: {s.get('name')} ===")
    
    props = s.get("componentPropertyDefinitions", {})
    print("Props:", list(props.keys()))
    
    variants = s.get("children", [])
    print(f"Total variants: {len(variants)}\n")
    
    # Only show up to 3 variants to prevent spam
    for v in variants[:5]:
        print(f"  Variant: {v.get('name')}")
        
        # We need to find the colors. Look at the sub-layers of this variant.
        for child in v.get("children", []):
            print(f"    └─ Layer: {child.get('name')} (Type: {child.get('type')})")
            
            # boundVariables typically stores references to design tokens in Figma
            b_vars = child.get("boundVariables", {})
            if b_vars and "fills" in b_vars:
                # E.g. {"fills": [{"type": "VARIABLE_ALIAS", "id": "VariableID:123"}]}
                for alias in b_vars["fills"]:
                    print(f"       ✅ Bound Fill Variable: {alias.get('id')}")
            
            # The fills array has the literal hex/rgba colors
            fills = child.get("fills", [])
            for fill in fills:
                if fill.get("type") == "SOLID":
                    color = fill.get("color", {})
                    r, g, b, a = color.get("r", 0), color.get("g", 0), color.get("b", 0), color.get("a", 1)
                    # Convert rgba [0-1] to hex just for reading easily
                    hex_color = "#{:02x}{:02x}{:02x}".format(int(r*255), int(g*255), int(b*255))
                    print(f"       🎨 Fill Color: {hex_color} (Alpha: {a})")

print("\nFinished parsing.")
