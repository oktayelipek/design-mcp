import os
import json
import shutil

comps_path = 'src/data/components/_registry.json'
mods_path = 'src/data/modules/_registry.json'

with open(comps_path) as f:
    comps = json.load(f)['components']
with open(mods_path) as f:
    mods = json.load(f)['modules']

os.makedirs('src/data/atoms', exist_ok=True)
os.makedirs('src/data/molecules', exist_ok=True)
os.makedirs('src/data/organisms', exist_ok=True)

atoms = []
molecules = []
organisms = []

for c in comps:
    src_file = f"src/data/components/{c['file']}"
    if c['category'] == 'atom':
        if os.path.exists(src_file):
            shutil.copy(src_file, f"src/data/atoms/{c['file']}")
            atoms.append(c)
    elif c['category'] == 'molecule':
        if os.path.exists(src_file):
            shutil.copy(src_file, f"src/data/molecules/{c['file']}")
            molecules.append(c)

for m in mods:
    src_file = f"src/data/modules/{m['file']}"
    if os.path.exists(src_file):
        shutil.copy(src_file, f"src/data/organisms/{m['file']}")
        organisms.append(m)

with open('src/data/atoms/_registry.json', 'w') as f:
    json.dump({"components": atoms}, f, indent=2)
with open('src/data/molecules/_registry.json', 'w') as f:
    json.dump({"components": molecules}, f, indent=2)
with open('src/data/organisms/_registry.json', 'w') as f:
    # Rename modules to components array or organisms
    json.dump({"components": organisms}, f, indent=2)

print("Folders created and populated.")
