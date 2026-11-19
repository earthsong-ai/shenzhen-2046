"""Link the two vendored ES modules inside isolated scopes for offline playback."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fields(spec):
    for entry in spec.split(','):
        names = entry.strip().split(' as ')
        yield names[0], names[-1]


def link(filename, namespace):
    source = (ROOT / 'vendor' / filename).read_text()
    def use(match):
        bindings = ','.join(f'{a}:{b}' for a, b in fields(match[1]))
        return 'const {' + bindings + '} = Core;'
    source = re.sub(r'import\s*\{([^}]+)\}\s*from\s*["\']\./three.core.min.js["\'];?', use, source)
    source = re.sub(r'export\s*\{[^}]+\}\s*from\s*["\']\./three.core.min.js["\'];?', '', source)
    match = re.search(r'export\s*\{([^}]+)\};?\s*$', source)
    if not match:
        raise ValueError('Unexpected vendor export format')
    exports = ','.join(f'{b}:{a}' for a, b in fields(match[1]))
    inherit = '...Core,' if namespace == 'THREE' else ''
    return f'const {namespace}=(()=>{{\n' + source[:match.start()] + '\nreturn {' + inherit + exports + '};})();\n'


bundle = link('three.core.min.js', 'Core') + link('three.module.min.js', 'THREE')
bundle += '\n'.join(p.read_text() for p in sorted((ROOT / 'src').glob('*.js')))
html = (ROOT / 'src/shell.html').read_text()
html = html.replace('<!-- LICENSE -->', '<!--\n' + (ROOT / 'vendor/LICENSE').read_text() + '-->')
output = ROOT / 'dist/shenzhen2046.html'
output.parent.mkdir(exist_ok=True)
output.write_text(html.replace('/* BUNDLE */', bundle.replace('</script', r'<\/script')))
print(output, output.stat().st_size, 'bytes')
